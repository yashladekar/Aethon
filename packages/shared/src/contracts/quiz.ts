export interface QuizAttemptContract {
    id: string;
    userId: string;
    topicId: string;
    score: number;
    questionCount: number;
    correctCount: number;
    durationSeconds: number;
    hintsUsed: number;
    createdAt: Date;
}

export interface MistakeLogContract {
    id: string;
    userId: string;
    topicId: string;
    conceptKey: string;
    submittedAnswer?: string | null;
    expectedAnswer?: string | null;
    explanation?: string | null;
    hesitationMs?: number | null;
    repeatedCount: number;
    skipped: boolean;
    createdAt: Date;
    updatedAt: Date;
}
