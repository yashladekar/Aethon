'use client';

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

export function RoadmapEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    style,
    markerEnd,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{ stroke: '#94a3b8', strokeWidth: 2, ...style }}
                markerEnd={markerEnd}
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${String(labelX)}px,${String(labelY)}px)`,
                            fontSize: '11px',
                            background: '#f8fafc',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
