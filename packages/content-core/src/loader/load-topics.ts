import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";

const CONTENT_PATH = path.join(
  process.cwd(),
  "../../content"
);
export async function getAllContentFiles() {
  const files = await fg(`${CONTENT_PATH}/**/*.mdx`)
  return files;
}