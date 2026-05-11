import type { KnowledgeGraph } from '@aethon/shared';

/**
 * GraphEngine builds and traverses the knowledge graph of topics and their
 * prerequisite relationships. Only `prerequisite` type relationships are used
 * for adjacency maps; other relation types (related, dependency, etc.) are ignored.
 */
export class GraphEngine {
    /**
     * outgoing: topicId → Set of prerequisite topic IDs
     * (i.e. "what does this topic require?")
     */
    private readonly outgoing: Map<string, Set<string>>;

    /**
     * incoming: topicId → Set of topic IDs that depend on this topic
     * (i.e. "what topics require this one?")
     */
    private readonly incoming: Map<string, Set<string>>;

    constructor(graph: KnowledgeGraph) {
        this.outgoing = new Map();
        this.incoming = new Map();

        // Seed every topic so nodes with no edges still appear in the maps
        for (const topic of graph.topics) {
            if (!this.outgoing.has(topic.id)) {
                this.outgoing.set(topic.id, new Set());
            }
            if (!this.incoming.has(topic.id)) {
                this.incoming.set(topic.id, new Set());
            }
        }

        // Only process prerequisite relationships
        for (const rel of graph.relationships) {
            if (rel.type !== 'prerequisite') continue;

            const { sourceTopicId, targetTopicId } = rel;

            // outgoing: source requires target (target is a prerequisite of source)
            if (!this.outgoing.has(sourceTopicId)) {
                this.outgoing.set(sourceTopicId, new Set());
            }
            this.outgoing.get(sourceTopicId)!.add(targetTopicId);

            // incoming: target is depended upon by source
            if (!this.incoming.has(targetTopicId)) {
                this.incoming.set(targetTopicId, new Set());
            }
            this.incoming.get(targetTopicId)!.add(sourceTopicId);
        }
    }

    /**
     * Returns the direct prerequisite topic IDs for the given topic.
     * These are the topics that must be completed before this one.
     */
    getPrerequisites(topicId: string): string[] {
        return Array.from(this.outgoing.get(topicId) ?? []);
    }

    /**
     * Returns the topic IDs that list the given topic as a prerequisite.
     * These are the topics that depend on (come after) the given topic.
     */
    getDependents(topicId: string): string[] {
        return Array.from(this.incoming.get(topicId) ?? []);
    }

    /**
     * Returns the given topic IDs sorted in topological order using Kahn's
     * algorithm (BFS-based). Topics with no prerequisites come first.
     *
     * Only processes the subgraph reachable from the provided topicIds.
     * Throws if a cycle is detected within the subgraph.
     */
    getTopologicalOrder(topicIds: string[]): string[] {
        const nodeSet = new Set(topicIds);

        // Build in-degree count restricted to the subgraph
        const inDegree = new Map<string, number>();
        for (const id of nodeSet) {
            inDegree.set(id, 0);
        }

        for (const id of nodeSet) {
            const prereqs = this.outgoing.get(id) ?? new Set();
            for (const prereq of prereqs) {
                if (nodeSet.has(prereq)) {
                    inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
                }
            }
        }

        // Queue starts with all nodes that have no prerequisites in the subgraph
        const queue: string[] = [];
        for (const [id, degree] of inDegree) {
            if (degree === 0) queue.push(id);
        }

        const result: string[] = [];

        while (queue.length > 0) {
            const current = queue.shift()!;
            result.push(current);

            // For each topic that depends on current (i.e. current is a prereq of dependent)
            const dependents = this.incoming.get(current) ?? new Set();
            for (const dependent of dependents) {
                if (!nodeSet.has(dependent)) continue;
                const newDegree = (inDegree.get(dependent) ?? 0) - 1;
                inDegree.set(dependent, newDegree);
                if (newDegree === 0) {
                    queue.push(dependent);
                }
            }
        }

        if (result.length !== nodeSet.size) {
            // Cycle detected — find and report it
            const cycles = this.detectCycles();
            if (cycles && cycles.length > 0) {
                const cyclePath = cycles[0].join(' → ');
                throw new Error(`Cycle detected: ${cyclePath}`);
            }
            throw new Error('Cycle detected in the topic graph (topological sort failed)');
        }

        return result;
    }

    /**
     * Detects cycles in the full graph using DFS with a visiting set.
     * Returns an array of cycle paths (each path is an array of topic IDs
     * forming the cycle), or null if no cycles exist.
     */
    detectCycles(): string[][] | null {
        const visited = new Set<string>();
        const visiting = new Set<string>();
        const cycles: string[][] = [];

        const dfs = (topicId: string, path: string[]): void => {
            if (visiting.has(topicId)) {
                // Found a cycle — extract the cycle portion of the path
                const cycleStart = path.indexOf(topicId);
                const cyclePath = [...path.slice(cycleStart), topicId];
                cycles.push(cyclePath);
                return;
            }
            if (visited.has(topicId)) return;

            visiting.add(topicId);
            path.push(topicId);

            const prereqs = this.outgoing.get(topicId) ?? new Set();
            for (const prereq of prereqs) {
                dfs(prereq, path);
            }

            path.pop();
            visiting.delete(topicId);
            visited.add(topicId);
        };

        for (const topicId of this.outgoing.keys()) {
            if (!visited.has(topicId)) {
                dfs(topicId, []);
            }
        }

        return cycles.length > 0 ? cycles : null;
    }

    /**
     * Traverses the prerequisite chain from weakTopicId using BFS, returning
     * topics in order from most foundational to the weak topic itself.
     *
     * This gives the learner a path of topics to revisit, starting from the
     * deepest prerequisite and working up to the topic they struggled with.
     */
    getRecommendationPath(weakTopicId: string): string[] {
        const visited = new Set<string>();
        const queue: string[] = [weakTopicId];
        const bfsOrder: string[] = [];

        visited.add(weakTopicId);

        while (queue.length > 0) {
            const current = queue.shift()!;
            bfsOrder.push(current);

            const prereqs = this.outgoing.get(current) ?? new Set();
            for (const prereq of prereqs) {
                if (!visited.has(prereq)) {
                    visited.add(prereq);
                    queue.push(prereq);
                }
            }
        }

        // BFS gives us [weakTopic, prereqs...] — reverse to get most foundational first
        return bfsOrder.reverse();
    }
}
