import type { RoadmapNodeKind, TopicDifficulty } from "@Aethon/shared";

export interface RoadmapNodeDefinition {
  id: string;
  topicId?: string;
  label: string;
  kind: RoadmapNodeKind;
  difficulty?: TopicDifficulty;
  estimatedMinutes?: number;
}

export interface RoadmapEdgeDefinition {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface RoadmapDocument {
  id: string;
  title: string;
  description?: string;
  nodes: RoadmapNodeDefinition[];
  edges: RoadmapEdgeDefinition[];
}
