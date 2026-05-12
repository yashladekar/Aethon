import { create, insert, search, type AnyOrama } from "@orama/orama";

export interface SearchDocument {
    id: string;
    slug: string;
    title: string;
    description: string;
    tags: string[];
}

export interface SearchResult {
    slug: string;
    title: string;
    description: string;
    tags: string[];
}

const schema = {
    slug: "string" as const,
    title: "string" as const,
    description: "string" as const,
    tags: "string[]" as const,
};

let db: AnyOrama | null = null;

export async function buildSearchIndex(
    topics: SearchDocument[]
): Promise<void> {
    db = await create({ schema });

    for (const topic of topics) {
        await insert(db, {
            slug: topic.slug,
            title: topic.title,
            description: topic.description,
            tags: topic.tags,
        });
    }
}

export async function searchTopics(query: string): Promise<SearchResult[]> {
    if (!db) {
        return [];
    }

    const results = await search(db, {
        term: query,
        properties: ["title", "description", "tags"],
    });

    if (!results.hits || results.hits.length === 0) {
        return [];
    }

    return results.hits.map((hit) => {
        const doc = hit.document as {
            slug: string;
            title: string;
            description: string;
            tags: string[];
        };
        return {
            slug: doc.slug,
            title: doc.title,
            description: doc.description,
            tags: doc.tags,
        };
    });
}
