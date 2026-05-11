// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { z } from "zod";
var topicDifficulties = ["beginner", "intermediate", "advanced", "expert"];
var topicMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(topicDifficulties),
  estimatedTime: z.number().int().positive(),
  prerequisites: z.array(z.string()).default([]),
  relatedTopics: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  usageContexts: z.array(z.string()).default([])
});
var docs = defineDocs({
  dir: "../../content",
  docs: {
    // Only include .mdx files — README.md files don't have topic frontmatter
    files: ["**/*.mdx"],
    schema: topicMetadataSchema
  }
});
var source_config_default = defineConfig({ mdxOptions: {} });
export {
  source_config_default as default,
  docs
};
