import { z } from 'zod';
import { roadmapNodeKinds, topicDifficulties } from '@aethon/shared';

// ─── Node Schema ──────────────────────────────────────────────────────────────

export const roadmapNodeSchema = z.object({
    id: z.string(),
    topicId: z.string().optional(),
    label: z.string(),
    kind: z.enum(roadmapNodeKinds),
    difficulty: z.enum(topicDifficulties).optional(),
    estimatedMinutes: z.number().int().positive().optional(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
});

// ─── Edge Schema ──────────────────────────────────────────────────────────────

export const roadmapEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
});

// ─── Document Schema ──────────────────────────────────────────────────────────

export const roadmapDocumentSchema = z
    .object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        nodes: z.array(roadmapNodeSchema),
        edges: z.array(roadmapEdgeSchema),
    })
    .superRefine((doc, ctx) => {
        const nodeIds = new Set(doc.nodes.map((n) => n.id));

        for (const edge of doc.edges) {
            if (!nodeIds.has(edge.source)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Edge "${edge.id}" references source node "${edge.source}" which does not exist in the nodes array`,
                    path: ['edges', doc.edges.indexOf(edge), 'source'],
                });
            }
            if (!nodeIds.has(edge.target)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Edge "${edge.id}" references target node "${edge.target}" which does not exist in the nodes array`,
                    path: ['edges', doc.edges.indexOf(edge), 'target'],
                });
            }
        }
    });

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type RoadmapNodeDefinition = z.infer<typeof roadmapNodeSchema>;
export type RoadmapEdgeDefinition = z.infer<typeof roadmapEdgeSchema>;
export type RoadmapDocument = z.infer<typeof roadmapDocumentSchema>;
