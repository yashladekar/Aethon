import { getAllTopics } from "./get-topics";
import type { TopicDocument } from "../schema/topic-metadata.schema";

export async function getTopicBySlug(slug: string[]): Promise<TopicDocument | undefined> {
  const topics = await getAllTopics();

  return topics.find(
    (topic) => topic.slug === slug.join("/")
  );
}
