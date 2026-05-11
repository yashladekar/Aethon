'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    type Node,
    type Edge,
    type NodeTypes,
    type EdgeTypes,
    type OnNodeClick,
    MarkerType,
} from '@xyflow/react';
import type { ProgressStatus } from '@aethon/shared';
import type { RoadmapDocument } from '../schema/roadmap-document.schema.js';
import { computeElkLayout } from '../layout/elk-layout.js';
import { useRoadmapStore } from '../store/roadmap-store.js';
import { RoadmapNode, type RoadmapNodeData } from './RoadmapNode.js';
import { RoadmapEdge } from './RoadmapEdge.js';
import { RoadmapEmptyState } from './RoadmapEmptyState.js';

export interface RoadmapRendererProps {
    document: RoadmapDocument;
    progressByTopicId?: Record<string, ProgressStatus>;
    onNodeSelect?: (topicId: string) => void;
    className?: string;
}

const nodeTypes: NodeTypes = {
    roadmapNode: RoadmapNode,
};

const edgeTypes: EdgeTypes = {
    roadmapEdge: RoadmapEdge,
};

export function RoadmapRenderer({
    document: roadmapDoc,
    progressByTopicId,
    onNodeSelect,
    className,
}: RoadmapRendererProps) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    const { selectNode, setLayoutComputed } = useRoadmapStore();

    // Compute layout on mount or when document changes
    useEffect(() => {
        let cancelled = false;

        async function runLayout() {
            const layoutDoc = await computeElkLayout(roadmapDoc);

            if (cancelled) return;

            const flowNodes: Node[] = layoutDoc.nodes.map((node) => {
                const progressStatus = node.topicId
                    ? progressByTopicId?.[node.topicId]
                    : undefined;

                const data: RoadmapNodeData = {
                    label: node.label,
                    kind: node.kind,
                    difficulty: node.difficulty,
                    topicId: node.topicId,
                    progressStatus,
                };

                return {
                    id: node.id,
                    type: 'roadmapNode',
                    position: { x: node.positionX ?? 0, y: node.positionY ?? 0 },
                    data,
                };
            });

            const flowEdges: Edge[] = layoutDoc.edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'roadmapEdge',
                label: edge.label,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            }));

            setNodes(flowNodes);
            setEdges(flowEdges);
            setIsLayoutReady(true);
            setLayoutComputed(true);
        }

        void runLayout();

        return () => {
            cancelled = true;
        };
    }, [roadmapDoc, progressByTopicId, setLayoutComputed]);

    const handleNodeClick: OnNodeClick = useCallback(
        (_event, node) => {
            const nodeData = node.data as unknown as RoadmapNodeData;
            selectNode(node.id);

            if (nodeData.topicId && onNodeSelect) {
                onNodeSelect(nodeData.topicId);
            }
        },
        [onNodeSelect, selectNode],
    );

    const defaultEdgeOptions = useMemo(
        () => ({
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        }),
        [],
    );

    // Empty state
    if (roadmapDoc.nodes.length === 0) {
        return <RoadmapEmptyState />;
    }

    // Loading state while layout is being computed
    if (!isLayoutReady) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '300px',
                    color: '#6b7280',
                }}
            >
                Computing layout…
            </div>
        );
    }

    return (
        <div className={className} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
            >
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
                <Controls />
            </ReactFlow>
        </div>
    );
}
