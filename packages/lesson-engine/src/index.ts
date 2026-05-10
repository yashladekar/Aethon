import type { TopicDocument } from "@aethon/content-core";

export type LessonBlockType =
  | "callout"
  | "code-preview"
  | "quiz"
  | "diagram"
  | "interactive-terminal"
  | "exercise"
  | "expandable"
  | "steps";

export interface LessonWorkspace {
  topic: TopicDocument;
  blocks: LessonBlockType[];
}
