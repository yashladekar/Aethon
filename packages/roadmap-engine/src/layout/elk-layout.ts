import ELK from 'elkjs/lib/elk.bundled.js';
import type { RoadmapDocument } from '../schema/roadmap-document.schema';

const elk = new ELK();

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 80;

/**
 * Determines whether ELK layout computation is needed.
 * Returns true if at least one node is missing positionX or positionY.
 */
function needsLayout(document: RoadmapDocument): boolean {
    return document.nodes.some(
        (node) => node.positionX == null || node.positionY == null,
    );
}

/**
 * Computes automatic layout positions for a RoadmapDocument using ELK's layered algorithm.
 *
 * Only runs ELK when at least one node is missing position data (positionX/positionY).
 * Returns a new RoadmapDocument with positionX/positionY filled in for all nodes (immutable).
 */
export async function computeElkLayout(
    document: RoadmapDocument,
): Promise<RoadmapDocument> {
    if (!needsLayout(document)) {
        return document;
    }

    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': 'DOWN',
            'elk.spacing.nodeNode': '60',
            'elk.layered.spacing.nodeNodeBetweenLayers': '80',
        },
        children: document.nodes.map((node) => ({
            id: node.id,
            width: DEFAULT_NODE_WIDTH,
            height: DEFAULT_NODE_HEIGHT,
        })),
        edges: document.edges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })),
    };

    const layoutResult = await elk.layout(elkGraph);

    const positionMap = new Map<string, { x: number; y: number }>();
    for (const child of layoutResult.children ?? []) {
        positionMap.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
    }

    return {
        ...document,
        nodes: document.nodes.map((node) => {
            const position = positionMap.get(node.id);
            return {
                ...node,
                positionX: position?.x ?? node.positionX ?? 0,
                positionY: position?.y ?? node.positionY ?? 0,
            };
        }),
    };
}
