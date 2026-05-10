import fs from "fs/promises";
import path from "path";

import { getAllContentFiles } from "./load-topics";
import { parseTopic } from "../parser/parse-topic";

export async function getAllTopics() {
  const files = await getAllContentFiles();

  const topics = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(file, "utf8");

      const parsed = parseTopic(raw);

      const slug = file
        ?.split("content/")[1]
        ?.replace(/\.mdx$/, "")

      return {
        slug,
        path: file,
        ...parsed,
      };
    })
  );

  return topics;
}