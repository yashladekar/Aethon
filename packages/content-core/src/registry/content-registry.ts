import fs from "fs/promises";
import type { KnowledgeGraph, GraphReference, GraphRelationship } from "@aethon/shared";
import { getAllContentFiles } from "../loader/load-topics";
import { parseTopic } from "../parser/parse-topic";
import type { TopicDocument } from "../schema/topic-metadata.schema";

export interface SearchDocument {
    id: string;
    slug: string;
    title: string;
    description: string;
    tags: string[];
}

class ContentRegistry {
    private topicMap: Map<string, TopicDocument> = new Map();
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        const files = await getAllContentFiles();

        await Promise.all(
            files.map(async (file) => {
                const raw = await fs.readFile(file, "utf8");
                const parsed = parseTopic(raw, file);

                const slug = file?.split("content/")[1]?.replace(/\.mdx$/, "");
                const section = (slug?.split("/")[0] ?? "frontend") as TopicDocument["section"];

                const doc: TopicDocument = {
                    slug: slug ?? "",
                    section,
                    metadata: parsed.metadata,
                    body: parsed.content,
                };

                this.topicMap.set(doc.slug, doc);
            })
        );

        this.initialized = true;
    }

    getTopicBySlug(slug: string): TopicDocument | undefined {
        return this.topicMap.get(slug);
    }

    getAllTopics(): TopicDocument[] {
        return Array.from(this.topicMap.values());
    }

    getTopicGraph(): KnowledgeGraph {
        const topics: GraphReference[] = [];
        const relationships: GraphRelationship[] = [];

        for (const topic of this.topicMap.values()) {
            topics.push({
                id: topic.slug,
                slug: topic.slug,
                title: topic.metadata.title,
            });
        }

        for (const topic of this.topicMap.values()) {
            // Map prerequisite slugs to relationships
            for (const prereqSlug of topic.metadata.prerequisites) {
                if (!this.topicMap.has(prereqSlug)) {
                    console.warn(
                        `[ContentRegistry] Missing prerequisite slug "${prereqSlug}" referenced by topic "${topic.slug}"`
                    );
                    continue;
                }
                relationships.push({
                    sourceTopicId: topic.slug,
                    targetTopicId: prereqSlug,
                    type: "prerequisite",
                });
            }

            // Map relatedTopics slugs to relationships
            for (const relatedSlug of topic.metadata.relatedTopics) {
                if (!this.topicMap.has(relatedSlug)) {
                    console.warn(
                        `[ContentRegistry] Missing relatedTopic slug "${relatedSlug}" referenced by topic "${topic.slug}"`
                    );
                    continue;
                }
                relationships.push({
                    sourceTopicId: topic.slug,
                    targetTopicId: relatedSlug,
                    type: "related",
                });
            }
        }

        return { topics, relationships };
    }

    getTopicsForSearch(): SearchDocument[] {
        return Array.from(this.topicMap.values()).map((topic) => ({
            id: topic.slug,
            slug: topic.slug,
            title: topic.metadata.title,
            description: topic.metadata.description,
            tags: topic.metadata.tags,
        }));
    }
}

export const contentRegistry = new ContentRegistry();
