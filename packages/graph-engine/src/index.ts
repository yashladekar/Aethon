export { GraphEngine } from './graph-engine.js';

export type { GraphReference, GraphRelationship, KnowledgeGraph } from '@aethon/shared';

export interface GraphHighlightRequest {
  focusTopicId: string;
  includePrerequisites?: boolean;
  includeDependents?: boolean;
}
