import { progressStatuses } from '../constants/learning.ts';

export type ProgressStatus = (typeof progressStatuses)[number];

export interface ProgressContract {
    id: string;
    userId: string;
    topicId: string;
    roadmapId?: string | null;
    roadmapNodeId?: string | null;
    status: ProgressStatus;
    masteryScore?: number | null;
    streak: number;
    lastActivityAt?: Date | null;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
