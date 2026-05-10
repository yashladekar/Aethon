import prisma from "@Aethon/db";

import { publicProcedure, router } from "../index";

export const platformRouter = router({
  overview: publicProcedure.query(async () => {
    const [topics, topicRelations, roadmaps] = await prisma.$transaction([
      prisma.topic.count(),
      prisma.topicRelation.count(),
      prisma.roadmap.count(),
    ]);

    return {
      topics,
      topicRelations,
      roadmaps,
      engines: [
        "roadmap-engine",
        "graph-engine",
        "lesson-engine",
        "sandbox-engine",
        "adaptive-engine",
        "ai-engine",
      ],
    };
  }),

  roadmaps: publicProcedure.query(async () => {
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
  }),

  topicGraph: publicProcedure.query(async () => {
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
  }),
});
