import { topicDifficulties } from "@aethon/shared";
import { z } from "zod";
export * from "./loader/get-topics";
export * from "./loader/get-topic-by-slug";
export const topicMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(topicDifficulties),
  estimatedTime: z.number().int().positive(),
  prerequisites: z.array(z.string()).default([]),
  relatedTopics: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  usageContexts: z.array(z.string()).default([]),
});

export type TopicMetadata = z.infer<typeof topicMetadataSchema>;

export interface TopicDocument {
  slug: string;
  section: "frontend" | "backend" | "devops" | "database" | "system-design";
  metadata: TopicMetadata;
  body: string;
}
