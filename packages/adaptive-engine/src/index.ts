export interface WeaknessSignal {
  topicId: string;
  conceptKey: string;
  severity: number;
  hesitationMs?: number;
}

export interface RevisionCandidate {
  topicId: string;
  reason: string;
  dueAt: Date;
  priority: number;
}

export { getWeaknessSignals } from "./weakness-detector";
export {
  recordQuizAttempt,
  recordMistake,
  type QuizAttemptInput,
  type MistakeInput,
} from "./mistake-tracker";
export { generateRecommendations } from "./recommendation-engine";
export { getRevisionQueue, type RevisionQueueEntry } from "./revision-queue";
