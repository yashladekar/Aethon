import prisma from "@aethon/db";

import type { WeaknessSignal } from "./index";

/**
 * Queries MistakeLog records for a user and returns ranked weakness signals
 * ordered by repeatedCount descending (most repeated mistakes first).
 */
export async function getWeaknessSignals(
    userId: string
): Promise<WeaknessSignal[]> {
    const mistakes = await prisma.mistakeLog.findMany({
        where: { userId },
        orderBy: { repeatedCount: "desc" },
    });

    return mistakes.map((m) => ({
        topicId: m.topicId,
        conceptKey: m.conceptKey,
        severity: m.repeatedCount,
        hesitationMs: m.hesitationMs ?? undefined,
    }));
}
