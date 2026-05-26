-- Link accepted AI drafts to the lesson created from them.
ALTER TABLE "lesson_drafts" ADD COLUMN "createdLessonId" TEXT;

CREATE UNIQUE INDEX "lesson_drafts_createdLessonId_key" ON "lesson_drafts"("createdLessonId");
CREATE INDEX "lesson_drafts_createdLessonId_idx" ON "lesson_drafts"("createdLessonId");

ALTER TABLE "lesson_drafts"
ADD CONSTRAINT "lesson_drafts_createdLessonId_fkey"
FOREIGN KEY ("createdLessonId") REFERENCES "lessons"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
