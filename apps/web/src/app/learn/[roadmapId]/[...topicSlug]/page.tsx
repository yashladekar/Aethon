"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@aethon/ui/components/card";
import { Skeleton } from "@aethon/ui/components/skeleton";

import { trpc } from "@/utils/trpc";
import { MarkdownRenderer } from "@/components/workspace/markdown-renderer";

export default function TopicWorkspacePage() {
    const params = useParams<{ roadmapId: string; topicSlug: string[] }>();

    const topicSlug = params.topicSlug.join("/");

    const topic = useQuery(
        trpc.platform.topicBySlug.queryOptions({ slug: topicSlug })
    );

    if (topic.isLoading) {
        return (
            <div className="flex flex-col gap-4 p-6">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-4 h-64 w-full" />
            </div>
        );
    }

    if (topic.isError || !topic.data) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Topic not found</CardTitle>
                        <CardDescription>
                            The topic &ldquo;{topicSlug}&rdquo; could not be loaded.
                            {topic.isError && (
                                <span className="mt-1 block text-xs text-destructive">
                                    {topic.error.message}
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{params.roadmapId}</span>
                    <span>/</span>
                    <span>{topicSlug}</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {topic.data.title}
                </h1>
                {topic.data.description && (
                    <p className="text-sm text-muted-foreground">
                        {topic.data.description}
                    </p>
                )}
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Content</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                    {topic.data.body ? (
                        <MarkdownRenderer content={topic.data.body} />
                    ) : (
                        <p className="text-muted-foreground">
                            Topic content will be rendered here once the MDX pipeline is connected.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
