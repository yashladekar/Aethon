# aethon

aethon is an interactive developer operating system: a graph-first learning platform that blends roadmap navigation, adaptive practice, immersive sandboxes, and an AI mentor.

## Product Direction

- Interactive learning over passive content consumption
- Knowledge graphs as the primary learning model
- Adaptive revision and recommendations driven by mistakes
- Practical engineering workflows with real code and tools
- An immersive UX influenced by VSCode, Linear, roadmap.sh, and Obsidian

## Monorepo Foundation

```text
apps/
  web         Learner-facing product experience
  docs        Content and documentation surface
  server      Business logic, AI orchestration, graph processing
  admin       Internal operations and content tooling

packages/
  api               tRPC contracts and app routers
  auth              Better Auth integration
  db                Prisma schema and database access
  env               Typed environment boundaries per app
  ui                Shared UI primitives
  roadmap-engine    Roadmap and node rendering contracts
  graph-engine      Topic graph visualization contracts
  lesson-engine     Structured lesson workspace contracts
  sandbox-engine    Runtime and practice surface contracts
  adaptive-engine   Recommendation and revision contracts
  ai-engine         Mentor and quiz generation contracts
  analytics-engine  Learning event contracts
  search-engine     Search document contracts
  content-core      Typed MDX/topic metadata schema
  shared            Cross-cutting platform types
```

## Getting Started

1. Install dependencies with `pnpm install`
2. Copy environment values from the `apps/*/.env.example` files
3. Start PostgreSQL, either with your own instance or `pnpm run db:up`
4. Point `apps/server/.env` at that PostgreSQL database
5. Generate Prisma client artifacts with `pnpm run db:generate`
6. Push the schema with `pnpm run db:push`
7. Start the monorepo with `pnpm run dev`

Default local ports:

- `web`: `http://localhost:3001`
- `server`: `http://localhost:3000`
- `admin`: `http://localhost:3002`
- `docs`: `http://localhost:3003`

If you use the repo's Docker setup, `docker-compose.yml` starts Postgres 16 on `localhost:5432` with the same credentials already shown in `apps/server/.env.example`.

## Database Model

The learning domain is designed graph-first. Topics are first-class database entities, not markdown files. Core tables now include:

- `Topic`
- `TopicRelation`
- `Roadmap`
- `RoadmapNode`
- `Progress`
- `QuizAttempt`
- `MistakeLog`
- `Recommendation`
- `RevisionQueue`

This gives the platform a clean base for adaptive learning, roadmap rendering, search, and AI-guided recommendations.
