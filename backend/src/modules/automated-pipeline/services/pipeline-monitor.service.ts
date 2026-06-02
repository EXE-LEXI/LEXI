import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface PipelineMetrics {
  sourceId: string;
  crawlJobId: string;
  totalUrlsDiscovered: number;
  successfulCrawls: number;
  failedCrawls: number;
  successfulValidations: number;
  duplicatesDetected: number;
  docsProcessedByAI: number;
  docsPersisted: number;
  createdCount: number;
  updatedCount: number;
  startTime: Date;
  endTime?: Date;
  totalTokensUsed: number;
  estimatedCost: number;
  averageCrawlTime: number;
  averageAiProcessTime: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  errorCount: number;
  lastError?: string;
}

@Injectable()
export class PipelineMonitorService {
  private readonly logger = new Logger(PipelineMonitorService.name);
  private metricsMap: Map<string, PipelineMetrics> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  /**
   * Initialize metrics for a crawl job
   */
  initializeMetrics(sourceId: string, crawlJobId: string): PipelineMetrics {
    const metrics: PipelineMetrics = {
      sourceId,
      crawlJobId,
      totalUrlsDiscovered: 0,
      successfulCrawls: 0,
      failedCrawls: 0,
      successfulValidations: 0,
      duplicatesDetected: 0,
      docsProcessedByAI: 0,
      docsPersisted: 0,
      createdCount: 0,
      updatedCount: 0,
      startTime: new Date(),
      totalTokensUsed: 0,
      estimatedCost: 0,
      averageCrawlTime: 0,
      averageAiProcessTime: 0,
      status: 'IN_PROGRESS',
      errorCount: 0,
    };

    this.metricsMap.set(crawlJobId, metrics);
    this.logger.log(`Initialized metrics for crawl job: ${crawlJobId}`);

    return metrics;
  }

  /**
   * Record URL discovery
   */
  recordUrlDiscovery(crawlJobId: string, count: number): void {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.totalUrlsDiscovered += count;
      this.logger.debug(`Discovered ${count} URLs. Total: ${metrics.totalUrlsDiscovered}`);
    }
  }

  /**
   * Record successful crawl
   */
  recordCrawlSuccess(crawlJobId: string, crawlTimeMs: number): void {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.successfulCrawls++;
      // Update average
      const totalCrawlTime = metrics.averageCrawlTime * (metrics.successfulCrawls - 1) + crawlTimeMs;
      metrics.averageCrawlTime = totalCrawlTime / metrics.successfulCrawls;
    }
  }

  /**
   * Record failed crawl
   */
  recordCrawlFailure(crawlJobId: string, error: string): void {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.failedCrawls++;
      metrics.errorCount++;
      metrics.lastError = error;
      this.logger.warn(`Crawl failed: ${error}`);
    }
  }

  /**
   * Record validation success
   */
  recordValidationSuccess(crawlJobId: string): void {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.successfulValidations++;
    }
  }

  /**
   * Record duplicate detection
   */
  recordDuplicate(crawlJobId: string): void {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.duplicatesDetected++;
    }
  }

  /**
   * Record AI processing
   */
  recordAiProcessing(
    crawlJobId: string,
    tokensUsed: number,
    processingTimeMs: number
  ): void {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.docsProcessedByAI++;
      metrics.totalTokensUsed += tokensUsed;

      // Calculate cost (gpt-4: $0.03/1k input, $0.06/1k output, estimate 50/50 split)
      const estimatedCostPerToken = 0.000045; // Average
      metrics.estimatedCost += tokensUsed * estimatedCostPerToken;

      // Update average processing time
      const totalAiTime =
        metrics.averageAiProcessTime * (metrics.docsProcessedByAI - 1) + processingTimeMs;
      metrics.averageAiProcessTime = totalAiTime / metrics.docsProcessedByAI;
    }
  }

  /**
   * Record persistence
   */
  recordPersistence(
    crawlJobId: string,
    created: number,
    updated: number
  ): void {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.docsPersisted += created + updated;
      metrics.createdCount += created;
      metrics.updatedCount += updated;
    }
  }

  /**
   * Finalize metrics
   */
  async finalizeMetrics(crawlJobId: string, success: boolean): Promise<PipelineMetrics> {
    const metrics = this.metricsMap.get(crawlJobId);
    if (metrics) {
      metrics.endTime = new Date();
      metrics.status = success ? 'COMPLETED' : 'FAILED';

      // Save to database
      await this.saveToDailyMetrics(metrics);
      await this.saveCrawlMetrics(metrics);

      this.logger.log(
        `Finalized metrics for crawl ${crawlJobId}: ${metrics.successfulCrawls} successful, ${metrics.failedCrawls} failed`
      );

      return metrics;
    }

    throw new Error(`Metrics not found for crawl job: ${crawlJobId}`);
  }

  /**
   * Save daily aggregate metrics
   */
  private async saveToDailyMetrics(metrics: PipelineMetrics): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingDaily = await this.prisma.pipelineMetrics.findFirst({
        where: {
          date: today,
        },
      });

      if (existingDaily) {
        await this.prisma.pipelineMetrics.update({
          where: { id: existingDaily.id },
          data: {
            totalCrawls: {
              increment: metrics.successfulCrawls + metrics.failedCrawls,
            },
            successfulCrawls: {
              increment: metrics.successfulCrawls,
            },
            failedCrawls: {
              increment: metrics.failedCrawls,
            },
            docsCreated: {
              increment: metrics.createdCount,
            },
            docsUpdated: {
              increment: metrics.updatedCount,
            },
            tokensUsed: {
              increment: metrics.totalTokensUsed,
            },
            estimatedCost: {
              increment: metrics.estimatedCost,
            },
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.pipelineMetrics.create({
          data: {
            date: today,
            totalCrawls: metrics.successfulCrawls + metrics.failedCrawls,
            successfulCrawls: metrics.successfulCrawls,
            failedCrawls: metrics.failedCrawls,
            docsCreated: metrics.createdCount,
            docsUpdated: metrics.updatedCount,
            tokensUsed: metrics.totalTokensUsed,
            estimatedCost: metrics.estimatedCost,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      this.logger.log('Saved daily metrics');
    } catch (error) {
      this.logger.error(`Error saving daily metrics: ${error.message}`);
    }
  }

  /**
   * Save crawl-specific metrics
   */
  private async saveCrawlMetrics(metrics: PipelineMetrics): Promise<void> {
    try {
      await this.prisma.crawlErrorLog.create({
        data: {
          crawlJobId: metrics.crawlJobId,
          sourceId: metrics.sourceId,
          successfulCrawls: metrics.successfulCrawls,
          failedCrawls: metrics.failedCrawls,
          duplicatesDetected: metrics.duplicatesDetected,
          docsProcessedByAI: metrics.docsProcessedByAI,
          docsPersisted: metrics.docsPersisted,
          totalTokensUsed: metrics.totalTokensUsed,
          estimatedCost: metrics.estimatedCost,
          averageCrawlTime: metrics.averageCrawlTime,
          averageAiProcessTime: metrics.averageAiProcessTime,
          status: metrics.status,
          lastError: metrics.lastError,
          durationMs: metrics.endTime
            ? metrics.endTime.getTime() - metrics.startTime.getTime()
            : 0,
          createdAt: new Date(),
        },
      });

      this.logger.log('Saved crawl metrics to log');
    } catch (error) {
      this.logger.error(`Error saving crawl metrics: ${error.message}`);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(crawlJobId: string): PipelineMetrics | undefined {
    return this.metricsMap.get(crawlJobId);
  }

  /**
   * Get daily summary
   */
  async getDailySummary(date?: Date): Promise<any> {
    const queryDate = date || new Date();
    queryDate.setHours(0, 0, 0, 0);

    return this.prisma.pipelineMetrics.findFirst({
      where: {
        date: queryDate,
      },
    });
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return this.prisma.pipelineMetrics.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
