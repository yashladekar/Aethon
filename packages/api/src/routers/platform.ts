import prisma from "@Aethon/db";

import { publicProcedure, router } from "../index";

function getBootstrapDatabaseState(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : null;

  if (code === "P1001") {
    return {
      initialized: false,
      reason: "database_unreachable" as const,
      message:
        "PostgreSQL is not reachable. Start your database and run `pnpm run db:push`.",
    };
  }

  if (code === "P2021") {
    return {
      initialized: false,
      reason: "schema_missing" as const,
      message:
        "The learning schema has not been applied yet. Run `pnpm run db:push` after your database is running.",
    };
  }

  throw error;
}

export const platformRouter = router({
  overview: publicProcedure.query(async () => {
    try {
      const [topics, topicRelations, roadmaps] = await prisma.$transaction([
        prisma.topic.count(),
        prisma.topicRelation.count(),
        prisma.roadmap.count(),
      ]);

      return {
        initialized: true,
        topics,
        topicRelations,
        roadmaps,
        database: null,
        engines: [
          "roadmap-engine",
          "graph-engine",
          "lesson-engine",
          "sandbox-engine",
          "adaptive-engine",
          "ai-engine",
        ],
      };
    } catch (error) {
      return {
        initialized: false,
        topics: 0,
        topicRelations: 0,
        roadmaps: 0,
        database: getBootstrapDatabaseState(error),
        engines: [
          "roadmap-engine",
          "graph-engine",
          "lesson-engine",
          "sandbox-engine",
          "adaptive-engine",
          "ai-engine",
        ],
      };
    }
  }),

  roadmaps: publicProcedure.query(async () => {
    try {
      const roadmaps = await prisma.roadmap.findMany({
        orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          theme: true,
          status: true,
          _count: {
            select: {
              nodes: true,
              progressRecords: true,
            },
          },
        },
      });

      return roadmaps.map((roadmap) => ({
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        theme: roadmap.theme,
        status: roadmap.status,
        nodeCount: roadmap._count.nodes,
        progressCount: roadmap._count.progressRecords,
      }));
    } catch (error) {
      getBootstrapDatabaseState(error);
      return [];
    }
  }),

  topicGraph: publicProcedure.query(async () => {
    try {
      const [topics, relations] = await prisma.$transaction([
        prisma.topic.findMany({
          orderBy: [{ difficulty: "asc" }, { title: "asc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
            kind: true,
            estimatedMinutes: true,
            tags: true,
          },
          take: 100,
        }),
        prisma.topicRelation.findMany({
          select: {
            id: true,
            sourceTopicId: true,
            targetTopicId: true,
            type: true,
          },
          take: 300,
        }),
      ]);

      return {
        topics,
        relations,
      };
    } catch (error) {
      getBootstrapDatabaseState(error);
      return {
        topics: [],
        relations: [],
      };
    }
  }),
});
