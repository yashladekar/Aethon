-- CreateEnum
CREATE TYPE "TopicDifficulty" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "TopicKind" AS ENUM ('concept', 'lesson', 'project', 'tool', 'practice', 'system_design');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "TopicRelationType" AS ENUM ('prerequisite', 'related', 'dependency', 'foundation', 'extends', 'optimizes', 'unlocks');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "RoadmapNodeKind" AS ENUM ('topic', 'milestone', 'checkpoint', 'capstone', 'practice', 'review');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('not_started', 'in_progress', 'mastered', 'blocked', 'skipped');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('next_topic', 'revision', 'exercise', 'project', 'quiz', 'mentor');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('pending', 'surfaced', 'dismissed', 'completed');

-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('pending', 'scheduled', 'completed', 'skipped');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "summary" TEXT,
    "difficulty" "TopicDifficulty" NOT NULL,
    "kind" "TopicKind" NOT NULL DEFAULT 'concept',
    "status" "TopicStatus" NOT NULL DEFAULT 'draft',
    "estimatedMinutes" INTEGER,
    "canonicalPath" TEXT,
    "tags" TEXT[],
    "usageContexts" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicRelation" (
    "id" TEXT NOT NULL,
    "sourceTopicId" TEXT NOT NULL,
    "targetTopicId" TEXT NOT NULL,
    "type" "TopicRelationType" NOT NULL,
    "strength" INTEGER,
    "rationale" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "theme" TEXT,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'draft',
    "metadata" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapNode" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "topicId" TEXT,
    "parentNodeId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "RoadmapNodeKind" NOT NULL DEFAULT 'topic',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "estimatedMinutes" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "roadmapId" TEXT,
    "roadmapNodeId" TEXT,
    "status" "ProgressStatus" NOT NULL DEFAULT 'not_started',
    "masteryScore" INTEGER NOT NULL DEFAULT 0,
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "roadmapNodeId" TEXT,
    "score" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "durationSeconds" INTEGER,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MistakeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "quizAttemptId" TEXT,
    "roadmapNodeId" TEXT,
    "conceptKey" TEXT NOT NULL,
    "prompt" TEXT,
    "submittedAnswer" TEXT,
    "expectedAnswer" TEXT,
    "explanation" TEXT,
    "hesitationMs" INTEGER,
    "repeatedCount" INTEGER NOT NULL DEFAULT 1,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MistakeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "type" "RecommendationType" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "payload" JSONB,
    "surfacedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "roadmapNodeId" TEXT,
    "recommendationId" TEXT,
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "RevisionStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RevisionQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_canonicalPath_key" ON "Topic"("canonicalPath");

-- CreateIndex
CREATE INDEX "Topic_status_difficulty_idx" ON "Topic"("status", "difficulty");

-- CreateIndex
CREATE INDEX "Topic_kind_status_idx" ON "Topic"("kind", "status");

-- CreateIndex
CREATE INDEX "TopicRelation_sourceTopicId_type_idx" ON "TopicRelation"("sourceTopicId", "type");

-- CreateIndex
CREATE INDEX "TopicRelation_targetTopicId_type_idx" ON "TopicRelation"("targetTopicId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "TopicRelation_sourceTopicId_targetTopicId_type_key" ON "TopicRelation"("sourceTopicId", "targetTopicId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_slug_key" ON "Roadmap"("slug");

-- CreateIndex
CREATE INDEX "Roadmap_status_publishedAt_idx" ON "Roadmap"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "RoadmapNode_roadmapId_sortOrder_idx" ON "RoadmapNode"("roadmapId", "sortOrder");

-- CreateIndex
CREATE INDEX "RoadmapNode_topicId_idx" ON "RoadmapNode"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapNode_roadmapId_key_key" ON "RoadmapNode"("roadmapId", "key");

-- CreateIndex
CREATE INDEX "Progress_userId_status_idx" ON "Progress"("userId", "status");

-- CreateIndex
CREATE INDEX "Progress_roadmapId_roadmapNodeId_idx" ON "Progress"("roadmapId", "roadmapNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_topicId_key" ON "Progress"("userId", "topicId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_createdAt_idx" ON "QuizAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizAttempt_topicId_createdAt_idx" ON "QuizAttempt"("topicId", "createdAt");

-- CreateIndex
CREATE INDEX "MistakeLog_userId_topicId_createdAt_idx" ON "MistakeLog"("userId", "topicId", "createdAt");

-- CreateIndex
CREATE INDEX "MistakeLog_conceptKey_idx" ON "MistakeLog"("conceptKey");

-- CreateIndex
CREATE INDEX "Recommendation_userId_status_priority_idx" ON "Recommendation"("userId", "status", "priority");

-- CreateIndex
CREATE INDEX "Recommendation_topicId_type_idx" ON "Recommendation"("topicId", "type");

-- CreateIndex
CREATE INDEX "RevisionQueue_userId_status_dueAt_idx" ON "RevisionQueue"("userId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "RevisionQueue_topicId_dueAt_idx" ON "RevisionQueue"("topicId", "dueAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicRelation" ADD CONSTRAINT "TopicRelation_sourceTopicId_fkey" FOREIGN KEY ("sourceTopicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicRelation" ADD CONSTRAINT "TopicRelation_targetTopicId_fkey" FOREIGN KEY ("targetTopicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapNode" ADD CONSTRAINT "RoadmapNode_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapNode" ADD CONSTRAINT "RoadmapNode_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapNode" ADD CONSTRAINT "RoadmapNode_parentNodeId_fkey" FOREIGN KEY ("parentNodeId") REFERENCES "RoadmapNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_roadmapNodeId_fkey" FOREIGN KEY ("roadmapNodeId") REFERENCES "RoadmapNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_roadmapNodeId_fkey" FOREIGN KEY ("roadmapNodeId") REFERENCES "RoadmapNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "QuizAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_roadmapNodeId_fkey" FOREIGN KEY ("roadmapNodeId") REFERENCES "RoadmapNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionQueue" ADD CONSTRAINT "RevisionQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionQueue" ADD CONSTRAINT "RevisionQueue_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionQueue" ADD CONSTRAINT "RevisionQueue_roadmapNodeId_fkey" FOREIGN KEY ("roadmapNodeId") REFERENCES "RoadmapNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionQueue" ADD CONSTRAINT "RevisionQueue_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
