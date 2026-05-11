import { contentRegistry } from "@aethon/content-core";
import { z } from "zod";

import { publicProcedure, router } from "../index";

export const topicsRouter = router({
    topicBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input }) => {
            await contentRegistry.initialize();
            const topic = contentRegistry.getTopicBySlug(input.slug);
            return topic ?? null;
        }),

    topicsForSearch: publicProcedure.query(async () => {
        await contentRegistry.initialize();
        return contentRegistry.getTopicsForSearch();
    }),
});
