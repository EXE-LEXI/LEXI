-- CreateEnum
CREATE TYPE "AiGenerationType" AS ENUM ('LESSON', 'QUIZ', 'VIDEO_SCRIPT', 'FULL_LESSON_PACKAGE');

-- CreateEnum
CREATE TYPE "AiGenerationStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LessonDraftStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "ai_generation_jobs" (
    "id" TEXT NOT NULL,
    "sourceDocumentId" TEXT NOT NULL,
    "targetModuleId" TEXT,
    "type" "AiGenerationType" NOT NULL DEFAULT 'FULL_LESSON_PACKAGE',
    "status" "AiGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "promptVersion" TEXT NOT NULL DEFAULT 'legal-draft-v1',
    "model" TEXT NOT NULL DEFAULT 'local-structured-generator',
    "inputSnapshot" JSONB,
    "output" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_drafts" (
    "id" TEXT NOT NULL,
    "generationJobId" TEXT,
    "sourceDocumentId" TEXT NOT NULL,
    "moduleId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoScript" TEXT,
    "videoPrompt" TEXT,
    "reviewerNote" TEXT,
    "status" "LessonDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_draft_questions" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "explanation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_draft_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_draft_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_draft_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_generation_jobs_sourceDocumentId_idx" ON "ai_generation_jobs"("sourceDocumentId");

-- CreateIndex
CREATE INDEX "ai_generation_jobs_targetModuleId_idx" ON "ai_generation_jobs"("targetModuleId");

-- CreateIndex
CREATE INDEX "ai_generation_jobs_status_idx" ON "ai_generation_jobs"("status");

-- CreateIndex
CREATE INDEX "ai_generation_jobs_type_idx" ON "ai_generation_jobs"("type");

-- CreateIndex
CREATE INDEX "lesson_drafts_generationJobId_idx" ON "lesson_drafts"("generationJobId");

-- CreateIndex
CREATE INDEX "lesson_drafts_sourceDocumentId_idx" ON "lesson_drafts"("sourceDocumentId");

-- CreateIndex
CREATE INDEX "lesson_drafts_moduleId_idx" ON "lesson_drafts"("moduleId");

-- CreateIndex
CREATE INDEX "lesson_drafts_status_idx" ON "lesson_drafts"("status");

-- CreateIndex
CREATE INDEX "lesson_draft_questions_draftId_idx" ON "lesson_draft_questions"("draftId");

-- CreateIndex
CREATE INDEX "lesson_draft_options_questionId_idx" ON "lesson_draft_options"("questionId");

-- AddForeignKey
ALTER TABLE "ai_generation_jobs" ADD CONSTRAINT "ai_generation_jobs_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "legal_source_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generation_jobs" ADD CONSTRAINT "ai_generation_jobs_targetModuleId_fkey" FOREIGN KEY ("targetModuleId") REFERENCES "learning_modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_drafts" ADD CONSTRAINT "lesson_drafts_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "ai_generation_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_drafts" ADD CONSTRAINT "lesson_drafts_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "legal_source_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_drafts" ADD CONSTRAINT "lesson_drafts_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "learning_modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_draft_questions" ADD CONSTRAINT "lesson_draft_questions_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "lesson_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_draft_options" ADD CONSTRAINT "lesson_draft_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "lesson_draft_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
