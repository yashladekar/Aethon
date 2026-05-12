"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@aethon/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aethon/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

const staticRoadmaps = [
  {
    id: "frontend",
    title: "Frontend Development Roadmap",
    description:
      "A structured learning path covering JavaScript fundamentals, React core concepts, and advanced frontend patterns.",
  },
];

export default function RoadmapsPage() {
  const roadmaps = useQuery(trpc.platform.roadmaps.queryOptions());

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Learning Paths
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Metadata-driven roadmaps
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Roadmaps are backed by first-class engine entities, so graph
          visualization, adaptive recommendations, and progress tracking can all
          grow from the same source of truth.
        </p>
      </div>

      {/* Static content-driven roadmaps */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Available Roadmaps</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {staticRoadmaps.map((roadmap) => (
            <Link
              key={roadmap.id}
              href={`/roadmaps/${roadmap.id}` as Route}
              className="block transition-transform hover:scale-[1.01]"
            >
              <Card className="h-full cursor-pointer hover:border-primary/50">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{roadmap.title}</CardTitle>
                    <Badge variant="outline">content</Badge>
                  </div>
                  <CardDescription>{roadmap.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Database-backed roadmaps */}
      {roadmaps.isLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Loading roadmap index...
          </CardContent>
        </Card>
      ) : roadmaps.data?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Database Roadmaps</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {roadmaps.data.map((roadmap) => (
              <Link
                key={roadmap.id}
                href={`/roadmaps/${roadmap.id}` as Route}
                className="block transition-transform hover:scale-[1.01]"
              >
                <Card className="h-full cursor-pointer hover:border-primary/50">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>{roadmap.title}</CardTitle>
                      <Badge variant="outline">{roadmap.status}</Badge>
                    </div>
                    <CardDescription>
                      {roadmap.description ??
                        "A roadmap shell ready for nodes, edges, and progression."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>{roadmap.nodeCount} nodes</span>
                    <span>{roadmap.progressCount} progress records</span>
                    {roadmap.theme ? <span>theme: {roadmap.theme}</span> : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
