import { topicDifficulties, topicKinds, topicStatuses } from '../constants/topic.ts';

export type TopicDifficulty = (typeof topicDifficulties)[number];
export type TopicKind = (typeof topicKinds)[number];
export type TopicStatus = (typeof topicStatuses)[number];

export interface TopicContract {
    id: string;
    slug: string;
    title: string;
    description: string;
    summary?: string | null;
    difficulty: TopicDifficulty;
    kind: TopicKind;
    status: TopicStatus;
    estimatedMinutes: number;
    canonicalPath: string;
    tags: string[];
    usageContexts: string[];
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
