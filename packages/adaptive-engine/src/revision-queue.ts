import prisma from "@aethon/db";

export interface RevisionQueueEntry {
    id: string;
    userId: string;
    topicId: string;
    roadmapNodeId: string | null;
    recommendationId: string | null;
    reason: string;
    priority: number;
    dueAt: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}

/**
 * Returns pending revision queue entries for a user, ordered by dueAt ascending.
 * This gives the learner their most urgent revisions first.
 */
export async function getRevisionQueue(
    userId: string
): Promise<RevisionQueueEntry[]> {
    const entries = await prisma.revisionQueue.findMany({
        where: {
            userId,
            status: "pending",
        },
        orderBy: {
            dueAt: "asc",
        },
    });

    return entries;
}
