import prisma from "@aethon/db";

export interface QuizAttemptInput {
    userId: string;
    topicId: string;
    roadmapNodeId?: string;
    score: number;
    questionCount: number;
    correctCount: number;
    durationSeconds?: number;
    hintsUsed?: number;
}

export interface MistakeInput {
    userId: string;
    topicId: string;
    quizAttemptId?: string;
    roadmapNodeId?: string;
    conceptKey: string;
    prompt?: string;
    submittedAnswer?: string;
    expectedAnswer?: string;
    explanation?: string;
    hesitationMs?: number;
    skipped?: boolean;
}

/**
 * Records a quiz attempt for a user on a topic.
 */
export async function recordQuizAttempt(
    data: QuizAttemptInput
): Promise<void> {
    await prisma.quizAttempt.create({
        data: {
            userId: data.userId,
            topicId: data.topicId,
            roadmapNodeId: data.roadmapNodeId,
            score: data.score,
            questionCount: data.questionCount,
            correctCount: data.correctCount,
            durationSeconds: data.durationSeconds,
            hintsUsed: data.hintsUsed ?? 0,
        },
    });
}

/**
 * Records a mistake, upserting on (userId, topicId, conceptKey).
 * If a record already exists for the same user/topic/concept, increments repeatedCount.
 */
export async function recordMistake(data: MistakeInput): Promise<void> {
    const existing = await prisma.mistakeLog.findFirst({
        where: {
            userId: data.userId,
            topicId: data.topicId,
            conceptKey: data.conceptKey,
        },
    });

    if (existing) {
        await prisma.mistakeLog.update({
            where: { id: existing.id },
            data: {
                repeatedCount: { increment: 1 },
                submittedAnswer: data.submittedAnswer ?? existing.submittedAnswer,
                expectedAnswer: data.expectedAnswer ?? existing.expectedAnswer,
                explanation: data.explanation ?? existing.explanation,
                hesitationMs: data.hesitationMs ?? existing.hesitationMs,
                skipped: data.skipped ?? existing.skipped,
                quizAttemptId: data.quizAttemptId ?? existing.quizAttemptId,
                roadmapNodeId: data.roadmapNodeId ?? existing.roadmapNodeId,
            },
        });
    } else {
        await prisma.mistakeLog.create({
            data: {
                userId: data.userId,
                topicId: data.topicId,
                conceptKey: data.conceptKey,
                quizAttemptId: data.quizAttemptId,
                roadmapNodeId: data.roadmapNodeId,
                prompt: data.prompt,
                submittedAnswer: data.submittedAnswer,
                expectedAnswer: data.expectedAnswer,
                explanation: data.explanation,
                hesitationMs: data.hesitationMs,
                repeatedCount: 1,
                skipped: data.skipped ?? false,
            },
        });
    }
}
