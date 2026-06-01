import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/prisma.service';
import { SourceRegistryRepository } from '../repositories/source-registry.repository';
import { UrlDiscoveryService } from './url-discovery.service';
import { WebCrawlerService } from './web-crawler.service';
import { DataValidatorService } from './data-validator.service';
import { AiProcessorService } from './ai-processor.service';
import { PersistenceService } from './persistence.service';
import { PipelineMonitorService } from './pipeline-monitor.service';
import { CrawlStatus } from '../interfaces/pipeline.interface';

@Injectable()
export class PipelineOrchestratorService {
  private readonly logger = new Logger(PipelineOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly sourceRegistry: SourceRegistryRepository,
    private readonly urlDiscovery: UrlDiscoveryService,
    private readonly webCrawler: WebCrawlerService,
    private readonly dataValidator: DataValidatorService,
    private readonly aiProcessor: AiProcessorService,
    private readonly persistence: PersistenceService,
    private readonly monitor: PipelineMonitorService
  ) {}

  /**
   * Execute complete pipeline for a single source
   */
  async executeSourcePipeline(sourceId: string): Promise<{
    jobId: string;
    status: string;
    metrics: any;
  }> {
    let crawlJobId = '';
    let source;

    try {
      // Load source configuration
      source = await this.sourceRegistry.findById(sourceId);
      if (!source) {
        throw new Error(`Source not found: ${sourceId}`);
      }

      // Create crawl job
      const crawlJob = await this.prisma.crawlJob.create({
        data: {
          sourceId,
          status: 'IN_PROGRESS',
          startTime: new Date(),
          discoveredCount: 0,
          crawledCount: 0,
          errorCount: 0,
        },
      });
      crawlJobId = crawlJob.id;

      // Initialize monitoring
      const metrics = this.monitor.initializeMetrics(sourceId, crawlJobId);

      // Step 1: Discover URLs
      this.logger.log(`[${crawlJobId}] STEP 1: Discovering URLs from ${source.name}`);
      const discoveredUrls = await this.executeDiscovery(sourceId, crawlJobId);
      this.monitor.recordUrlDiscovery(crawlJobId, discoveredUrls.length);

      // Step 2: Crawl URLs
      this.logger.log(`[${crawlJobId}] STEP 2: Crawling ${discoveredUrls.length} URLs`);
      const crawledDocs = await this.executeCrawling(
        crawlJobId,
        discoveredUrls,
        source.sourceType,
        source.maxRetries,
        source.retryDelayMs,
        source.timeoutMs
      );

      // Step 3: Validate documents
      this.logger.log(`[${crawlJobId}] STEP 3: Validating ${crawledDocs.length} documents`);
      const validDocs = await this.executeValidation(crawlJobId, crawledDocs);

      // Step 4: Process with AI
      this.logger.log(`[${crawlJobId}] STEP 4: Processing ${validDocs.length} documents with AI`);
      const aiProcessedDocs = await this.executeAiProcessing(crawlJobId, validDocs);

      // Step 5: Persist to database
      this.logger.log(`[${crawlJobId}] STEP 5: Persisting ${aiProcessedDocs.length} documents`);
      await this.executePersistence(crawlJobId, aiProcessedDocs);

      // Finalize
      await this.prisma.crawlJob.update({
        where: { id: crawlJobId },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
          crawledCount: crawledDocs.length,
          discoveredCount: discoveredUrls.length,
        },
      });

      const finalMetrics = await this.monitor.finalizeMetrics(crawlJobId, true);
      await this.sourceRegistry.updateLastCrawl(sourceId, true);

      this.logger.log(`[${crawlJobId}] Pipeline completed successfully`);

      return {
        jobId: crawlJobId,
        status: 'COMPLETED',
        metrics: finalMetrics,
      };
    } catch (error) {
      this.logger.error(`Pipeline failed for source ${sourceId}: ${error.message}`);

      if (crawlJobId) {
        try {
          await this.prisma.crawlJob.update({
            where: { id: crawlJobId },
            data: {
              status: 'FAILED',
              endTime: new Date(),
              errorMessage: error.message,
            },
          });
          await this.monitor.finalizeMetrics(crawlJobId, false);
          await this.sourceRegistry.updateLastCrawl(sourceId, false, error.message);
        } catch (err) {
          this.logger.error(`Error finalizing failed job: ${err.message}`);
        }
      }

      throw error;
    }
  }

  /**
   * Execute URL discovery step
   */
  private async executeDiscovery(
    sourceId: string,
    crawlJobId: string
  ): Promise<Array<{ url: string; source: string; title?: string; date?: Date }>> {
    try {
      const maxUrls = Number.parseInt(
        this.config.get<string>('LEGAL_AUTO_PIPELINE_MAX_URLS_PER_SOURCE') || '50',
        10
      );
      const discoveredUrls = (await this.urlDiscovery.discoverUrls(sourceId)).slice(
        0,
        Number.isFinite(maxUrls) && maxUrls > 0 ? maxUrls : 50
      );
      // Map source object to source string
      const urls = discoveredUrls.map((item: any) => ({
        url: item.url,
        source: typeof item.source === 'string' ? item.source : item.source?.name || 'unknown',
        title: item.title,
        date: item.date,
      }));
      this.logger.log(`[${crawlJobId}] Discovered ${urls.length} URLs`);
      return urls;
    } catch (error) {
      this.monitor.recordCrawlFailure(crawlJobId, `Discovery failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute crawling step
   */
  private async executeCrawling(
    crawlJobId: string,
    urls: Array<{ url: string; source: string; title?: string; date?: Date }>,
    sourceType: string,
    maxRetries = 3,
    retryDelayMs = 5000,
    timeoutMs = 30000
  ): Promise<any[]> {
    const crawledDocs: any[] = [];
    let processedCount = 0;

    // Concurrent crawling with max 5 workers
    const maxConcurrent = 5;
    const chunks = [];

    for (let i = 0; i < urls.length; i += maxConcurrent) {
      chunks.push(urls.slice(i, i + maxConcurrent));
    }

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map((item) =>
          this.webCrawler.crawlUrl(item.url, maxRetries, retryDelayMs, timeoutMs)
        )
      );

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled') {
          crawledDocs.push({
            ...result.value,
            sourceType,
            crawlJobId,
            crawledAt: new Date(),
          });
          this.monitor.recordCrawlSuccess(crawlJobId, 0); // Duration can be tracked separately
        } else {
          this.monitor.recordCrawlFailure(crawlJobId, result.reason?.message || 'Unknown error');
        }
        processedCount++;
      }

      this.logger.debug(
        `[${crawlJobId}] Crawled ${processedCount}/${urls.length} URLs`
      );
    }

    return crawledDocs;
  }

  /**
   * Execute validation step
   */
  private async executeValidation(
    crawlJobId: string,
    docs: any[]
  ): Promise<any[]> {
    const validDocs: any[] = [];

    for (const doc of docs) {
      const validation = await this.dataValidator.validateDocument(doc);

      if (validation.isValid) {
        validDocs.push(doc);
        this.monitor.recordValidationSuccess(crawlJobId);
      } else if (validation.isDuplicate) {
        this.monitor.recordDuplicate(crawlJobId);
      } else {
        this.monitor.recordCrawlFailure(crawlJobId, `Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    this.logger.log(
      `[${crawlJobId}] Validation complete: ${validDocs.length} valid out of ${docs.length}`
    );
    return validDocs;
  }

  /**
   * Execute AI processing step
   */
  private async executeAiProcessing(
    crawlJobId: string,
    docs: any[]
  ): Promise<any[]> {
    const processedDocs = await this.aiProcessor.processBatch(docs);

    for (const doc of processedDocs) {
      if (doc.isProcessedByAI) {
        // Estimate tokens used (roughly 4 chars = 1 token)
        const tokensUsed = Math.ceil(doc.rawText.length / 4);
        this.monitor.recordAiProcessing(crawlJobId, tokensUsed, 0);
      }
    }

    this.logger.log(
      `[${crawlJobId}] AI processing complete: ${processedDocs.length} documents`
    );
    return processedDocs;
  }

  /**
   * Execute persistence step
   */
  private async executePersistence(
    crawlJobId: string,
    docs: any[]
  ): Promise<void> {
    const result = await this.persistence.persistBatch(docs);

    this.monitor.recordPersistence(crawlJobId, result.created, result.updated);

    this.logger.log(
      `[${crawlJobId}] Persistence complete: ${result.created} created, ${result.updated} updated, ${result.failed} failed`
    );

    if (result.failed > 0) {
      this.logger.warn(
        `[${crawlJobId}] Persistence errors: ${JSON.stringify(result.errors)}`
      );
    }
  }

  /**
   * Execute all active sources
   */
  async executeAllActiveSources(): Promise<Array<{
    sourceId: string;
    status: string;
    metrics: any;
  }>> {
    this.logger.log('Starting pipeline execution for all active sources');

    const sources = await this.sourceRegistry.findAll();
    const activeSource = sources.filter((s: any) => s.status === 'ACTIVE');

    const results = [];

    for (const source of activeSource) {
      try {
        const result = await this.executeSourcePipeline(source.id);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to execute source ${source.id}: ${error.message}`);
        results.push({
          sourceId: source.id,
          status: 'FAILED',
          metrics: null,
        });
      }
    }

    this.logger.log(`Pipeline execution complete for ${results.length} sources`);
    return results;
  }

  /**
   * Get pipeline status
   */
  async getPipelineStatus(crawlJobId: string): Promise<any> {
    const job = await this.prisma.crawlJob.findUnique({
      where: { id: crawlJobId },
    });

    const metrics = this.monitor.getMetrics(crawlJobId);

    return {
      job,
      metrics,
    };
  }
}
