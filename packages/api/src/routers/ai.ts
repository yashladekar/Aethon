import { TRPCError } from "@trpc/server";
import { contentRegistry } from "@aethon/content-core";
import { aiEngine } from "@aethon/ai-engine";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

export const aiRouter = router({
    generateQuiz: protectedProcedure
        .input(
            z.object({
                topicSlug: z.string(),
                questionCount: z.number().int().positive(),
                includeHints: z.boolean().optional(),
            })
        )
        .mutation(async ({ input }) => {
            await contentRegistry.initialize();
            const topic = contentRegistry.getTopicBySlug(input.topicSlug);

            if (!topic) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Topic with slug "${input.topicSlug}" not found`,
                });
            }

            return aiEngine.generateQuiz({
                topic,
                questionCount: input.questionCount,
                includeHints: input.includeHints,
            });
        }),

    generateSummary: protectedProcedure
        .input(z.object({ topicSlug: z.string() }))
        .mutation(async ({ input }) => {
            await contentRegistry.initialize();
            const topic = contentRegistry.getTopicBySlug(input.topicSlug);

            if (!topic) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Topic with slug "${input.topicSlug}" not found`,
                });
            }

            return aiEngine.generateSummary({ topic });
        }),
});
