-- Track generated or externally uploaded media assets for lessons and drafts.
CREATE TYPE "MediaAssetType" AS ENUM ('VIDEO');
CREATE TYPE "MediaAssetSourceType" AS ENUM ('EXTERNAL_URL', 'RENDER_REQUEST');
CREATE TYPE "MediaAssetStatus" AS ENUM ('DRAFT', 'RENDERING', 'READY', 'FAILED', 'ARCHIVED');

CREATE TABLE "media_assets" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT,
  "draftId" TEXT,
  "title" TEXT,
  "assetType" "MediaAssetType" NOT NULL DEFAULT 'VIDEO',
  "sourceType" "MediaAssetSourceType" NOT NULL DEFAULT 'EXTERNAL_URL',
  "status" "MediaAssetStatus" NOT NULL DEFAULT 'DRAFT',
  "url" TEXT,
  "mimeType" TEXT,
  "provider" TEXT,
  "renderPrompt" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_assets_lessonId_idx" ON "media_assets"("lessonId");
CREATE INDEX "media_assets_draftId_idx" ON "media_assets"("draftId");
CREATE INDEX "media_assets_assetType_idx" ON "media_assets"("assetType");
CREATE INDEX "media_assets_sourceType_idx" ON "media_assets"("sourceType");
CREATE INDEX "media_assets_status_idx" ON "media_assets"("status");

ALTER TABLE "media_assets"
ADD CONSTRAINT "media_assets_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "lessons"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "media_assets"
ADD CONSTRAINT "media_assets_draftId_fkey"
FOREIGN KEY ("draftId") REFERENCES "lesson_drafts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
