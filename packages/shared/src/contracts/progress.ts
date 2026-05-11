import { revisionStatuses } from '../constants/learning.ts';

export type RevisionStatus = (typeof revisionStatuses)[number];

export interface RevisionQueueContract {
    id: string;
    userId: string;
    topicId: string;
    status: RevisionStatus;
    dueAt: Date;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
