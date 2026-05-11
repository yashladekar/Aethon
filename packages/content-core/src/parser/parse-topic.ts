import matter from "gray-matter";
import readingTime from "reading-time";
import { topicMetadataSchema, type TopicMetadata } from "../schema/topic-metadata.schema";

export function parseTopic(fileContent: string, filePath?: string): {
  metadata: TopicMetadata;
  content: string;
  readingTime: string;
} {
  const { data, content } = matter(fileContent);

  const result = topicMetadataSchema.safeParse(data);

  if (!result.success) {
    const location = filePath ? `"${filePath}"` : "unknown file";
    const message = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(
      `Topic frontmatter validation failed in ${location}:\n${message}`
    );
  }

  return {
    metadata: result.data,
    content,
    readingTime: readingTime(content).text,
  };
}
