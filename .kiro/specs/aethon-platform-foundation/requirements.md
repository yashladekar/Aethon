# Requirements Document

## Introduction

Aethon is an AI-Native Interactive Developer Learning Platform built as a Turborepo monorepo. This document captures the foundational platform requirements across seven phases: stabilizing the content platform, building a canonical domain layer, building the roadmap engine, building the learning workspace, evolving the database, establishing adaptive learning, and integrating the AI layer.

The platform is graph-first: every topic is a node, every dependency is an edge. Metadata is the source of truth. Engines are built for reuse, not one-off features. Runtime isolation is mandatory for heavy interactive components (Monaco, Sandpack, XTerm, WebContainers).

---

## Glossary

- **Content_Core**: The `packages/content-core` package responsible for loading, parsing, validating, and indexing MDX topic files.
- **Topic**: A unit of learning content stored as an MDX file with structured frontmatter, identified by a unique slug.
- **Topic_Schema**: The Zod-validated shape of a Topic's frontmatter fields (id, slug, title, description, difficulty, estimatedTime, prerequisites, relatedTopics, tags, roadmapIds).
- **Content_Registry**: An in-memory index built at startup from all Topic files, providing lookup maps, graph adjacency data, and search preparation.
- **Shared**: The `packages/shared` package that exports canonical domain contracts (types, enums, interfaces) consumed by all other packages.
- **Graph_Engine**: The `packages/graph-engine` package that builds and traverses the knowledge graph of topics and their relationships.
- **Knowledge_Graph**: A directed graph where nodes are Topics and edges are typed relationships (prerequisite, related, dependency, foundation, extends, optimizes, unlocks).
- **Roadmap_Engine**: The `packages/roadmap-engine` package that renders interactive roadmap visualizations using React Flow (`@xyflow/react`).
- **Roadmap_Document**: A JSON-serializable data structure describing a roadmap: `{ id, title, nodes: RoadmapNodeDefinition[], edges: RoadmapEdgeDefinition[] }`.
- **Learning_Workspace**: The split-panel UI in `apps/web` that combines a content reader, Monaco Editor, Sandpack sandbox, and XTerm terminal.
- **Monaco_Editor**: The `@monaco-editor/react` code editor, loaded dynamically as a client-only component.
- **Sandpack**: The `@codesandbox/sandpack-react` interactive React sandbox, loaded dynamically as a client-only component.
- **XTerm**: The `xterm` terminal emulator, loaded dynamically as a client-only component.
- **Adaptive_Engine**: The `packages/adaptive-engine` package that tracks learner weaknesses and generates revision candidates.
- **AI_Engine**: The `packages/ai-engine` package that generates quizzes, summaries, tutoring responses, and roadmap assistance using the Vercel AI SDK.
- **DB**: The `packages/db` package containing the Prisma schema and generated client.
- **Fumadocs**: The documentation framework (`fumadocs-mdx`, `fumadocs-ui`) used in `apps/docs` for MDX routing and rendering.
- **tRPC**: The type-safe API layer in `packages/api` used for client-server communication.
- **Progress**: A per-user, per-topic record tracking completion status, mastery score, and streak.
- **Mistake_Log**: A record of a learner's incorrect or hesitant quiz answer, linked to a topic and concept key.
- **Revision_Queue**: A prioritized list of topics scheduled for spaced-repetition review for a given learner.
- **Recommendation**: A system-generated suggestion for a learner's next action (next topic, revision, exercise, quiz, project, mentor).
- **Weakness_Signal**: A signal emitted by the Adaptive_Engine indicating a learner's difficulty with a specific concept within a topic.

---

## Requirements

### Requirement 1: Fumadocs MDX Routing Integration

**User Story:** As a developer, I want the `apps/docs` application to serve MDX topic content through Fumadocs routing, so that topic pages are rendered with proper navigation, search, and MDX component support.

#### Acceptance Criteria

1. WHEN the `apps/docs` application starts, THE Fumadocs integration SHALL resolve `source.config.ts` and `lib/source.ts` without errors.
2. WHEN a request is made to `/docs/[...slug]`, THE Fumadocs router SHALL resolve the slug to the corresponding MDX file in the `content/` directory and render it.
3. IF a requested slug does not match any MDX file, THEN THE Fumadocs router SHALL return a 404 response via `notFound()`.
4. THE `apps/docs` layout SHALL wrap all doc pages in the Fumadocs UI shell, providing sidebar navigation and a table of contents.
5. WHEN an MDX file contains custom components (e.g., callouts, code blocks), THE MDX_Renderer SHALL render them using the registered `mdx-components.tsx` component map.
6. THE `source.config.ts` SHALL define a `docs` collection pointing to the `content/` directory with the Topic_Schema as the frontmatter validator.

---

### Requirement 2: Topic Schema Formalization and Validation

**User Story:** As a content author, I want every topic MDX file to be validated against a canonical schema at load time, so that malformed or incomplete content is caught before it reaches the UI.

#### Acceptance Criteria

1. THE Topic_Schema SHALL define the following required fields: `title` (non-empty string), `description` (non-empty string), `difficulty` (one of: `beginner`, `intermediate`, `advanced`, `expert`), `estimatedTime` (positive integer, minutes).
2. THE Topic_Schema SHALL define the following optional fields: `prerequisites` (array of slug strings, default `[]`), `relatedTopics` (array of slug strings, default `[]`), `tags` (array of strings, default `[]`), `roadmapIds` (array of strings, default `[]`), `usageContexts` (array of strings, default `[]`).
3. WHEN Content_Core loads a Topic file, THE Topic_Schema validator SHALL parse the frontmatter using Zod and return a typed `TopicMetadata` object.
4. IF a Topic file's frontmatter fails schema validation, THEN THE Content_Core loader SHALL throw a descriptive error identifying the file path and the specific validation failure.
5. THE `topicMetadataSchema` Zod schema SHALL be exported from `packages/content-core` for use by other packages.
6. FOR ALL valid `TopicMetadata` objects, parsing the frontmatter then serializing it then parsing again SHALL produce an equivalent object (round-trip property).

---

### Requirement 3: Content Registry

**User Story:** As a platform engine, I want a Content Registry that indexes all topics at startup, so that graph generation, slug lookups, and search preparation can operate without repeated filesystem reads.

#### Acceptance Criteria

1. WHEN the Content_Registry is initialized, THE Content_Core SHALL scan all MDX files under the `content/` directory and build an in-memory index.
2. THE Content_Registry SHALL expose a `getTopicBySlug(slug: string)` function that returns the matching `TopicDocument` or `undefined` in O(1) time using a Map lookup.
3. THE Content_Registry SHALL expose a `getAllTopics()` function that returns all indexed `TopicDocument` objects as an array.
4. THE Content_Registry SHALL expose a `getTopicGraph()` function that returns a `KnowledgeGraph` object derived from the `prerequisites` and `relatedTopics` fields of all indexed topics.
5. WHEN a topic's `prerequisites` field references a slug that does not exist in the registry, THE Content_Registry SHALL log a warning identifying the missing slug and the referencing topic.
6. THE Content_Registry SHALL expose a `getTopicsForSearch()` function that returns a flat array of `{ id, slug, title, description, tags }` objects suitable for indexing by the Search_Engine.
7. FOR ALL topics in the registry, the slug derived from the file path SHALL equal the slug stored in the registry entry (path-slug consistency property).

---

### Requirement 4: Canonical Domain Contracts in `packages/shared`

**User Story:** As a platform engineer, I want all domain types and enums to be defined once in `packages/shared`, so that every engine and application imports from a single source of truth without circular dependencies.

#### Acceptance Criteria

1. THE Shared package SHALL export the following domain contract modules: `topic.ts`, `roadmap.ts`, `graph.ts`, `learning.ts`, `progress.ts`, `quiz.ts`.
2. THE `topic.ts` module SHALL export `TopicDifficulty`, `TopicKind`, `TopicStatus` enums and a `TopicContract` interface matching the Prisma `Topic` model fields.
3. THE `roadmap.ts` module SHALL export `RoadmapStatus`, `RoadmapNodeKind` enums and `RoadmapContract`, `RoadmapNodeContract` interfaces.
4. THE `graph.ts` module SHALL export `TopicRelationType` enum and `GraphReference`, `GraphRelationship`, `KnowledgeGraph` interfaces.
5. THE `learning.ts` module SHALL export `ProgressStatus` enum and `ProgressContract` interface.
6. THE `progress.ts` module SHALL export `RevisionStatus` enum and `RevisionQueueContract` interface.
7. THE `quiz.ts` module SHALL export `QuizAttemptContract`, `MistakeLogContract` interfaces.
8. WHEN any engine package imports a domain type, THE import SHALL resolve from `@aethon/shared` without importing from `@aethon/db` directly.

---

### Requirement 5: Graph Engine — Relationship Engine

**User Story:** As a platform engine, I want the Graph_Engine to build and traverse the knowledge graph, so that prerequisite chains, dependency trees, and recommendation paths can be computed at runtime.

#### Acceptance Criteria

1. WHEN the Graph_Engine receives a `KnowledgeGraph`, THE Graph_Engine SHALL build an adjacency map keyed by `sourceTopicId` for O(1) neighbor lookup.
2. THE Graph_Engine SHALL expose a `getPrerequisites(topicId: string)` function that returns all direct prerequisite topic IDs for the given topic.
3. THE Graph_Engine SHALL expose a `getDependents(topicId: string)` function that returns all topic IDs that list the given topic as a prerequisite.
4. THE Graph_Engine SHALL expose a `getTopologicalOrder(topicIds: string[])` function that returns the topics sorted such that no topic appears before its prerequisites.
5. IF the graph contains a cycle (e.g., topic A requires topic B which requires topic A), THEN THE Graph_Engine SHALL detect the cycle and throw a descriptive error identifying the cycle path.
6. THE Graph_Engine SHALL expose a `getRecommendationPath(weakTopicId: string)` function that traverses prerequisite edges to return the ordered list of foundational topics a learner should revisit.
7. FOR ALL valid `KnowledgeGraph` inputs, building the adjacency map then querying all neighbors SHALL return the same result as a linear scan of the relationships array (model-based property).

---

### Requirement 6: Roadmap Engine — React Flow Renderer

**User Story:** As a learner, I want to view interactive roadmap visualizations, so that I can understand the learning path, see my progress, and navigate to individual topics.

#### Acceptance Criteria

1. THE Roadmap_Engine SHALL render roadmaps using `@xyflow/react` (React Flow), NOT Mermaid or D3.
2. WHEN a `RoadmapDocument` is provided to the Roadmap_Engine renderer, THE Roadmap_Engine SHALL render each `RoadmapNodeDefinition` as a React Flow node with the correct label, kind, and difficulty styling.
3. WHEN a `RoadmapDocument` is provided, THE Roadmap_Engine SHALL render each `RoadmapEdgeDefinition` as a directed React Flow edge connecting the source and target nodes.
4. THE Roadmap_Engine SHALL use `elkjs` for automatic layout computation when node positions are not explicitly set in the `RoadmapDocument`.
5. THE Roadmap_Engine SHALL render a minimap and expose viewport controls (zoom in, zoom out, fit view).
6. WHEN a learner clicks a roadmap node that has an associated `topicId`, THE Roadmap_Engine SHALL emit an `onNodeSelect` callback with the `topicId`.
7. THE Roadmap_Engine node renderer SHALL accept a `progressStatus` prop per node and visually distinguish `not_started`, `in_progress`, and `mastered` states.
8. THE Roadmap_Engine SHALL be exported as a React component from `packages/roadmap-engine` and MUST NOT import from `apps/web` directly.
9. WHERE the `RoadmapDocument` contains no nodes, THE Roadmap_Engine SHALL render an empty state message rather than an empty canvas.

---

### Requirement 7: Roadmap JSON Schema

**User Story:** As a content author, I want to define roadmaps as JSON data files, so that roadmap structure is decoupled from rendering logic and can be version-controlled alongside content.

#### Acceptance Criteria

1. THE Roadmap_Document JSON schema SHALL define: `id` (string), `title` (string), `description` (optional string), `nodes` (array of `RoadmapNodeDefinition`), `edges` (array of `RoadmapEdgeDefinition`).
2. THE `RoadmapNodeDefinition` SHALL define: `id` (string), `topicId` (optional string), `label` (string), `kind` (one of `RoadmapNodeKind` values), `difficulty` (optional `TopicDifficulty`), `estimatedMinutes` (optional positive integer), `positionX` (optional float), `positionY` (optional float).
3. THE `RoadmapEdgeDefinition` SHALL define: `id` (string), `source` (string referencing a node id), `target` (string referencing a node id), `label` (optional string).
4. WHEN a Roadmap_Document JSON file is loaded, THE Roadmap_Engine SHALL validate it against the schema using Zod and throw a descriptive error if validation fails.
5. FOR ALL valid `RoadmapDocument` objects, serializing to JSON then deserializing SHALL produce an equivalent object (round-trip property).
6. IF a `RoadmapEdgeDefinition` references a `source` or `target` node id that does not exist in the `nodes` array, THEN THE Roadmap_Engine validator SHALL throw a descriptive error identifying the dangling edge.

---

### Requirement 8: Learning Workspace Layout

**User Story:** As a learner, I want a split-panel workspace that combines a content reader with an interactive coding environment, so that I can read, practice, and experiment without switching contexts.

#### Acceptance Criteria

1. THE Learning_Workspace SHALL render a resizable split-panel layout using the existing resizable primitives from `packages/ui`.
2. THE Learning_Workspace SHALL display the topic content (MDX rendered) in the left panel and the interactive environment in the right panel.
3. THE Learning_Workspace right panel SHALL support three modes: `editor` (Monaco), `sandbox` (Sandpack), and `terminal` (XTerm), switchable via a tab or toggle control.
4. WHEN the `editor` mode is active, THE Learning_Workspace SHALL dynamically import Monaco_Editor as a client-only component with a loading fallback.
5. WHEN the `sandbox` mode is active, THE Learning_Workspace SHALL dynamically import Sandpack as a client-only component with a loading fallback.
6. WHEN the `terminal` mode is active, THE Learning_Workspace SHALL dynamically import XTerm as a client-only component with a loading fallback.
7. THE Monaco_Editor, Sandpack, and XTerm components SHALL each be wrapped in an isolated boundary (separate dynamic import, separate Suspense boundary) so that a failure in one does not affect the others.
8. WHILE the dynamic import for any interactive component is loading, THE Learning_Workspace SHALL display a skeleton loader in the right panel.
9. IF a dynamic import fails to load, THEN THE Learning_Workspace SHALL display an error message in the right panel without crashing the entire workspace.

---

### Requirement 9: Monaco Editor Integration

**User Story:** As a learner, I want a full-featured code editor in the workspace, so that I can write and edit code with syntax highlighting, autocompletion, and language support.

#### Acceptance Criteria

1. THE Monaco_Editor component SHALL be loaded via `next/dynamic` with `ssr: false` to prevent server-side rendering.
2. WHEN the Monaco_Editor mounts, THE Monaco_Editor SHALL default to the language specified by the active topic's `kind` field (e.g., `typescript` for concept/lesson topics).
3. THE Monaco_Editor SHALL accept an `initialValue` prop and an `onChange` callback prop.
4. THE Monaco_Editor component file SHALL reside in `apps/web` and SHALL NOT be exported from `packages/roadmap-engine` or any shared package.
5. WHEN the Monaco_Editor is unmounted, THE Monaco_Editor SHALL dispose of its model to prevent memory leaks.

---

### Requirement 10: Sandpack Interactive Sandbox Integration

**User Story:** As a learner, I want an interactive React sandbox in the workspace, so that I can run and modify live React code examples from lesson content.

#### Acceptance Criteria

1. THE Sandpack component SHALL be loaded via `next/dynamic` with `ssr: false`.
2. WHEN a lesson topic provides a `sandpackConfig` in its frontmatter or metadata, THE Sandpack component SHALL initialize with the provided files, dependencies, and entry point.
3. THE Sandpack component SHALL display a code editor panel and a live preview panel side by side within the workspace right panel.
4. WHEN the learner modifies code in the Sandpack editor, THE Sandpack preview SHALL update in real time without a full page reload.
5. THE Sandpack component SHALL be isolated in its own dynamic import boundary, separate from Monaco_Editor and XTerm.

---

### Requirement 11: XTerm Terminal Integration

**User Story:** As a learner, I want an interactive terminal in the workspace, so that I can practice Git commands, Linux shell operations, Vim, and Docker without leaving the platform.

#### Acceptance Criteria

1. THE XTerm component SHALL be loaded via `next/dynamic` with `ssr: false`.
2. WHEN the XTerm component mounts, THE XTerm component SHALL initialize an `xterm` Terminal instance and attach the `xterm-addon-fit` addon to fill the container dimensions.
3. WHEN the container is resized, THE XTerm component SHALL call `fit()` on the fit addon to resize the terminal to match the new container dimensions.
4. THE XTerm component SHALL be isolated in its own dynamic import boundary, separate from Monaco_Editor and Sandpack.
5. WHEN the XTerm component is unmounted, THE XTerm component SHALL dispose of the Terminal instance to prevent memory leaks.

---

### Requirement 12: Database Schema — Learning Models

**User Story:** As a platform engineer, I want the Prisma schema to define all learning domain models, so that progress, quiz attempts, mistakes, recommendations, and revision queues are persisted with proper relationships and indexes.

#### Acceptance Criteria

1. THE DB schema SHALL define the `Topic` model with fields: `id`, `slug` (unique), `title`, `description`, `summary`, `difficulty` (TopicDifficulty enum), `kind` (TopicKind enum), `status` (TopicStatus enum), `estimatedMinutes`, `canonicalPath` (unique), `tags` (string array), `usageContexts` (string array), `metadata` (Json), `createdAt`, `updatedAt`.
2. THE DB schema SHALL define the `TopicRelation` model with a unique constraint on `(sourceTopicId, targetTopicId, type)` and indexes on `(sourceTopicId, type)` and `(targetTopicId, type)`.
3. THE DB schema SHALL define the `Roadmap` model with fields: `id`, `slug` (unique), `title`, `description`, `icon`, `theme`, `status` (RoadmapStatus enum), `metadata` (Json), `publishedAt`, `createdAt`, `updatedAt`.
4. THE DB schema SHALL define the `RoadmapNode` model with a unique constraint on `(roadmapId, key)` and support for hierarchical parent-child relationships via `parentNodeId`.
5. THE DB schema SHALL define the `Progress` model with a unique constraint on `(userId, topicId)` and indexes on `(userId, status)` and `(roadmapId, roadmapNodeId)`.
6. THE DB schema SHALL define the `QuizAttempt` model with indexes on `(userId, createdAt)` and `(topicId, createdAt)`.
7. THE DB schema SHALL define the `MistakeLog` model with indexes on `(userId, topicId, createdAt)` and `(conceptKey)`.
8. THE DB schema SHALL define the `Recommendation` model with indexes on `(userId, status, priority)` and `(topicId, type)`.
9. THE DB schema SHALL define the `RevisionQueue` model with indexes on `(userId, status, dueAt)` and `(topicId, dueAt)`.
10. WHEN a `Topic` record is deleted, THE DB SHALL cascade-delete all associated `TopicRelation`, `Progress`, `QuizAttempt`, `MistakeLog`, and `RevisionQueue` records.

---

### Requirement 13: Graph Persistence

**User Story:** As a platform engineer, I want topic relationships and roadmap edges to be persisted in the database, so that the knowledge graph can be queried server-side without rebuilding it from MDX files on every request.

#### Acceptance Criteria

1. WHEN a topic sync operation runs, THE DB SHALL upsert `Topic` records from the Content_Registry using `slug` as the unique key.
2. WHEN a topic sync operation runs, THE DB SHALL upsert `TopicRelation` records derived from the `prerequisites` and `relatedTopics` fields of each topic, using `(sourceTopicId, targetTopicId, type)` as the unique key.
3. WHEN a roadmap JSON file is loaded, THE DB SHALL upsert a `Roadmap` record and its associated `RoadmapNode` records using `(roadmapId, key)` as the unique key for nodes.
4. THE tRPC `platform.topicGraph` procedure SHALL query `Topic` and `TopicRelation` records from the DB and return them as a `KnowledgeGraph` object.
5. THE tRPC `platform.roadmaps` procedure SHALL query `Roadmap` records with their node counts and progress record counts.

---

### Requirement 14: Adaptive Learning — Mistake Tracking

**User Story:** As a learner, I want the platform to track my quiz mistakes and hesitations, so that the adaptive engine can identify my weak concepts and schedule targeted revision.

#### Acceptance Criteria

1. WHEN a learner submits a quiz attempt, THE Adaptive_Engine SHALL record a `QuizAttempt` with `score`, `questionCount`, `correctCount`, `durationSeconds`, and `hintsUsed`.
2. WHEN a learner answers a question incorrectly, THE Adaptive_Engine SHALL create a `MistakeLog` record with `conceptKey`, `submittedAnswer`, `expectedAnswer`, `explanation`, and `hesitationMs`.
3. WHEN a learner answers the same `conceptKey` incorrectly more than once, THE Adaptive_Engine SHALL increment the `repeatedCount` field on the existing `MistakeLog` record rather than creating a duplicate.
4. WHEN a learner skips a question, THE Adaptive_Engine SHALL create a `MistakeLog` record with `skipped: true`.
5. THE Adaptive_Engine SHALL expose a `getWeaknessSignals(userId: string)` function that queries `MistakeLog` records and returns a ranked list of `WeaknessSignal` objects ordered by `repeatedCount` descending.
6. WHEN a `WeaknessSignal` is identified, THE Adaptive_Engine SHALL emit a `Weakness_Signal` event that the Recommendation engine can consume to generate revision candidates.

---

### Requirement 15: Adaptive Learning — Recommendation Traversal

**User Story:** As a learner, I want the platform to recommend foundational topics when I struggle with a concept, so that I can address root-cause knowledge gaps rather than just retrying the same material.

#### Acceptance Criteria

1. WHEN the Adaptive_Engine receives a `WeaknessSignal` for a topic, THE Adaptive_Engine SHALL call `Graph_Engine.getRecommendationPath(weakTopicId)` to retrieve the prerequisite chain.
2. THE Adaptive_Engine SHALL create `Recommendation` records of type `revision` for each topic in the prerequisite chain that the learner has not yet mastered.
3. THE Adaptive_Engine SHALL create `RevisionQueue` entries for each recommended topic with a `dueAt` date computed using a spaced-repetition interval based on `repeatedCount`.
4. WHEN a learner's `Progress` record for a topic reaches `mastered` status, THE Adaptive_Engine SHALL mark any pending `RevisionQueue` entries for that topic as `completed`.
5. THE Adaptive_Engine SHALL expose a `getRevisionQueue(userId: string)` function that returns pending `RevisionQueue` entries ordered by `dueAt` ascending.
6. IF a `Recommendation` of the same `type` and `topicId` already exists for a user with `pending` or `surfaced` status, THEN THE Adaptive_Engine SHALL update the existing record's `priority` rather than creating a duplicate.

---

### Requirement 16: AI Engine — Quiz Generation

**User Story:** As a learner, I want the platform to generate contextually relevant quiz questions from topic content, so that I can test my understanding without relying on manually authored question banks.

#### Acceptance Criteria

1. WHEN a `QuizGenerationRequest` is submitted, THE AI_Engine SHALL use the Vercel AI SDK with structured outputs to generate exactly `questionCount` quiz questions for the given `TopicDocument`.
2. THE AI_Engine SHALL return quiz questions as a typed array conforming to a `QuizQuestion` interface with fields: `id`, `prompt`, `options` (array of strings), `correctIndex` (integer), `explanation` (string), `conceptKey` (string).
3. THE AI_Engine SHALL use tool-based architecture via the Vercel AI SDK, with each generation capability (quiz, summary, tutoring, roadmap assistance) implemented as a separate typed tool.
4. WHEN `includeHints` is `true` in the `QuizGenerationRequest`, THE AI_Engine SHALL include a `hint` field in each generated `QuizQuestion`.
5. IF the AI provider returns a malformed or incomplete response, THEN THE AI_Engine SHALL retry the request once and, if the retry also fails, SHALL throw a descriptive error.
6. THE AI_Engine SHALL NOT be called directly from React components; all AI calls SHALL be routed through tRPC procedures in `packages/api`.

---

### Requirement 17: AI Engine — Tutoring and Summaries

**User Story:** As a learner, I want AI-powered explanations and summaries of topic content, so that I can get on-demand help when I'm stuck without leaving the workspace.

#### Acceptance Criteria

1. WHEN a learner requests a topic summary, THE AI_Engine SHALL generate a concise summary (maximum 150 words) of the `TopicDocument` content using the Vercel AI SDK.
2. WHEN a learner submits a tutoring question in the context of an active topic, THE AI_Engine SHALL respond with a contextually grounded answer that references the topic's content.
3. THE AI_Engine tutoring responses SHALL be streamed to the client using the Vercel AI SDK streaming API.
4. THE AI_Engine SHALL accept a `MentorContext` object containing `learnerId`, `currentTopicId`, and `activeRoadmapId` to ground responses in the learner's current position.
5. THE AI_Engine SHALL NOT expose raw model credentials or API keys to the client; all AI calls SHALL be server-side only.

---

### Requirement 18: Search Engine Integration

**User Story:** As a learner, I want to search for topics by title, description, and tags, so that I can quickly find relevant content without navigating the full roadmap.

#### Acceptance Criteria

1. THE Search_Engine SHALL use `@orama/orama` to build an in-memory full-text search index from the Content_Registry's `getTopicsForSearch()` output.
2. WHEN the Search_Engine index is built, THE Search_Engine SHALL index the `title`, `description`, and `tags` fields of each topic.
3. WHEN a search query is submitted, THE Search_Engine SHALL return results ranked by relevance score, including `slug`, `title`, `description`, and matched `tags`.
4. THE Search_Engine index SHALL be rebuilt whenever the Content_Registry is re-initialized (e.g., on server restart or content hot-reload in development).
5. WHEN a search query returns no results, THE Search_Engine SHALL return an empty array rather than an error.

---

### Requirement 19: Runtime Isolation and Lazy Loading

**User Story:** As a platform engineer, I want all heavy interactive components to be lazy-loaded with isolated boundaries, so that the initial page load is fast and a failure in one component does not crash the workspace.

#### Acceptance Criteria

1. THE Monaco_Editor, Sandpack, and XTerm components SHALL each be imported using `next/dynamic` with `{ ssr: false }`.
2. EACH dynamic import SHALL have its own `Suspense` boundary with a skeleton fallback component.
3. EACH dynamic import SHALL be wrapped in an `ErrorBoundary` component so that a runtime error in one component does not propagate to the workspace layout.
4. THE initial JavaScript bundle for the Learning_Workspace route SHALL NOT include Monaco, Sandpack, or XTerm code; these SHALL only be loaded when the corresponding tab is activated.
5. WHERE a topic's `kind` is `concept` or `lesson` and no interactive mode is explicitly requested, THE Learning_Workspace SHALL default to rendering only the content panel without loading any interactive component.

---

### Requirement 20: tRPC API Layer — Platform Procedures

**User Story:** As a frontend developer, I want type-safe tRPC procedures for all platform data, so that the web application can fetch topics, roadmaps, graph data, and learner progress without writing untyped fetch calls.

#### Acceptance Criteria

1. THE `platform` tRPC router SHALL expose the following procedures: `overview`, `roadmaps`, `topicGraph`, `topicBySlug`, `learnerProgress`, `revisionQueue`, `recommendations`.
2. THE `topicBySlug` procedure SHALL accept a `slug` string input and return the full `TopicDocument` or `null`.
3. THE `learnerProgress` procedure SHALL be a protected procedure requiring an authenticated session and SHALL return the learner's `Progress` records for a given `roadmapId`.
4. THE `revisionQueue` procedure SHALL be a protected procedure and SHALL return the learner's pending `RevisionQueue` entries ordered by `dueAt`.
5. THE `recommendations` procedure SHALL be a protected procedure and SHALL return the learner's `pending` and `surfaced` `Recommendation` records ordered by `priority` descending.
6. IF the database is unreachable, THEN THE tRPC procedures SHALL return a structured error response with `initialized: false` and a `reason` field rather than throwing an unhandled exception.
