"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RoadmapRenderer } from "@aethon/roadmap-engine";
import type { RoadmapDocument } from "@aethon/roadmap-engine";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@aethon/ui/components/card";
import { Skeleton } from "@aethon/ui/components/skeleton";

import { trpc } from "@/utils/trpc";

export default function RoadmapPage() {
    const params = useParams<{ roadmapId: string }>();
    const router = useRouter();

    const roadmaps = useQuery(trpc.platform.roadmaps.queryOptions());

    const roadmap = roadmaps.data?.find((r) => r.id === params.roadmapId);

    function handleNodeSelect(topicId: string) {
        void router.push(`/learn/${params.roadmapId}/${topicId}` as never);
    }

    if (roadmaps.isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Skeleton className="h-[600px] w-full max-w-5xl" />
            </div>
        );
    }

    if (!roadmap) {
        return (
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Roadmap not found</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        The roadmap with ID &ldquo;{params.roadmapId}&rdquo; could not be found.
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Build a minimal RoadmapDocument from the roadmap data for the renderer.
    // In a full implementation, this would fetch the complete roadmap document
    // with nodes and edges from a dedicated tRPC procedure.
    const roadmapDocument: RoadmapDocument = {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description ?? undefined,
        nodes: [],
        edges: [],
    };

    return (
        <div className="flex h-full w-full flex-col">
            <div className="border-b px-6 py-4">
                <h1 className="text-2xl font-semibold tracking-tight">{roadmap.title}</h1>
                {roadmap.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{roadmap.description}</p>
                )}
            </div>
            <div className="flex-1">
                <RoadmapRenderer
                    document={roadmapDocument}
                    onNodeSelect={handleNodeSelect}
                    className="h-full w-full"
                />
            </div>
        </div>
    );
}
