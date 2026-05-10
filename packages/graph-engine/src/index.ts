import type { GraphReference, GraphRelationship } from "@aethon/shared";

export interface KnowledgeGraph {
  topics: GraphReference[];
  relationships: GraphRelationship[];
}

export interface GraphHighlightRequest {
  focusTopicId: string;
  includePrerequisites?: boolean;
  includeDependents?: boolean;
}
