import type { TopicDocument } from "@Aethon/content-core";

export interface MentorContext {
  learnerId: string;
  currentTopicId?: string;
  activeRoadmapId?: string;
}

export interface QuizGenerationRequest {
  topic: TopicDocument;
  questionCount: number;
  includeHints?: boolean;
}
