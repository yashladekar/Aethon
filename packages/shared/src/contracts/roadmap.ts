import { roadmapStatuses, roadmapNodeKinds } from '../constants/roadmap.ts';
import type { TopicDifficulty } from './topic.js';

export type RoadmapStatus = (typeof roadmapStatuses)[number];
export type RoadmapNodeKind = (typeof roadmapNodeKinds)[number];

export interface RoadmapContract {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    icon?: string | null;
    theme?: string | null;
    status: RoadmapStatus;
    metadata: Record<string, unknown>;
    publishedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoadmapNodeContract {
    id: string;
    roadmapId: string;
    key: string;
    topicId?: string | null;
    label: string;
    kind: RoadmapNodeKind;
    difficulty?: TopicDifficulty | null;
    estimatedMinutes?: number | null;
    positionX?: number | null;
    positionY?: number | null;
    parentNodeId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
