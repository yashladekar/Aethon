import { getAllTopics } from "./get-topics";

export async function getTopicBySlug(slug: string[]) {
  const topics = await getAllTopics();

  return topics.find(
    (topic) => topic.slug === slug.join("/")
  );
}