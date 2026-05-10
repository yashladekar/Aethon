export const topicDifficulties = ["beginner", "intermediate", "advanced", "expert"] as const;
export const topicKinds = [
  "concept",
  "lesson",
  "project",
  "tool",
  "practice",
  "system_design",
] as const;
export const roadmapNodeKinds = [
  "topic",
  "milestone",
  "checkpoint",
  "capstone",
  "practice",
  "review",
] as const;

export type TopicDifficulty = (typeof topicDifficulties)[number];
export type TopicKind = (typeof topicKinds)[number];
export type RoadmapNodeKind = (typeof roadmapNodeKinds)[number];

export interface GraphReference {
  id: string;
  slug: string;
  title: string;
}

export interface GraphRelationship {
  sourceTopicId: string;
  targetTopicId: string;
  type: string;
}
