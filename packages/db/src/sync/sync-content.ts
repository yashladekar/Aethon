import { contentRegistry } from "@aethon/content-core";
import type { TopicDocument } from "@aethon/content-core";
import prisma from "../index.js";

/**
 * Maps a TopicDocument from the content registry to the shape expected
 * by the Prisma Topic model for create/update operations.
 */
function mapTopicToDb(topic: TopicDocument) {
    return {
        slug: topic.slug,
        title: topic.metadata.title,
        description: topic.metadata.description,
        difficulty: topic.metadata.difficulty,
        kind: "concept" as const,
        status: "published" as const,
        estimatedMinutes: topic.metadata.estimatedTime,
        canonicalPath: topic.slug,
        tags: topic.metadata.tags,
        usageContexts: topic.metadata.usageContexts ?? [],
        metadata: {
            section: topic.section,
            roadmapIds: topic.metadata.roadmapIds,
            prerequisites: topic.metadata.prerequisites,
            relatedTopics: topic.metadata.relatedTopics,
        },
    };
}

/**
 * Syncs content from the MDX content registry into the database.
 * - Upserts Topic records using slug as the unique key
 * - Upserts TopicRelation records using (sourceTopicId, targetTopicId, type) as the unique key
 */
async function syncContent() {
    console.log("[sync-content] Initializing content registry...");
    await contentRegistry.initialize();

    const topics = contentRegistry.getAllTopics();
    console.log(`[sync-content] Found ${topics.length} topics to sync.`);

    // Phase 1: Upsert all Topic records
    for (const topic of topics) {
        const data = mapTopicToDb(topic);
        await prisma.topic.upsert({
            where: { slug: topic.slug },
            create: data,
            update: data,
        });
    }
    console.log(`[sync-content] Upserted ${topics.length} Topic records.`);

    // Phase 2: Build a slug → DB ID map for resolving relations
    const dbTopics = await prisma.topic.findMany({
        select: { id: true, slug: true },
    });
    const slugToId = new Map(dbTopics.map((t) => [t.slug, t.id]));

    // Phase 3: Upsert TopicRelation records from the knowledge graph
    const graph = contentRegistry.getTopicGraph();
    let relationsUpserted = 0;
    let relationsSkipped = 0;

    for (const rel of graph.relationships) {
        const sourceId = slugToId.get(rel.sourceTopicId);
        const targetId = slugToId.get(rel.targetTopicId);

        if (!sourceId || !targetId) {
            console.warn(
                `[sync-content] Skipping relation: could not resolve slug to DB ID. ` +
                `source="${rel.sourceTopicId}" (${sourceId ?? "missing"}), ` +
                `target="${rel.targetTopicId}" (${targetId ?? "missing"})`
            );
            relationsSkipped++;
            continue;
        }

        await prisma.topicRelation.upsert({
            where: {
                sourceTopicId_targetTopicId_type: {
                    sourceTopicId: sourceId,
                    targetTopicId: targetId,
                    type: rel.type,
                },
            },
            create: {
                sourceTopicId: sourceId,
                targetTopicId: targetId,
                type: rel.type,
                strength: rel.strength ?? null,
            },
            update: {
                strength: rel.strength ?? null,
            },
        });
        relationsUpserted++;
    }

    console.log(
        `[sync-content] Upserted ${relationsUpserted} TopicRelation records (${relationsSkipped} skipped).`
    );
    console.log("[sync-content] Content sync complete.");
}

// Run the sync
syncContent()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("[sync-content] Sync failed:", error);
        process.exit(1);
    });
