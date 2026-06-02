import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';

interface ProcessedDocument {
  sourceUrl: string;
  title: string;
  documentNo?: string;
  effectiveDate?: Date;
  issuedDate?: Date;
  issuedBy?: string;
  rawText: string;
  normalizedText: string;
  contentHash: string;
  sourceType: string;
  crawlJobId: string;
  crawledAt: Date;
  legalCategory: string;
  keywords: string[];
  summary: string;
  keyPhrases: string[];
  isProcessedByAI: boolean;
}

@Injectable()
export class PersistenceService {
  private readonly logger = new Logger(PersistenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert legal source document
   */
  async upsertLegalSource(doc: ProcessedDocument): Promise<{
    created: boolean;
    documentId: string;
  }> {
    try {
      const existing = await this.prisma.legalSourceDocument.findFirst({
        where: this.buildExistingDocumentWhere(doc),
      });

      let result;
      if (existing) {
        // Update existing
        result = await this.prisma.legalSourceDocument.update({
          where: { id: existing.id },
          data: {
            title: doc.title,
            legalDocumentNo: doc.documentNo,
            effectiveDate: doc.effectiveDate,
            issuedDate: doc.issuedDate,
            issuedBy: doc.issuedBy,
            rawText: doc.rawText,
            normalizedText: doc.normalizedText,
            contentHash: doc.contentHash,
            legalCategory: doc.legalCategory,
            keywords: doc.keywords,
            summary: doc.summary,
            keyPhrases: doc.keyPhrases,
            crawledAt: doc.crawledAt,
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Updated legal source: ${doc.title}`);
        await this.logAuditTrail(result.id, 'UPDATE', {
          sourceUrl: doc.sourceUrl,
          contentHash: doc.contentHash,
          crawlJobId: doc.crawlJobId,
        });
        return {
          created: false,
          documentId: result.id,
        };
      } else {
        // Create new
        result = await this.prisma.legalSourceDocument.create({
          data: {
            sourceUrl: doc.sourceUrl,
            title: doc.title,
            legalDocumentNo: doc.documentNo,
            effectiveDate: doc.effectiveDate,
            issuedDate: doc.issuedDate,
            issuedBy: doc.issuedBy,
            rawText: doc.rawText,
            normalizedText: doc.normalizedText,
            contentHash: doc.contentHash,
            sourceType: doc.sourceType,
            legalCategory: doc.legalCategory,
            keywords: doc.keywords,
            summary: doc.summary,
            keyPhrases: doc.keyPhrases,
            crawledAt: doc.crawledAt,
            crawlJobId: doc.crawlJobId,
            isProcessedByAI: doc.isProcessedByAI,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'SYSTEM_AUTO_CRAWLER',
          },
        });

        this.logger.log(`Created legal source: ${doc.title}`);
        await this.logAuditTrail(result.id, 'CREATE', {
          sourceUrl: doc.sourceUrl,
          contentHash: doc.contentHash,
          crawlJobId: doc.crawlJobId,
        });
        return {
          created: true,
          documentId: result.id,
        };
      }
    } catch (error) {
      this.logger.error(`Error persisting legal source: ${error.message}`);
      throw error;
    }
  }

  private buildExistingDocumentWhere(doc: ProcessedDocument): any {
    const conditions: any[] = [{ sourceUrl: doc.sourceUrl }];

    if (doc.contentHash) {
      conditions.push({ contentHash: doc.contentHash });
    }

    if (doc.documentNo) {
      conditions.push({ legalDocumentNo: doc.documentNo });
    }

    return { OR: conditions };
  }

  /**
   * Create lesson draft from legal source (optional)
   */
  async createLessonDraft(
    legalSourceId: string,
    doc: ProcessedDocument,
    moduleId?: string,
    questionCount: number = 3
  ): Promise<{ draftId: string }> {
    try {
      const draft = await this.prisma.lessonDraft.create({
        data: {
          title: `Draft: ${doc.title}`,
          content: doc.normalizedText,
          reviewerNote: doc.summary,
          status: 'DRAFT',
          sourceDocumentId: legalSourceId,
          moduleId,
        },
      });

      this.logger.log(`Created lesson draft: ${draft.id}`);
      return {
        draftId: draft.id,
      };
    } catch (error) {
      this.logger.error(`Error creating lesson draft: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch persist documents
   */
  async persistBatch(
    docs: ProcessedDocument[],
    moduleId?: string,
    createDrafts: boolean = true,
    questionCount: number = 3
  ): Promise<{
    created: number;
    updated: number;
    failed: number;
    errors: Array<{ url: string; error: string }>;
  }> {
    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ url: string; error: string }> = [];

    for (const doc of docs) {
      try {
        const result = await this.upsertLegalSource(doc);

        if (result.created) {
          created++;
        } else {
          updated++;
        }

        // Create lesson draft if requested
        if (createDrafts && result.created) {
          try {
            await this.createLessonDraft(
              result.documentId,
              doc,
              moduleId,
              questionCount
            );
          } catch (error) {
            this.logger.warn(`Failed to create draft for ${doc.sourceUrl}: ${error.message}`);
          }
        }
      } catch (error) {
        failed++;
        errors.push({
          url: doc.sourceUrl,
          error: error.message,
        });
      }
    }

    this.logger.log(
      `Persistence batch completed: ${created} created, ${updated} updated, ${failed} failed`
    );

    return {
      created,
      updated,
      failed,
      errors,
    };
  }

  /**
   * Log audit trail
   */
  async logAuditTrail(
    documentId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    changes: Record<string, any>
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          entityType: 'LegalSourceDocument',
          entityId: documentId,
          action,
          changes,
          createdBy: 'SYSTEM_AUTO_CRAWLER',
          createdAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to log audit trail: ${error.message}`);
    }
  }
}
