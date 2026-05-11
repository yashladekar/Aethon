import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { roadmapDocumentSchema } from './roadmap-document.schema.js';

const ROADMAPS_DIR = resolve(import.meta.dirname, '../../../../content/roadmaps');

describe('roadmap JSON data files', () => {
    it('content/roadmaps/frontend.json validates against roadmapDocumentSchema', () => {
        const filePath = resolve(ROADMAPS_DIR, 'frontend.json');
        const raw = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);

        const result = roadmapDocumentSchema.safeParse(parsed);

        if (!result.success) {
            const errors = result.error.issues
                .map((i) => `[${i.path.join('.')}] ${i.message}`)
                .join('\n');
            throw new Error(`Schema validation failed:\n${errors}`);
        }

        expect(result.success).toBe(true);
    });

    it('frontend.json has at least 8 nodes', () => {
        const filePath = resolve(ROADMAPS_DIR, 'frontend.json');
        const raw = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const result = roadmapDocumentSchema.parse(parsed);

        expect(result.nodes.length).toBeGreaterThanOrEqual(8);
    });

    it('frontend.json has nodes with topicId references', () => {
        const filePath = resolve(ROADMAPS_DIR, 'frontend.json');
        const raw = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const result = roadmapDocumentSchema.parse(parsed);

        const nodesWithTopicId = result.nodes.filter((n) => n.topicId);
        expect(nodesWithTopicId.length).toBeGreaterThan(0);
    });

    it('frontend.json has prerequisite edges forming a DAG', () => {
        const filePath = resolve(ROADMAPS_DIR, 'frontend.json');
        const raw = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const result = roadmapDocumentSchema.parse(parsed);

        // Build adjacency list and check for cycles using DFS
        const adj = new Map<string, string[]>();
        for (const node of result.nodes) {
            adj.set(node.id, []);
        }
        for (const edge of result.edges) {
            adj.get(edge.source)!.push(edge.target);
        }

        const visited = new Set<string>();
        const visiting = new Set<string>();

        function hasCycle(nodeId: string): boolean {
            if (visiting.has(nodeId)) return true;
            if (visited.has(nodeId)) return false;

            visiting.add(nodeId);
            for (const neighbor of adj.get(nodeId) ?? []) {
                if (hasCycle(neighbor)) return true;
            }
            visiting.delete(nodeId);
            visited.add(nodeId);
            return false;
        }

        for (const node of result.nodes) {
            expect(hasCycle(node.id)).toBe(false);
        }
    });

    it('frontend.json includes a mix of node kinds', () => {
        const filePath = resolve(ROADMAPS_DIR, 'frontend.json');
        const raw = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const result = roadmapDocumentSchema.parse(parsed);

        const kinds = new Set(result.nodes.map((n) => n.kind));
        // Should have at least 3 different kinds (topic, milestone, checkpoint, etc.)
        expect(kinds.size).toBeGreaterThanOrEqual(3);
    });
});
