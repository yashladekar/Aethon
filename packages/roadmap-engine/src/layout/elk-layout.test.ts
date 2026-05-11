import { describe, it, expect } from 'vitest';
import { computeElkLayout } from './elk-layout.js';
import type { RoadmapDocument } from '../schema/roadmap-document.schema.js';

describe('computeElkLayout', () => {
    it('should return the document unchanged when all nodes have positions', async () => {
        const document: RoadmapDocument = {
            id: 'roadmap-1',
            title: 'Test Roadmap',
            nodes: [
                { id: 'n1', label: 'Node 1', kind: 'topic', positionX: 10, positionY: 20 },
                { id: 'n2', label: 'Node 2', kind: 'topic', positionX: 30, positionY: 40 },
            ],
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        };

        const result = await computeElkLayout(document);

        expect(result).toBe(document); // same reference — no layout needed
    });

    it('should compute positions when at least one node is missing positionX', async () => {
        const document: RoadmapDocument = {
            id: 'roadmap-2',
            title: 'Test Roadmap',
            nodes: [
                { id: 'n1', label: 'Node 1', kind: 'topic', positionX: 10, positionY: 20 },
                { id: 'n2', label: 'Node 2', kind: 'topic' }, // missing positions
            ],
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        };

        const result = await computeElkLayout(document);

        expect(result).not.toBe(document); // new object
        expect(result.id).toBe('roadmap-2');
        expect(result.nodes).toHaveLength(2);
        for (const node of result.nodes) {
            expect(node.positionX).toBeDefined();
            expect(node.positionY).toBeDefined();
            expect(typeof node.positionX).toBe('number');
            expect(typeof node.positionY).toBe('number');
        }
    });

    it('should compute positions when nodes are missing positionY', async () => {
        const document: RoadmapDocument = {
            id: 'roadmap-3',
            title: 'Test Roadmap',
            nodes: [
                { id: 'n1', label: 'Node 1', kind: 'milestone', positionX: 10 }, // missing positionY
                { id: 'n2', label: 'Node 2', kind: 'topic', positionX: 30, positionY: 40 },
            ],
            edges: [],
        };

        const result = await computeElkLayout(document);

        expect(result).not.toBe(document);
        for (const node of result.nodes) {
            expect(node.positionX).toBeDefined();
            expect(node.positionY).toBeDefined();
        }
    });

    it('should handle a document with no edges', async () => {
        const document: RoadmapDocument = {
            id: 'roadmap-4',
            title: 'No Edges',
            nodes: [
                { id: 'n1', label: 'Node 1', kind: 'topic' },
                { id: 'n2', label: 'Node 2', kind: 'topic' },
                { id: 'n3', label: 'Node 3', kind: 'topic' },
            ],
            edges: [],
        };

        const result = await computeElkLayout(document);

        expect(result.nodes).toHaveLength(3);
        for (const node of result.nodes) {
            expect(typeof node.positionX).toBe('number');
            expect(typeof node.positionY).toBe('number');
        }
    });

    it('should produce distinct positions for connected nodes in a chain', async () => {
        const document: RoadmapDocument = {
            id: 'roadmap-5',
            title: 'Chain',
            nodes: [
                { id: 'a', label: 'A', kind: 'topic' },
                { id: 'b', label: 'B', kind: 'topic' },
                { id: 'c', label: 'C', kind: 'topic' },
            ],
            edges: [
                { id: 'e1', source: 'a', target: 'b' },
                { id: 'e2', source: 'b', target: 'c' },
            ],
        };

        const result = await computeElkLayout(document);

        // In a layered layout with DOWN direction, nodes in a chain should have increasing Y
        const nodeA = result.nodes.find((n) => n.id === 'a')!;
        const nodeB = result.nodes.find((n) => n.id === 'b')!;
        const nodeC = result.nodes.find((n) => n.id === 'c')!;

        expect(nodeA.positionY!).toBeLessThan(nodeB.positionY!);
        expect(nodeB.positionY!).toBeLessThan(nodeC.positionY!);
    });

    it('should return an immutable copy (not mutate the original)', async () => {
        const document: RoadmapDocument = {
            id: 'roadmap-6',
            title: 'Immutable Test',
            nodes: [
                { id: 'n1', label: 'Node 1', kind: 'topic' },
                { id: 'n2', label: 'Node 2', kind: 'topic' },
            ],
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        };

        const result = await computeElkLayout(document);

        // Original should not be mutated
        expect(document.nodes[0]!.positionX).toBeUndefined();
        expect(document.nodes[0]!.positionY).toBeUndefined();
        // Result should have positions
        expect(result.nodes[0]!.positionX).toBeDefined();
        expect(result.nodes[0]!.positionY).toBeDefined();
    });
});
