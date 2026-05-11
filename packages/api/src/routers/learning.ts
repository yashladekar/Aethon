import prisma from "@aethon/db";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

export const learningRouter = router({
    learnerProgress: protectedProcedure
        .input(z.object({ roadmapId: z.string() }))
        .query(async ({ ctx, input }) => {
            return prisma.progress.findMany({
                where: {
                    userId: ctx.session.user.id,
                    roadmapId: input.roadmapId,
                },
            });
        }),

    revisionQueue: protectedProcedure.query(async ({ ctx }) => {
        return prisma.revisionQueue.findMany({
            where: {
                userId: ctx.session.user.id,
                status: "pending",
            },
            orderBy: { dueAt: "asc" },
        });
    }),

    recommendations: protectedProcedure.query(async ({ ctx }) => {
        return prisma.recommendation.findMany({
            where: {
                userId: ctx.session.user.id,
                status: { in: ["pending", "surfaced"] },
            },
            orderBy: { priority: "desc" },
        });
    }),
});
