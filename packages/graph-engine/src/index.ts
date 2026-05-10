import type { GraphReference, GraphRelationship } from "@Aethon/shared";

export interface KnowledgeGraph {
  topics: GraphReference[];
  relationships: GraphRelationship[];
}

export interface GraphHighlightRequest {
  focusTopicId: string;
  includePrerequisites?: boolean;
  includeDependents?: boolean;
}
