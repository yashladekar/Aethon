"use client";

import { useRouter } from "next/navigation";
import { RoadmapRenderer } from "@aethon/roadmap-engine";
import type { RoadmapDocument } from "@aethon/roadmap-engine";

interface RoadmapViewProps {
    document: RoadmapDocument;
    roadmapId: string;
}

export function RoadmapView({ document, roadmapId }: RoadmapViewProps) {
    const router = useRouter();

    function handleNodeSelect(topicId: string) {
        router.push(`/learn/${roadmapId}/${topicId}` as never);
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div className="border-b px-6 py-4">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {document.title}
                </h1>
                {document.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {document.description}
                    </p>
                )}
            </div>
            <div className="flex-1">
                <RoadmapRenderer
                    document={document}
                    onNodeSelect={handleNodeSelect}
                    className="h-full w-full"
                />
            </div>
        </div>
    );
}
