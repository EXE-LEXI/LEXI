import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { ICrawledDocument } from '../interfaces/pipeline.interface';

@Injectable()
export class DataValidatorService {
  private readonly logger = new Logger(DataValidatorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate crawled document
   */
  async validateDocument(
    doc: ICrawledDocument
  ): Promise<{
    isValid: boolean;
    errors: string[];
    isDuplicate: boolean;
    duplicateId?: string;
  }> {
    const errors: string[] = [];

    // Check required fields
    if (!doc.sourceUrl) errors.push('Missing sourceUrl');
    if (!doc.title) errors.push('Missing title');
    if (!doc.rawText || doc.rawText.length < 100) {
      errors.push('Content too short (minimum 100 characters)');
    }
    if (!doc.contentHash) errors.push('Missing contentHash');

    // Check format
    if (!this.isValidUrl(doc.sourceUrl)) {
      errors.push('Invalid URL format');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        isDuplicate: false,
      };
    }

    // Check for duplicates
    const duplicate = await this.checkDuplicate(doc);
    if (duplicate && duplicate.sourceUrl !== doc.sourceUrl) {
      this.logger.warn(`Duplicate detected for URL: ${doc.sourceUrl}`);
      return {
        isValid: false,
        errors: ['Document is duplicate'],
        isDuplicate: true,
        duplicateId: duplicate.id,
      };
    }

    return {
      isValid: true,
      errors: [],
      isDuplicate: false,
    };
  }

  /**
   * Check if document already exists (by hash or similarity)
   */
  private async checkDuplicate(
    doc: ICrawledDocument
  ): Promise<any | null> {
    const urlMatch = await this.prisma.legalSourceDocument.findFirst({
      where: {
        sourceUrl: doc.sourceUrl,
      },
    });

    if (urlMatch) {
      return urlMatch;
    }

    // Check exact hash match
    const exactMatch = await this.prisma.legalSourceDocument.findFirst({
      where: {
        contentHash: doc.contentHash,
      },
    });

    if (exactMatch) {
      return exactMatch;
    }

    // Check by document number (if present)
    if (doc.documentNo) {
      const docNoMatch = await this.prisma.legalSourceDocument.findFirst({
        where: {
          legalDocumentNo: doc.documentNo,
        },
      });

      if (docNoMatch) {
        return docNoMatch;
      }
    }

    // Check similarity (Levenshtein distance) for title
    const similarTitle = await this.prisma.legalSourceDocument.findMany({
      where: {
        title: {
          contains: doc.title.substring(0, 30),
        },
      },
      take: 5,
    });

    for (const similar of similarTitle) {
      const similarity = this.calculateSimilarity(doc.title, similar.title);
      if (similarity > 0.85) {
        return similar;
      }
    }

    return null;
  }

  /**
   * Calculate text similarity (Levenshtein distance)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[str2.length][str1.length];
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Batch validate documents
   */
  async validateBatch(
    docs: ICrawledDocument[]
  ): Promise<
    Array<{
      doc: ICrawledDocument;
      validation: {
        isValid: boolean;
        errors: string[];
        isDuplicate: boolean;
        duplicateId?: string;
      };
    }>
  > {
    return Promise.all(
      docs.map(async (doc) => ({
        doc,
        validation: await this.validateDocument(doc),
      }))
    );
  }
}
