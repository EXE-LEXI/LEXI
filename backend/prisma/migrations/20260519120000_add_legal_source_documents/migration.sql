-- CreateEnum
CREATE TYPE "LegalSourceCrawlStatus" AS ENUM ('PENDING', 'CRAWLED', 'FAILED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "legal_source_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "legalDocumentNo" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "rawText" TEXT NOT NULL,
    "normalizedText" TEXT,
    "contentHash" TEXT,
    "crawlStatus" "LegalSourceCrawlStatus" NOT NULL DEFAULT 'CRAWLED',
    "crawledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_source_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_source_documents_sourceUrl_key" ON "legal_source_documents"("sourceUrl");

-- CreateIndex
CREATE INDEX "legal_source_documents_crawlStatus_idx" ON "legal_source_documents"("crawlStatus");

-- CreateIndex
CREATE INDEX "legal_source_documents_legalDocumentNo_idx" ON "legal_source_documents"("legalDocumentNo");

-- CreateIndex
CREATE INDEX "legal_source_documents_contentHash_idx" ON "legal_source_documents"("contentHash");
