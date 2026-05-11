# Implementation Tasks

## Phase 1 — Stabilize Content Platform

- [x] 1. Fix `apps/docs` layout bug and wire up Fumadocs
  - Remove the `<body>` tag from `apps/docs/app/(app)/docs/layout.tsx` and replace with `<DocsLayout>` from `fumadocs-ui`
  - Create `apps/docs/source.config.ts` using `defineDocs` pointing to `../../content` with `topicMetadataSchema` as the frontmatter validator
  - Create `apps/docs/lib/source.ts` using `loader` from `fumadocs-core/source` and `createMDXSource` from `fumadocs-mdx`
  - Update `apps/docs/next.config.ts` to include the `fumadocs-mdx` webpack plugin via `createMDX()`
  - Update `apps/docs/app/(app)/docs/[[...slug]]/page.tsx` to use `source.getPage(slug)` instead of `getTopicBySlug`
  - Update `apps/docs/app/page.tsx` from placeholder to a proper docs landing page
  - _Requirements: 1_

- [x] 2. Formalize Topic Schema in `packages/content-core`
  - Move `topicMetadataSchema` to `packages/content-core/src/schema/topic-metadata.schema.ts`
  - Add `roadmapIds: z.array(z.string()).default([])` field to the schema
  - Update `parseTopic()` in `packages/content-core/src/parser/parse-topic.ts` to call `topicMetadataSchema.safeParse()` on frontmatter and throw a descriptive error with file path + Zod error message on failure
  - Align `TopicDocument` interface to use `metadata: TopicMetadata` (validated) instead of raw `frontmatter`
  - Re-export `topicMetadataSchema`, `TopicMetadata`, `TopicDocument` from `packages/content-core/src/index.ts`
  - _Requirements: 2_

- [x] 3. Build Content Registry in `packages/content-core`
  - Create `packages/content-core/src/registry/content-registry.ts` with a `ContentRegistry` class
  - Implement `initialize()` that calls the existing `getAllContentFiles()` loader, parses each file, and populates a `Map<string, TopicDocument>` keyed by slug
  - Implement `getTopicBySlug(slug: string): TopicDocument | undefined` using Map lookup
  - Implement `getAllTopics(): TopicDocument[]` returning all Map values
  - Implement `getTopicGraph(): KnowledgeGraph` that derives prerequisite and relatedTopics relationships from all indexed topics, logging warnings for missing prerequisite slugs
  - Implement `getTopicsForSearch(): SearchDocument[]` returning `{ id, slug, title, description, tags }` per topic
  - Export `contentRegistry` singleton from `packages/content-core/src/index.ts`
  - _Requirements: 3_

- [x] 4. Add sample MDX content files
  - Create at least 5 additional MDX topic files across `content/frontend/`, `content/backend/`, and `content/database/` directories
  - Each file must have valid frontmatter conforming to `topicMetadataSchema` (title, description, difficulty, estimatedTime, prerequisites, relatedTopics, tags)
  - Include at least one prerequisite chain (e.g., `closures` → `use-effect`) to validate graph generation
  - _Requirements: 2, 3_

---

## Phase 2 — Canonical Domain Layer

- [x] 5. Expand `packages/shared` with domain contract modules
  - Create `packages/shared/src/constants/` directory with `topic.ts`, `roadmap.ts`, `learning.ts`, `recommendation.ts` exporting `as const` arrays for all enum values
  - Create `packages/shared/src/contracts/topic.ts` exporting `TopicContract`, `TopicDifficulty`, `TopicKind`, `TopicStatus` types
  - Create `packages/shared/src/contracts/roadmap.ts` exporting `RoadmapContract`, `RoadmapNodeContract`, `RoadmapStatus`, `RoadmapNodeKind` types
  - Create `packages/shared/src/contracts/graph.ts` exporting `GraphReference`, `GraphRelationship`, `KnowledgeGraph`, `TopicRelationType` types
  - Create `packages/shared/src/contracts/learning.ts` exporting `ProgressContract`, `ProgressStatus` types
  - Create `packages/shared/src/contracts/progress.ts` exporting `RevisionQueueContract`, `RevisionStatus` types
  - Create `packages/shared/src/contracts/quiz.ts` exporting `QuizAttemptContract`, `MistakeLogContract` interfaces
  - Create `packages/shared/src/contracts/recommendation.ts` exporting `RecommendationContract`, `RecommendationType`, `RecommendationStatus` types
  - Update `packages/shared/src/index.ts` to re-export all new modules
  - _Requirements: 4_

---

## Phase 3 — Graph Engine

- [x] 6. Implement `packages/graph-engine`
  - Create `packages/graph-engine/src/graph-engine.ts` with a `GraphEngine` class
  - Implement constructor that accepts `KnowledgeGraph` and builds `outgoing` and `incoming` adjacency Maps
  - Implement `getPrerequisites(topicId: string): string[]` returning direct prerequisite IDs
  - Implement `getDependents(topicId: string): string[]` returning topics that depend on the given topic
  - Implement `getTopologicalOrder(topicIds: string[]): string[]` using Kahn's algorithm
  - Implement `detectCycles(): string[][] | null` using DFS with a visiting set; return cycle paths or null
  - Implement `getRecommendationPath(weakTopicId: string): string[]` using BFS up the prerequisite chain, returning topics from most foundational to the weak topic
  - Export `GraphEngine` from `packages/graph-engine/src/index.ts`
  - _Requirements: 5_

---

## Phase 4 — Roadmap Engine

- [x] 7. Create Roadmap Document Zod schema
  - Create `packages/roadmap-engine/src/schema/roadmap-document.schema.ts`
  - Define `roadmapNodeSchema` with fields: `id`, `topicId` (optional), `label`, `kind` (RoadmapNodeKind), `difficulty` (optional), `estimatedMinutes` (optional), `positionX` (optional), `positionY` (optional)
  - Define `roadmapEdgeSchema` with fields: `id`, `source`, `target`, `label` (optional)
  - Define `roadmapDocumentSchema` with a `superRefine` validator that checks all edge `source`/`target` values reference existing node IDs
  - Export `RoadmapDocument`, `RoadmapNodeDefinition`, `RoadmapEdgeDefinition` types inferred from schemas
  - _Requirements: 7_

- [x] 8. Implement ELK layout computation
  - Create `packages/roadmap-engine/src/layout/elk-layout.ts`
  - Implement `computeElkLayout(document: RoadmapDocument): Promise<RoadmapDocument>` that runs ELK's `layered` algorithm and returns the document with `positionX`/`positionY` filled in for all nodes
  - Only run ELK when at least one node is missing position data
  - _Requirements: 6_

- [x] 9. Build Roadmap Engine React components
  - Create `packages/roadmap-engine/src/components/RoadmapNode.tsx` — custom React Flow node with label, kind badge, difficulty indicator, and progress status color
  - Create `packages/roadmap-engine/src/components/RoadmapEdge.tsx` — custom directed edge
  - Create `packages/roadmap-engine/src/components/RoadmapEmptyState.tsx` — empty state message
  - Create `packages/roadmap-engine/src/store/roadmap-store.ts` — zustand store for selected node and viewport state
  - Create `packages/roadmap-engine/src/components/RoadmapRenderer.tsx` — main component accepting `RoadmapRendererProps`, running ELK layout on mount, rendering `<ReactFlow>` with custom nodes/edges, minimap, and controls
  - Export `RoadmapRenderer` and `RoadmapDocument` from `packages/roadmap-engine/src/index.ts`
  - _Requirements: 6, 7_

- [x] 10. Create sample roadmap JSON data files
  - Create `content/roadmaps/frontend.json` with a frontend learning roadmap using the `RoadmapDocument` schema
  - Include at least 8 nodes with proper `topicId` references and prerequisite edges
  - Validate the file against `roadmapDocumentSchema` in a build-time check
  - _Requirements: 7_

---

## Phase 5 — Learning Workspace

- [~] 11. Create workspace route structure in `apps/web`
  - Create `apps/web/app/learn/[roadmapId]/page.tsx` — renders `RoadmapRenderer` with roadmap data fetched via tRPC `platform.roadmaps`
  - Create `apps/web/app/learn/[roadmapId]/[topicSlug]/layout.tsx` — workspace shell with `ResizablePanelGroup` from `@aethon/ui`
  - Create `apps/web/app/learn/[roadmapId]/[topicSlug]/page.tsx` — fetches topic via tRPC `topics.topicBySlug` and renders the workspace
  - _Requirements: 8_

- [~] 12. Build Monaco Editor dynamic component
  - Create `apps/web/components/workspace/monaco-editor-inner.tsx` — client component using `@monaco-editor/react`, accepting `initialValue` and `onChange` props, disposing model on unmount
  - Create `apps/web/components/workspace/editor-panel.tsx` — wraps `monaco-editor-inner` with `next/dynamic` (`ssr: false`), `Suspense` with skeleton fallback, and `ErrorBoundary`
  - _Requirements: 9, 19_

- [~] 13. Build Sandpack dynamic component
  - Create `apps/web/components/workspace/sandpack-inner.tsx` — client component using `@codesandbox/sandpack-react` with `SandpackProvider`, `SandpackCodeEditor`, and `SandpackPreview`
  - Create `apps/web/components/workspace/sandbox-panel.tsx` — wraps with `next/dynamic` (`ssr: false`), `Suspense`, and `ErrorBoundary`
  - _Requirements: 10, 19_

- [~] 14. Build XTerm dynamic component
  - Create `apps/web/components/workspace/xterm-inner.tsx` — client component using `xterm` + `xterm-addon-fit`, attaching to a div ref, calling `fit()` on mount and on `ResizeObserver`, disposing on unmount
  - Create `apps/web/components/workspace/terminal-panel.tsx` — wraps with `next/dynamic` (`ssr: false`), `Suspense`, and `ErrorBoundary`
  - _Requirements: 11, 19_

- [~] 15. Assemble the Learning Workspace layout
  - Create `apps/web/components/workspace/workspace-layout.tsx` — `ResizablePanelGroup` with left content panel (MDX rendered) and right interactive panel
  - Create `apps/web/components/workspace/workspace-panel.tsx` — tab switcher (`editor` | `sandbox` | `terminal`) that conditionally renders the three dynamic panels; defaults to content-only when topic `kind` is `concept` or `lesson` with no explicit mode
  - Create `apps/web/components/workspace/panel-error.tsx` — error fallback UI for failed dynamic imports
  - Create `apps/web/components/workspace/panel-skeleton.tsx` — skeleton loader for loading states
  - _Requirements: 8, 19_

---

## Phase 6 — Database & Graph Persistence

- [x] 16. Verify Prisma schema completeness and run migration
  - Confirm `packages/db/prisma/schema/learning.prisma` contains all required models (already present — verify no drift)
  - Run `pnpm db:push` to apply schema to the local PostgreSQL instance
  - Run `pnpm db:generate` to regenerate the Prisma client
  - _Requirements: 12_

- [~] 17. Build content sync script
  - Create `packages/db/src/sync/sync-content.ts` that initializes `contentRegistry`, iterates all topics, and upserts `Topic` records using `slug` as the unique key
  - Upsert `TopicRelation` records from `contentRegistry.getTopicGraph()` using `(sourceTopicId, targetTopicId, type)` as the unique key
  - Add `db:sync` script to `packages/db/package.json` and root `package.json`
  - _Requirements: 13_

---

## Phase 7 — tRPC API Expansion

- [~] 18. Add `topics` tRPC router
  - Create `packages/api/src/routers/topics.ts` with:
    - `topicBySlug`: public procedure accepting `{ slug: string }`, returning `TopicDocument | null` from `contentRegistry`
    - `topicsForSearch`: public procedure returning `contentRegistry.getTopicsForSearch()`
  - Register `topics` router in `packages/api/src/routers/index.ts`
  - _Requirements: 20_

- [~] 19. Add `learning` tRPC router
  - Create `packages/api/src/routers/learning.ts` with:
    - `learnerProgress`: protected procedure accepting `{ roadmapId: string }`, returning `Progress[]` for the authenticated user
    - `revisionQueue`: protected procedure returning pending `RevisionQueue` entries ordered by `dueAt`
    - `recommendations`: protected procedure returning `pending` and `surfaced` `Recommendation` records ordered by `priority` descending
  - Register `learning` router in `packages/api/src/routers/index.ts`
  - _Requirements: 20_

---

## Phase 8 — Adaptive Engine

- [~] 20. Implement weakness detection in `packages/adaptive-engine`
  - Create `packages/adaptive-engine/src/weakness-detector.ts` with `getWeaknessSignals(userId: string): Promise<WeaknessSignal[]>` querying `MistakeLog` ordered by `repeatedCount` descending
  - Create `packages/adaptive-engine/src/mistake-tracker.ts` with:
    - `recordQuizAttempt(data: QuizAttemptInput): Promise<void>` — creates `QuizAttempt` record
    - `recordMistake(data: MistakeInput): Promise<void>` — upserts `MistakeLog`, incrementing `repeatedCount` on conflict
  - Export both from `packages/adaptive-engine/src/index.ts`
  - _Requirements: 14_

- [~] 21. Implement recommendation traversal in `packages/adaptive-engine`
  - Create `packages/adaptive-engine/src/recommendation-engine.ts` with `generateRecommendations(userId: string, graph: KnowledgeGraph): Promise<void>`
  - Use `GraphEngine.getRecommendationPath()` to find prerequisite chains for each weakness signal
  - Skip topics where `Progress.status === 'mastered'`
  - Upsert `Recommendation` records (update `priority` if existing pending/surfaced record exists)
  - Upsert `RevisionQueue` entries with `dueAt = now + (2^repeatedCount) days`, capped at 30 days
  - Create `packages/adaptive-engine/src/revision-queue.ts` with `getRevisionQueue(userId: string): Promise<RevisionQueue[]>` returning pending entries ordered by `dueAt`
  - _Requirements: 15_

---

## Phase 9 — AI Engine

- [~] 22. Implement quiz generation in `packages/ai-engine`
  - Create `packages/ai-engine/src/tools/generate-quiz.ts` using Vercel AI SDK `generateObject` with a Zod schema for `QuizQuestion[]`
  - Define `QuizQuestion` interface: `{ id, prompt, options: string[], correctIndex: number, explanation: string, conceptKey: string, hint?: string }`
  - Implement retry logic: retry once on malformed response, throw descriptive error on second failure
  - _Requirements: 16_

- [~] 23. Implement tutoring and summaries in `packages/ai-engine`
  - Create `packages/ai-engine/src/tools/generate-summary.ts` using `generateText` with a 150-word max prompt constraint
  - Create `packages/ai-engine/src/tools/tutor-response.ts` using `streamText`, accepting `MentorContext` to ground the system prompt in the learner's current topic and roadmap
  - Create `packages/ai-engine/src/ai-engine.ts` composing all tools into a single `aiEngine` export
  - Export `aiEngine` from `packages/ai-engine/src/index.ts`
  - _Requirements: 17_

- [~] 24. Add AI tRPC procedures
  - Create `packages/api/src/routers/ai.ts` with:
    - `generateQuiz`: protected procedure accepting `{ topicSlug: string, questionCount: number, includeHints?: boolean }`, calling `aiEngine.generateQuiz`
    - `generateSummary`: protected procedure accepting `{ topicSlug: string }`, calling `aiEngine.generateSummary`
  - Register `ai` router in `packages/api/src/routers/index.ts`
  - _Requirements: 16, 17_

---

## Phase 10 — Search Engine

- [~] 25. Implement `packages/search-engine`
  - Create `packages/search-engine/src/search-engine.ts` using `@orama/orama` `create`, `insert`, and `search`
  - Define schema with `slug: 'string'`, `title: 'string'`, `description: 'string'`, `tags: 'string[]'`
  - Implement `buildSearchIndex(topics: SearchDocument[]): Promise<void>`
  - Implement `searchTopics(query: string): Promise<SearchResult[]>` searching `title`, `description`, `tags` fields; return empty array on no results
  - Export from `packages/search-engine/src/index.ts`
  - Add `search` tRPC procedure to `packages/api/src/routers/topics.ts` accepting `{ query: string }` and returning `SearchResult[]`
  - _Requirements: 18_
