import matter from "gray-matter";
import readingTime from "reading-time";

export function parseTopic(fileContent: string) {
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data,
    content,
    readingTime: readingTime(content).text,
  };
}