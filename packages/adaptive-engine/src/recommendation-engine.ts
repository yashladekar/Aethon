import prisma from "@aethon/db";
import { GraphEngine } from "@aethon/graph-engine";
import type { KnowledgeGraph } from "@aethon/shared";

import { getWeaknessSignals } from "./weakness-detector";

/**
 * Computes the spaced-repetition due date based on repeatedCount.
 * Uses exponential backoff: dueAt = now + min(2^repeatedCount, 30) days.
 */
function computeDueAt(repeatedCount: number): Date {
    const days = Math.min(Math.pow(2, repeatedCount), 30);
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + days);
    return dueAt;
}

/**
 * Generates recommendations for a user based on their weakness signals.
 *
 * For each weakness signal:
 * 1. Gets the prerequisite chain via GraphEngine.getRecommendationPath()
 * 2. Skips topics where the user's Progress status is 'mastered'
 * 3. Upserts Recommendation records (updates priority if existing pending/surfaced record exists)
 * 4. Upserts RevisionQueue entries with spaced-repetition dueAt
 */
export async function generateRecommendations(
    userId: string,
    graph: KnowledgeGraph
): Promise<void> {
    const signals = await getWeaknessSignals(userId);
    const engine = new GraphEngine(graph);

    for (const signal of signals) {
        const path = engine.getRecommendationPath(signal.topicId);

        for (const topicId of path) {
            // Skip topics the user has already mastered
            const progress = await prisma.progress.findUnique({
                where: { userId_topicId: { userId, topicId } },
            });
            if (progress?.status === "mastered") continue;

            // Compute priority based on severity (repeatedCount)
            const priority = Math.min(signal.severity * 10, 100);

            // Upsert Recommendation: update priority if existing pending/surfaced record exists
            const existingRecommendation = await prisma.recommendation.findFirst({
                where: {
                    userId,
                    topicId,
                    type: "revision",
                    status: { in: ["pending", "surfaced"] },
                },
            });

            if (existingRecommendation) {
                await prisma.recommendation.update({
                    where: { id: existingRecommendation.id },
                    data: {
                        priority: Math.max(existingRecommendation.priority, priority),
                        updatedAt: new Date(),
                    },
                });
            } else {
                await prisma.recommendation.create({
                    data: {
                        userId,
                        topicId,
                        type: "revision",
                        status: "pending",
                        title: `Revise topic`,
                        summary: `Recommended revision based on weakness in ${signal.conceptKey}`,
                        reason: `Repeated mistakes (count: ${signal.severity}) detected for concept "${signal.conceptKey}"`,
                        priority,
                    },
                });
            }

            // Upsert RevisionQueue entry
            const dueAt = computeDueAt(signal.severity);

            const existingRevision = await prisma.revisionQueue.findFirst({
                where: {
                    userId,
                    topicId,
                    status: "pending",
                },
            });

            if (existingRevision) {
                // Update if the new dueAt is sooner (higher urgency)
                if (dueAt < existingRevision.dueAt) {
                    await prisma.revisionQueue.update({
                        where: { id: existingRevision.id },
                        data: {
                            dueAt,
                            priority: Math.max(existingRevision.priority, priority),
                            updatedAt: new Date(),
                        },
                    });
                }
            } else {
                await prisma.revisionQueue.create({
                    data: {
                        userId,
                        topicId,
                        reason: `Weakness detected in concept "${signal.conceptKey}" (severity: ${signal.severity})`,
                        priority,
                        dueAt,
                        status: "pending",
                    },
                });
            }
        }
    }
}
