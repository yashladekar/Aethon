"use client";

import { Badge } from "@Aethon/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@Aethon/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

export default function RoadmapsPage() {
  const roadmaps = useQuery(trpc.platform.roadmaps.queryOptions());

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Learning Paths</p>
        <h1 className="text-3xl font-semibold tracking-tight">Metadata-driven roadmaps</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Roadmaps are now backed by first-class database entities, so graph visualization,
          adaptive recommendations, and progress tracking can all grow from the same source of
          truth.
        </p>
      </div>

      {roadmaps.isLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Loading roadmap index...
          </CardContent>
        </Card>
      ) : roadmaps.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {roadmaps.data.map((roadmap) => (
            <Card key={roadmap.id} className="h-full">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{roadmap.title}</CardTitle>
                  <Badge variant="outline">{roadmap.status}</Badge>
                </div>
                <CardDescription>
                  {roadmap.description ?? "A roadmap shell ready for nodes, edges, and progression."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{roadmap.nodeCount} nodes</span>
                <span>{roadmap.progressCount} progress records</span>
                {roadmap.theme ? <span>theme: {roadmap.theme}</span> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No roadmaps seeded yet</CardTitle>
            <CardDescription>
              The schema and API are ready. Next we can seed foundational tracks like frontend,
              backend, system design, and devops from JSON or MDX metadata.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
