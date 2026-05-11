# Design Document

## Overview

Aethon is a graph-first, AI-native developer learning platform built as a Turborepo monorepo. The architecture is engine-oriented: reusable packages handle domain logic, and apps consume them. This document describes the technical design for all seven phases of the platform foundation.

The guiding constraints are:
- Metadata is the source of truth — no hardcoded relationships or paths
- Every topic is a graph node, every dependency is a graph edge
- Heavy runtime components (Monaco, Sandpack, XTerm) must be lazy-loaded and isolated
- All domain contracts live in `packages/shared`; no cross-package circular imports

---

## Architecture

### Monorepo Package Dependency Graph

```
apps/web          → packages/ui, api, auth, roadmap-engine, lesson-engine, sandbox-engine, adaptive-engine, ai-engine, shared
apps/docs         → packages/content-core, ui, shared
apps/server       → packages/api, auth, db, ai-engine, env
apps/admin        → packages/ui, api, auth, shared

packages/api      → packages/db, auth, content-core, graph-engine, adaptive-engine, ai-engine, shared
packages/content-core → packages/shared
packages/graph-engine → packages/shared
packages/roadmap-engine → packages/shared, graph-engine
packages/adaptive-engine → packages/shared, db
packages/ai-engine → packages/shared, content-core
packages/search-engine → packages/content-core, shared
packages/lesson-engine → packages/shared
packages/sandbox-engine → packages/shared
packages/analytics-engine → packages/shared
packages/db       → (no internal deps)
packages/shared   → (no internal deps — leaf node)
packages/auth     → packages/db, env
packages/ui       → (no internal deps)
packages/env      → (no internal deps)
```

`packages/shared` is the dependency leaf — nothing it imports can import it back.

---

## Phase 1: Content Platform Stabilization

### 1.1 Fumadocs Integration (`apps/docs`)

The docs app currently uses `next-mdx-remote` directly. The design replaces this with a proper Fumadocs source pipeline while keeping the existing `[[...slug]]` route.

**Files to create/modify:**

`apps/docs/source.config.ts`
```ts
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { topicMetadataSchema } from '@aethon/content-core';

export const docs = defineDocs({
  dir: '../../content',
  schema: topicMetadataSchema,
});

export default defineConfig({ mdxOptions: {} });
```

`apps/docs/lib/source.ts`
```ts
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { docs } from '../.source';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs),
});
```

`apps/docs/app/(app)/docs/[[...slug]]/page.tsx` — updated to use `source.getPage()` from Fumadocs instead of `getTopicBySlug` from content-core directly.

`apps/docs/app/(app)/docs/layout.tsx` — fixed to use `<DocsLayout>` from `fumadocs-ui` (removing the incorrect `<body>` tag).

The `next.config.ts` must include the `fumadocs-mdx` webpack plugin via `createMDX()`.

### 1.2 Topic Schema Formalization (`packages/content-core`)

The existing `topicMetadataSchema` in `packages/content-core/src/index.ts` is already Zod-based. The design formalizes it:

- Add `roadmapIds: z.array(z.string()).default([])` to the schema (currently missing)
- Move the schema to `packages/content-core/src/schema/topic-metadata.schema.ts`
- Export `topicMetadataSchema`, `TopicMetadata`, and `TopicDocument` from the package index

The `TopicDocument` interface:
```ts
interface TopicDocument {
  slug: string;
  section: 'frontend' | 'backend' | 'devops' | 'database' | 'system-design';
  metadata: TopicMetadata;
  body: string;
}
```

Validation is applied in `parseTopic()` — if `topicMetadataSchema.safeParse(data)` fails, throw with file path + Zod error message.

### 1.3 Content Registry (`packages/content-core/src/registry/`)

The registry is a singleton initialized once per process. It wraps the existing `getAllTopics()` loader with an indexed Map.

**`packages/content-core/src/registry/content-registry.ts`**

```ts
class ContentRegistry {
  private topicMap: Map<string, TopicDocument> = new Map();
  private initialized = false;

  async initialize(): Promise<void>
  getTopicBySlug(slug: string): TopicDocument | undefined   // O(1) Map lookup
  getAllTopics(): TopicDocument[]
  getTopicGraph(): KnowledgeGraph                           // derived from prerequisites + relatedTopics
  getTopicsForSearch(): SearchDocument[]
}

export const contentRegistry = new ContentRegistry();
```

`getTopicGraph()` iterates all topics, maps `prerequisites` slugs to topic IDs via the registry, and emits `{ sourceTopicId, targetTopicId, type: 'prerequisite' }` relationships. Missing prerequisite slugs are logged as warnings (not errors) to avoid breaking the registry on incomplete content.

---

## Phase 2: Canonical Domain Layer (`packages/shared`)

The current `packages/shared/src/index.ts` exports constants and two interfaces. The design expands it into domain contract modules.

**File structure:**
```
packages/shared/src/
  constants/
    topic.ts        — topicDifficulties, topicKinds, topicStatuses arrays
    roadmap.ts      — roadmapStatuses, roadmapNodeKinds arrays
    learning.ts     — progressStatuses, revisionStatuses arrays
    recommendation.ts — recommendationTypes, recommendationStatuses arrays
  contracts/
    topic.ts        — TopicContract, TopicDifficulty, TopicKind, TopicStatus
    roadmap.ts      — RoadmapContract, RoadmapNodeContract, RoadmapStatus, RoadmapNodeKind
    graph.ts        — GraphReference, GraphRelationship, KnowledgeGraph, TopicRelationType
    learning.ts     — ProgressContract, ProgressStatus
    progress.ts     — RevisionQueueContract, RevisionStatus
    quiz.ts         — QuizAttemptContract, MistakeLogContract
    recommendation.ts — RecommendationContract, RecommendationType, RecommendationStatus
  index.ts          — re-exports everything
```

All enums are `as const` arrays + derived union types (not TypeScript `enum` keyword) to stay compatible with Zod and Prisma.

### Graph Relationship Formalization

`packages/shared/src/contracts/graph.ts`:
```ts
export const topicRelationTypes = [
  'prerequisite', 'related', 'dependency',
  'foundation', 'extends', 'optimizes', 'unlocks'
] as const;
export type TopicRelationType = typeof topicRelationTypes[number];

export interface GraphRelationship {
  sourceTopicId: string;
  targetTopicId: string;
  type: TopicRelationType;
  strength?: number;
}

export interface KnowledgeGraph {
  topics: GraphReference[];
  relationships: GraphRelationship[];
}
```

---

## Phase 3: Graph Engine (`packages/graph-engine`)

### Data Structures

The engine builds two adjacency maps from a `KnowledgeGraph`:

```
outgoing: Map<topicId, Set<topicId>>   — for getPrerequisites, topological sort
incoming: Map<topicId, Set<topicId>>   — for getDependents
```

### API

**`packages/graph-engine/src/graph-engine.ts`**

```ts
export class GraphEngine {
  constructor(graph: KnowledgeGraph)

  getPrerequisites(topicId: string): string[]
  getDependents(topicId: string): string[]
  getTopologicalOrder(topicIds: string[]): string[]   // Kahn's algorithm
  detectCycles(): string[][] | null                   // returns cycle paths or null
  getRecommendationPath(weakTopicId: string): string[] // BFS up prerequisite chain
}
```

Cycle detection uses DFS with a `visiting` set. If a cycle is found, the error message includes the full cycle path: `"Cycle detected: closures → use-effect → closures"`.

`getTopologicalOrder` uses Kahn's algorithm (BFS-based) for deterministic ordering. It only processes the subgraph reachable from the provided `topicIds`.

`getRecommendationPath` does a BFS traversal up the prerequisite chain from `weakTopicId`, returning topics in order from most foundational to the weak topic itself.

---

## Phase 4: Roadmap Engine (`packages/roadmap-engine`)

### Dependencies

`@xyflow/react`, `elkjs`, `zustand` — already installed in `apps/web`. The roadmap-engine package itself only depends on `@xyflow/react` and `@aethon/shared`.

### Component Architecture

```
packages/roadmap-engine/src/
  components/
    RoadmapRenderer.tsx     — main exported component
    RoadmapNode.tsx         — custom node renderer
    RoadmapEdge.tsx         — custom edge renderer
    RoadmapMinimap.tsx      — minimap wrapper
    RoadmapControls.tsx     — zoom/fit controls
    RoadmapEmptyState.tsx   — empty state
  layout/
    elk-layout.ts           — elkjs layout computation
  schema/
    roadmap-document.schema.ts — Zod schema for RoadmapDocument
  store/
    roadmap-store.ts        — zustand store for viewport + selection state
  index.ts
```

### `RoadmapRenderer` Props

```ts
interface RoadmapRendererProps {
  document: RoadmapDocument;
  progressByTopicId?: Record<string, ProgressStatus>;
  onNodeSelect?: (topicId: string) => void;
  className?: string;
}
```

### ELK Layout

When `positionX`/`positionY` are absent from nodes, `elk-layout.ts` runs ELK's `layered` algorithm to compute positions. The layout is computed once on mount and cached in the zustand store.

### Node Visual States

Node background color is determined by `progressStatus`:
- `not_started` → neutral/gray
- `in_progress` → blue
- `mastered` → green
- `blocked` → red/orange
- `skipped` → muted

### Roadmap Document Validation

`roadmap-document.schema.ts` uses Zod:
```ts
const roadmapDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  nodes: z.array(roadmapNodeSchema),
  edges: z.array(roadmapEdgeSchema),
}).superRefine((doc, ctx) => {
  // validate edge source/target references exist in nodes
  const nodeIds = new Set(doc.nodes.map(n => n.id));
  for (const edge of doc.edges) {
    if (!nodeIds.has(edge.source)) ctx.addIssue(...)
    if (!nodeIds.has(edge.target)) ctx.addIssue(...)
  }
});
```

---

## Phase 5: Learning Workspace (`apps/web`)

### Route Structure

```
apps/web/app/
  learn/
    [roadmapId]/
      page.tsx              — roadmap view (RoadmapRenderer)
      [topicSlug]/
        page.tsx            — learning workspace
        layout.tsx          — workspace shell
```

### Workspace Layout

Uses `ResizablePanelGroup` from `packages/ui`:

```
┌─────────────────────────────────────────────────────┐
│  Header (topic title, breadcrumb, progress)          │
├──────────────────────┬──────────────────────────────┤
│                      │  [Tabs: Editor | Sandbox | Terminal] │
│   Content Panel      ├──────────────────────────────┤
│   (MDX rendered)     │                              │
│                      │   Interactive Panel          │
│                      │   (Monaco | Sandpack | XTerm)│
│                      │                              │
└──────────────────────┴──────────────────────────────┘
```

### Dynamic Import Pattern

Each interactive component follows this pattern:

```ts
// apps/web/components/workspace/editor-panel.tsx
'use client';
import dynamic from 'next/dynamic';
import { Skeleton } from '@aethon/ui/skeleton';

const MonacoEditor = dynamic(
  () => import('./monaco-editor-inner'),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);
```

Each has its own `ErrorBoundary` wrapper:

```ts
// apps/web/components/workspace/workspace-panel.tsx
<ErrorBoundary fallback={<PanelError />}>
  <Suspense fallback={<PanelSkeleton />}>
    {mode === 'editor' && <MonacoEditor ... />}
    {mode === 'sandbox' && <SandpackPanel ... />}
    {mode === 'terminal' && <XTermPanel ... />}
  </Suspense>
</ErrorBoundary>
```

### Monaco Editor

`apps/web/components/workspace/monaco-editor-inner.tsx` (client-only, not dynamically imported itself):
- Uses `@monaco-editor/react`
- Disposes model on unmount via `useEffect` cleanup
- Defaults language to `typescript`

### Sandpack

`apps/web/components/workspace/sandpack-inner.tsx`:
- Uses `@codesandbox/sandpack-react`
- Accepts `SandpackConfig` from topic frontmatter
- Renders `<SandpackProvider>` + `<SandpackLayout>` with `<SandpackCodeEditor>` + `<SandpackPreview>`

### XTerm

`apps/web/components/workspace/xterm-inner.tsx`:
- Uses `xterm` + `xterm-addon-fit`
- Attaches to a `div` ref via `terminal.open(containerRef.current)`
- Calls `fitAddon.fit()` on mount and on `ResizeObserver` callback
- Disposes terminal on unmount

---

## Phase 6: Database Evolution

The Prisma schema in `packages/db/prisma/schema/learning.prisma` already contains all required models (Topic, TopicRelation, Roadmap, RoadmapNode, Progress, QuizAttempt, MistakeLog, Recommendation, RevisionQueue) with correct indexes and cascade rules. No schema changes are needed — the schema is already production-ready.

### Content Sync Script

A `packages/db/src/sync/sync-content.ts` script syncs MDX content into the database:

```ts
async function syncContent() {
  await contentRegistry.initialize();
  const topics = contentRegistry.getAllTopics();

  // Upsert topics
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      create: { ...mapTopicToDb(topic) },
      update: { ...mapTopicToDb(topic) },
    });
  }

  // Upsert relations
  const graph = contentRegistry.getTopicGraph();
  for (const rel of graph.relationships) {
    await prisma.topicRelation.upsert({
      where: { sourceTopicId_targetTopicId_type: { ... } },
      create: { ... },
      update: { ... },
    });
  }
}
```

This script is run via `pnpm db:sync` and also called on server startup in development.

---

## Phase 7: Adaptive Engine (`packages/adaptive-engine`)

### Weakness Detection

```ts
// packages/adaptive-engine/src/weakness-detector.ts
export async function getWeaknessSignals(userId: string): Promise<WeaknessSignal[]> {
  const mistakes = await prisma.mistakeLog.findMany({
    where: { userId },
    orderBy: { repeatedCount: 'desc' },
  });
  return mistakes.map(m => ({
    topicId: m.topicId,
    conceptKey: m.conceptKey,
    repeatedCount: m.repeatedCount,
    skipped: m.skipped,
  }));
}
```

### Recommendation Generation

```ts
// packages/adaptive-engine/src/recommendation-engine.ts
export async function generateRecommendations(
  userId: string,
  graph: KnowledgeGraph
): Promise<void> {
  const signals = await getWeaknessSignals(userId);
  const engine = new GraphEngine(graph);

  for (const signal of signals) {
    const path = engine.getRecommendationPath(signal.topicId);
    for (const topicId of path) {
      const progress = await getProgress(userId, topicId);
      if (progress?.status === 'mastered') continue;

      await upsertRecommendation(userId, topicId, 'revision', signal);
      await upsertRevisionQueue(userId, topicId, computeDueAt(signal.repeatedCount));
    }
  }
}
```

Spaced repetition interval: `dueAt = now + (2^repeatedCount) days`, capped at 30 days.

---

## Phase 8: AI Engine (`packages/ai-engine`)

### Architecture

All AI calls are server-side only, routed through tRPC. The `ai-engine` package is imported only by `packages/api` and `apps/server`.

```
packages/ai-engine/src/
  tools/
    generate-quiz.ts      — structured output tool
    generate-summary.ts   — text generation tool
    tutor-response.ts     — streaming tool
    roadmap-assist.ts     — structured output tool
  ai-engine.ts            — main entry, composes tools
  index.ts
```

### Quiz Generation

Uses Vercel AI SDK `generateObject` with a Zod schema:

```ts
const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: z.object({
    questions: z.array(quizQuestionSchema),
  }),
  prompt: buildQuizPrompt(topic, questionCount),
});
```

### Tutoring (Streaming)

Uses `streamText` from the AI SDK, piped through the tRPC procedure via a readable stream. The `MentorContext` is injected into the system prompt.

### Tool-Based Architecture

Each capability is a separate function, not a monolithic AI call. The `ai-engine.ts` composes them:

```ts
export const aiEngine = {
  generateQuiz,
  generateSummary,
  streamTutorResponse,
  assistRoadmap,
};
```

---

## Phase 9: Search Engine (`packages/search-engine`)

Uses `@orama/orama` (already installed in content-core):

```ts
// packages/search-engine/src/search-engine.ts
import { create, insert, search } from '@orama/orama';

const db = await create({
  schema: {
    slug: 'string',
    title: 'string',
    description: 'string',
    tags: 'string[]',
  },
});

export async function buildSearchIndex(topics: SearchDocument[]) {
  for (const topic of topics) await insert(db, topic);
}

export async function searchTopics(query: string): Promise<SearchResult[]> {
  const results = await search(db, { term: query, properties: ['title', 'description', 'tags'] });
  return results.hits.map(h => h.document as SearchResult);
}
```

---

## tRPC API Layer

### Router Structure

```
packages/api/src/routers/
  index.ts          — appRouter (composes all sub-routers)
  platform.ts       — overview, roadmaps, topicGraph (existing)
  topics.ts         — topicBySlug, topicsForSearch (new)
  learning.ts       — learnerProgress, revisionQueue, recommendations (new, protected)
  ai.ts             — generateQuiz, generateSummary (new, protected)
```

### New Procedures

`topics.topicBySlug`:
```ts
topicBySlug: publicProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ input }) => {
    return contentRegistry.getTopicBySlug(input.slug) ?? null;
  })
```

`learning.learnerProgress` (protected):
```ts
learnerProgress: protectedProcedure
  .input(z.object({ roadmapId: z.string() }))
  .query(async ({ ctx, input }) => {
    return prisma.progress.findMany({
      where: { userId: ctx.session.user.id, roadmapId: input.roadmapId },
    });
  })
```

---

## Key Design Decisions

**Why React Flow over Mermaid?**
Mermaid generates static SVG with no interaction model. React Flow provides a full React component tree per node, enabling progress overlays, click handlers, custom styling, and zustand-driven state — all required for the learning platform UX.

**Why `as const` arrays over TypeScript `enum`?**
TypeScript enums don't serialize cleanly to JSON, aren't compatible with Zod's `z.enum()` directly, and create runtime objects that complicate tree-shaking. `as const` arrays + derived union types work natively with Zod, Prisma, and JSON serialization.

**Why a Content Registry singleton over direct filesystem reads?**
The existing `getAllTopics()` reads the filesystem on every call. A registry initializes once, builds Maps for O(1) lookups, and enables graph generation without repeated I/O. In production (serverless), the registry is rebuilt per cold start; in long-running server processes it persists.

**Why keep AI calls server-side only?**
API keys must not reach the client. The existing `apps/server` already has a `/ai` streaming endpoint. All AI tRPC procedures run in the server context where `GOOGLE_GENERATIVE_AI_API_KEY` is available.

**Why not use Fumadocs for the main learning workspace?**
Fumadocs is a documentation framework optimized for static content browsing. The learning workspace needs dynamic progress overlays, interactive panels, and per-user state — none of which Fumadocs is designed for. Fumadocs is appropriate for `apps/docs` (reference content); `apps/web` uses its own workspace layout.
