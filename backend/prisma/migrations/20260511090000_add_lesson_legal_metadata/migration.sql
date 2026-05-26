ALTER TABLE "lessons"
ADD COLUMN "sourceTitle" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "legalDocumentNo" TEXT,
ADD COLUMN "effectiveDate" TIMESTAMP(3),
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewerNote" TEXT;
