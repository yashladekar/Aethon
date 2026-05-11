import { describe, it, expect } from 'vitest';
import { GraphEngine } from './graph-engine.js';
import type { KnowledgeGraph } from '@aethon/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeGraph(
    topics: { id: string; slug: string; title: string }[],
    prereqs: [source: string, target: string][],
): KnowledgeGraph {
    return {
        topics,
        relationships: prereqs.map(([sourceTopicId, targetTopicId]) => ({
            sourceTopicId,
            targetTopicId,
            type: 'prerequisite' as const,
        })),
    };
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// Graph: variables → closures → use-effect
//        variables → functions → closures
const linearGraph = makeGraph(
    [
        { id: 'variables', slug: 'variables', title: 'Variables' },
        { id: 'functions', slug: 'functions', title: 'Functions' },
        { id: 'closures', slug: 'closures', title: 'Closures' },
        { id: 'use-effect', slug: 'use-effect', title: 'useEffect' },
    ],
    [
        ['closures', 'variables'],
        ['closures', 'functions'],
        ['use-effect', 'closures'],
    ],
);

// ─── Constructor / adjacency map ──────────────────────────────────────────────

describe('GraphEngine constructor', () => {
    it('builds without errors for an empty graph', () => {
        expect(() => new GraphEngine({ topics: [], relationships: [] })).not.toThrow();
    });

    it('ignores non-prerequisite relationship types', () => {
        const graph: KnowledgeGraph = {
            topics: [
                { id: 'a', slug: 'a', title: 'A' },
                { id: 'b', slug: 'b', title: 'B' },
            ],
            relationships: [
                { sourceTopicId: 'a', targetTopicId: 'b', type: 'related' },
                { sourceTopicId: 'a', targetTopicId: 'b', type: 'dependency' },
            ],
        };
        const engine = new GraphEngine(graph);
        expect(engine.getPrerequisites('a')).toEqual([]);
        expect(engine.getDependents('b')).toEqual([]);
    });
});

// ─── getPrerequisites ─────────────────────────────────────────────────────────

describe('getPrerequisites', () => {
    it('returns direct prerequisites for a topic', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getPrerequisites('closures').sort()).toEqual(['functions', 'variables']);
    });

    it('returns a single prerequisite', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getPrerequisites('use-effect')).toEqual(['closures']);
    });

    it('returns empty array for a topic with no prerequisites', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getPrerequisites('variables')).toEqual([]);
    });

    it('returns empty array for an unknown topic', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getPrerequisites('unknown-topic')).toEqual([]);
    });
});

// ─── getDependents ────────────────────────────────────────────────────────────

describe('getDependents', () => {
    it('returns topics that depend on the given topic', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getDependents('closures')).toEqual(['use-effect']);
    });

    it('returns multiple dependents', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getDependents('variables')).toEqual(['closures']);
    });

    it('returns empty array for a leaf topic (no dependents)', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getDependents('use-effect')).toEqual([]);
    });

    it('returns empty array for an unknown topic', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getDependents('unknown-topic')).toEqual([]);
    });
});

// ─── getTopologicalOrder ──────────────────────────────────────────────────────

describe('getTopologicalOrder', () => {
    it('returns topics in topological order (prerequisites before dependents)', () => {
        const engine = new GraphEngine(linearGraph);
        const order = engine.getTopologicalOrder(['variables', 'functions', 'closures', 'use-effect']);

        // variables and functions must come before closures
        expect(order.indexOf('variables')).toBeLessThan(order.indexOf('closures'));
        expect(order.indexOf('functions')).toBeLessThan(order.indexOf('closures'));
        // closures must come before use-effect
        expect(order.indexOf('closures')).toBeLessThan(order.indexOf('use-effect'));
    });

    it('returns a single topic unchanged', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getTopologicalOrder(['variables'])).toEqual(['variables']);
    });

    it('returns empty array for empty input', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getTopologicalOrder([])).toEqual([]);
    });

    it('only processes the subgraph of provided topicIds', () => {
        const engine = new GraphEngine(linearGraph);
        // Only ask for closures and variables — use-effect is excluded
        const order = engine.getTopologicalOrder(['closures', 'variables']);
        expect(order).toHaveLength(2);
        expect(order.indexOf('variables')).toBeLessThan(order.indexOf('closures'));
    });

    it('throws on a cycle within the subgraph', () => {
        const cycleGraph = makeGraph(
            [
                { id: 'a', slug: 'a', title: 'A' },
                { id: 'b', slug: 'b', title: 'B' },
            ],
            [
                ['a', 'b'],
                ['b', 'a'],
            ],
        );
        const engine = new GraphEngine(cycleGraph);
        expect(() => engine.getTopologicalOrder(['a', 'b'])).toThrow(/cycle/i);
    });
});

// ─── detectCycles ─────────────────────────────────────────────────────────────

describe('detectCycles', () => {
    it('returns null for an acyclic graph', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.detectCycles()).toBeNull();
    });

    it('detects a simple two-node cycle', () => {
        const cycleGraph = makeGraph(
            [
                { id: 'a', slug: 'a', title: 'A' },
                { id: 'b', slug: 'b', title: 'B' },
            ],
            [
                ['a', 'b'],
                ['b', 'a'],
            ],
        );
        const engine = new GraphEngine(cycleGraph);
        const cycles = engine.detectCycles();
        expect(cycles).not.toBeNull();
        expect(cycles!.length).toBeGreaterThan(0);
    });

    it('detects a self-loop', () => {
        const selfLoop = makeGraph(
            [{ id: 'a', slug: 'a', title: 'A' }],
            [['a', 'a']],
        );
        const engine = new GraphEngine(selfLoop);
        const cycles = engine.detectCycles();
        expect(cycles).not.toBeNull();
    });

    it('returns null for an empty graph', () => {
        const engine = new GraphEngine({ topics: [], relationships: [] });
        expect(engine.detectCycles()).toBeNull();
    });

    it('cycle path includes the repeated node at start and end', () => {
        const cycleGraph = makeGraph(
            [
                { id: 'closures', slug: 'closures', title: 'Closures' },
                { id: 'use-effect', slug: 'use-effect', title: 'useEffect' },
            ],
            [
                ['closures', 'use-effect'],
                ['use-effect', 'closures'],
            ],
        );
        const engine = new GraphEngine(cycleGraph);
        const cycles = engine.detectCycles();
        expect(cycles).not.toBeNull();
        const cycle = cycles![0]!;
        // The cycle path should start and end with the same node
        expect(cycle[0]).toEqual(cycle[cycle.length - 1]);
    });
});

// ─── getRecommendationPath ────────────────────────────────────────────────────

describe('getRecommendationPath', () => {
    it('returns topics from most foundational to the weak topic', () => {
        const engine = new GraphEngine(linearGraph);
        const path = engine.getRecommendationPath('use-effect');

        // use-effect should be last (it's the weak topic)
        expect(path[path.length - 1]).toEqual('use-effect');
        // closures should come before use-effect
        expect(path.indexOf('closures')).toBeLessThan(path.indexOf('use-effect'));
        // variables and functions should come before closures
        expect(path.indexOf('variables')).toBeLessThan(path.indexOf('closures'));
        expect(path.indexOf('functions')).toBeLessThan(path.indexOf('closures'));
    });

    it('returns just the topic itself when it has no prerequisites', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getRecommendationPath('variables')).toEqual(['variables']);
    });

    it('returns the topic itself for an unknown topic', () => {
        const engine = new GraphEngine(linearGraph);
        expect(engine.getRecommendationPath('unknown')).toEqual(['unknown']);
    });

    it('includes all topics in the prerequisite chain', () => {
        const engine = new GraphEngine(linearGraph);
        const path = engine.getRecommendationPath('use-effect');
        expect(path).toContain('use-effect');
        expect(path).toContain('closures');
        expect(path).toContain('variables');
        expect(path).toContain('functions');
    });
});

// ─── Model-based property: adjacency map vs linear scan ───────────────────────

describe('model-based property: adjacency map matches linear scan', () => {
    it('getPrerequisites matches filtering relationships array directly', () => {
        const engine = new GraphEngine(linearGraph);

        for (const topic of linearGraph.topics) {
            const fromEngine = engine.getPrerequisites(topic.id).sort();
            const fromLinearScan = linearGraph.relationships
                .filter(r => r.type === 'prerequisite' && r.sourceTopicId === topic.id)
                .map(r => r.targetTopicId)
                .sort();
            expect(fromEngine).toEqual(fromLinearScan);
        }
    });

    it('getDependents matches filtering relationships array directly', () => {
        const engine = new GraphEngine(linearGraph);

        for (const topic of linearGraph.topics) {
            const fromEngine = engine.getDependents(topic.id).sort();
            const fromLinearScan = linearGraph.relationships
                .filter(r => r.type === 'prerequisite' && r.targetTopicId === topic.id)
                .map(r => r.sourceTopicId)
                .sort();
            expect(fromEngine).toEqual(fromLinearScan);
        }
    });
});
