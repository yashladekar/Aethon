import { contentRegistry } from "@aethon/content-core";
import { buildSearchIndex, searchTopics, type SearchResult } from "@aethon/search-engine";
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

    search: publicProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ input }): Promise<SearchResult[]> => {
            await contentRegistry.initialize();
            const topics = contentRegistry.getTopicsForSearch();
            await buildSearchIndex(topics);
            return searchTopics(input.query);
        }),
});
