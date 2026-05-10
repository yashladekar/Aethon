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

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const overview = useQuery(trpc.platform.overview.queryOptions());
  const databaseState = overview.data?.database;

  const stats = [
    {
      label: "Topics",
      value: overview.data?.topics ?? 0,
      help: "Graph entities that power learning, AI, and search.",
    },
    {
      label: "Relations",
      value: overview.data?.topicRelations ?? 0,
      help: "Prerequisites and conceptual links across the knowledge graph.",
    },
    {
      label: "Roadmaps",
      value: overview.data?.roadmaps ?? 0,
      help: "Reusable, metadata-driven tracks instead of hardcoded pages.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-border/60 bg-gradient-to-br from-background via-background to-muted/50">
          <CardHeader className="space-y-4">
            <Badge variant="outline" className="w-fit">
              Interactive Developer Operating System
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-4xl tracking-tight">Aethon</CardTitle>
              <CardDescription className="max-w-2xl text-base text-muted-foreground">
                A graph-first learning platform combining roadmap navigation, adaptive practice,
                immersive sandboxes, and an AI mentor into one developer workspace.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background/70 p-4">
              <p className="font-medium text-foreground">Core loop</p>
              <p>Learn, practice, get feedback, revisit weaknesses, and keep moving through the graph.</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/70 p-4">
              <p className="font-medium text-foreground">Architecture rule</p>
              <p>Engines live in packages, business logic stays on the server, and pages stay thin.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Current backend wiring for the monorepo foundation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-muted-foreground">
                {healthCheck.isLoading
                  ? "Checking API..."
                  : healthCheck.data
                    ? "Server and tRPC are responding."
                    : "Server health check is unavailable."}
              </span>
            </div>
            <div className="rounded-xl border border-dashed p-4 text-muted-foreground">
              {overview.isLoading
                ? "Loading architecture metrics..."
                : `${overview.data?.engines.length ?? 0} engine packages are scaffolded for roadmap, graph, lesson, sandbox, adaptive, and AI layers.`}
            </div>
            {!overview.isLoading && databaseState ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                <p className="font-medium text-amber-50">Database bootstrap needed</p>
                <p>{databaseState.message}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="space-y-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{stat.help}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phase 1 Complete Direction</CardTitle>
            <CardDescription>What the current foundation is optimized to support next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Metadata-driven topic authoring in MDX and JSON.</p>
            <p>Reusable roadmap rendering with React Flow and ELK layouts.</p>
            <p>Adaptive revision queues based on mistakes, hesitations, and skipped topics.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Build Targets</CardTitle>
            <CardDescription>The highest-leverage product work from here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Seed foundational topics and relations into the graph.</p>
            <p>Bring Fumadocs into `apps/docs` with typed topic frontmatter.</p>
            <p>Render the first interactive roadmap workspace in `apps/web`.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
