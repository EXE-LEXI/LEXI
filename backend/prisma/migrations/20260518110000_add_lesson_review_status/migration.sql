CREATE TYPE "LessonReviewStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

ALTER TABLE "lessons"
ADD COLUMN "reviewStatus" "LessonReviewStatus" NOT NULL DEFAULT 'DRAFT';

UPDATE "lessons"
SET "reviewStatus" = CASE
  WHEN "isActive" = false THEN 'ARCHIVED'::"LessonReviewStatus"
  WHEN "sourceTitle" IS NOT NULL
    AND "sourceUrl" IS NOT NULL
    AND "legalDocumentNo" IS NOT NULL
    AND "reviewedAt" IS NOT NULL
    THEN 'PUBLISHED'::"LessonReviewStatus"
  ELSE 'IN_REVIEW'::"LessonReviewStatus"
END;

CREATE INDEX "lessons_reviewStatus_idx" ON "lessons"("reviewStatus");
