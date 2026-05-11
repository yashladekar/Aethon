export const topicRelationTypes = [
    'prerequisite',
    'related',
    'dependency',
    'foundation',
    'extends',
    'optimizes',
    'unlocks',
] as const;

export type TopicRelationType = (typeof topicRelationTypes)[number];

export interface GraphReference {
    id: string;
    slug: string;
    title: string;
}

export interface GraphRelationship {
    sourceTopicId: string;
    targetTopicId: string;
    type: TopicRelationType;
    strength?: number;
}

export interface KnowledgeGraph {
    topics: GraphReference[];
    relationships: GraphRelationship[];
}
