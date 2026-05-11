'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ProgressStatus } from '@aethon/shared';
import type { RoadmapNodeDefinition } from '../schema/roadmap-document.schema';

export interface RoadmapNodeData extends Record<string, unknown> {
    label: string;
    kind: RoadmapNodeDefinition['kind'];
    difficulty?: RoadmapNodeDefinition['difficulty'];
    topicId?: string;
    progressStatus?: ProgressStatus;
}

const statusColors: Record<ProgressStatus | 'default', string> = {
    not_started: '#6b7280',
    in_progress: '#3b82f6',
    completed: '#10b981',
    mastered: '#10b981',
    skipped: '#9ca3af',
    default: '#6b7280',
};

const kindLabels: Record<RoadmapNodeDefinition['kind'], string> = {
    topic: '📖',
    milestone: '🏁',
    checkpoint: '✅',
    capstone: '🎓',
    practice: '💻',
    review: '🔄',
};

const difficultyIndicators: Record<NonNullable<RoadmapNodeDefinition['difficulty']>, string> = {
    beginner: '●○○○',
    intermediate: '●●○○',
    advanced: '●●●○',
    expert: '●●●●',
};

export function RoadmapNode({ data }: NodeProps) {
    const nodeData = data as unknown as RoadmapNodeData;
    const { label, kind, difficulty, progressStatus } = nodeData;
    const bgColor = statusColors[progressStatus ?? 'default'];

    return (
        <div
            style={{
                background: bgColor,
                borderRadius: '8px',
                padding: '12px 16px',
                minWidth: '160px',
                color: '#ffffff',
                fontSize: '13px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: '#fff' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>{kindLabels[kind]}</span>
                <span
                    style={{
                        fontSize: '10px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        padding: '1px 5px',
                        textTransform: 'capitalize',
                    }}
                >
                    {kind}
                </span>
            </div>

            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>

            {difficulty && (
                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                    {difficultyIndicators[difficulty]}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} style={{ background: '#fff' }} />
        </div>
    );
}
