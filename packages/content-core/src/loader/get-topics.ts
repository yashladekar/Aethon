import fs from "fs/promises";

import { getAllContentFiles } from "./load-topics";
import { parseTopic } from "../parser/parse-topic";
import type { TopicDocument } from "../schema/topic-metadata.schema";

export async function getAllTopics(): Promise<TopicDocument[]> {
  const files = await getAllContentFiles();

  const topics = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(file, "utf8");

      const parsed = parseTopic(raw, file);

      const slug = file
        ?.split("content/")[1]
        ?.replace(/\.mdx$/, "");

      // Derive section from the first path segment after content/
      const section = (slug?.split("/")[0] ?? "frontend") as TopicDocument["section"];

      return {
        slug: slug ?? "",
        section,
        metadata: parsed.metadata,
        body: parsed.content,
      } satisfies TopicDocument;
    })
  );

  return topics;
}
