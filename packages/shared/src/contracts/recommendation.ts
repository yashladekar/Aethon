import { recommendationTypes, recommendationStatuses } from '../constants/recommendation.ts';

export type RecommendationType = (typeof recommendationTypes)[number];
export type RecommendationStatus = (typeof recommendationStatuses)[number];

export interface RecommendationContract {
    id: string;
    userId: string;
    topicId: string;
    type: RecommendationType;
    status: RecommendationStatus;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}
