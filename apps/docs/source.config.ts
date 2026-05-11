import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { z } from 'zod';

// Inline the topicMetadataSchema here to avoid esbuild external-package issues
// with workspace TypeScript packages. This mirrors @aethon/content-core's schema.
const topicDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

const topicMetadataSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.enum(topicDifficulties),
    estimatedTime: z.number().int().positive(),
    prerequisites: z.array(z.string()).default([]),
    relatedTopics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    usageContexts: z.array(z.string()).default([]),
});

export const docs = defineDocs({
    dir: '../../content',
    docs: {
        // Only include .mdx files — README.md files don't have topic frontmatter
        files: ['**/*.mdx'],
        schema: topicMetadataSchema,
    },
});

export default defineConfig({ mdxOptions: {} });
