export type LearningEventName =
  | "lesson_started"
  | "lesson_completed"
  | "quiz_submitted"
  | "sandbox_opened"
  | "roadmap_node_completed";

export interface LearningEvent {
  name: LearningEventName;
  userId: string;
  topicId?: string;
  roadmapId?: string;
  metadata?: Record<string, unknown>;
}
