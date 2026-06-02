import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry, Cron } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../../../core/prisma.service';
import { PipelineOrchestratorService } from './pipeline-orchestrator.service';
import { SourceRegistryRepository } from '../repositories/source-registry.repository';

@Injectable()
export class PipelineSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(PipelineSchedulerService.name);
  private scheduledJobs: Map<string, CronJob> = new Map();

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly sourceRegistry: SourceRegistryRepository,
    private readonly orchestrator: PipelineOrchestratorService
  ) {}

  /**
   * Initialize scheduler on module startup
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing pipeline scheduler');
    await this.sourceBootstrap();
    await this.loadScheduledSources();
  }

  private async sourceBootstrap(): Promise<void> {
    const enabled = this.config.get<string>('LEGAL_AUTO_PIPELINE_BOOTSTRAP') !== 'false';
    if (!enabled) {
      return;
    }

    try {
      await this.sourceRegistry.ensureDefaultOfficialSources();
    } catch (error) {
      this.logger.warn(
        `Could not bootstrap official source registry: ${error.message}`
      );
    }
  }

  /**
   * Load and schedule all active sources
   */
  private async loadScheduledSources(): Promise<void> {
    try {
      const sources = await this.prisma.sourceRegistry.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      this.logger.log(`Found ${sources.length} active sources to schedule`);

      for (const source of sources) {
        if (source.cronExpression) {
          await this.scheduleSource(source.id, source.cronExpression);
        }
      }
    } catch (error) {
      this.logger.error(`Error loading scheduled sources: ${error.message}`);
    }
  }

  /**
   * Schedule a source for automatic crawling
   */
  async scheduleSource(sourceId: string, cronExpression: string): Promise<void> {
    try {
      // Validate cron expression
      if (!this.isValidCronExpression(cronExpression)) {
        throw new Error(`Invalid cron expression: ${cronExpression}`);
      }

      // Remove existing job if present
      if (this.scheduledJobs.has(sourceId)) {
        await this.unscheduleSource(sourceId);
      }

      // Create new cron job
      const job = new CronJob(cronExpression, async () => {
        this.logger.log(`Executing scheduled pipeline for source: ${sourceId}`);
        try {
          await this.orchestrator.executeSourcePipeline(sourceId);
          this.logger.log(`Scheduled pipeline completed for source: ${sourceId}`);
        } catch (error) {
          this.logger.error(
            `Scheduled pipeline failed for source ${sourceId}: ${error.message}`
          );
        }
      });

      job.start();
      this.scheduledJobs.set(sourceId, job);
      this.schedulerRegistry.addCronJob(`pipeline-${sourceId}`, job as any);

      this.logger.log(
        `Scheduled source ${sourceId} with cron expression: ${cronExpression}`
      );
    } catch (error) {
      this.logger.error(`Error scheduling source ${sourceId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unschedule a source
   */
  async unscheduleSource(sourceId: string): Promise<void> {
    try {
      const job = this.scheduledJobs.get(sourceId);

      if (job) {
        job.stop();
        this.scheduledJobs.delete(sourceId);
        this.schedulerRegistry.deleteCronJob(`pipeline-${sourceId}`);
        this.logger.log(`Unscheduled source: ${sourceId}`);
      }
    } catch (error) {
      this.logger.error(`Error unscheduling source ${sourceId}: ${error.message}`);
    }
  }

  /**
   * Reschedule a source with new cron expression
   */
  async rescheduleSource(sourceId: string, cronExpression: string): Promise<void> {
    await this.unscheduleSource(sourceId);
    await this.scheduleSource(sourceId, cronExpression);
  }

  /**
   * Execute pipeline immediately for all active sources
   */
  @Cron('0 * * * *')
  async executeAllSourcesPipeline(): Promise<void> {
    if (this.config.get<string>('LEGAL_AUTO_PIPELINE_ENABLED') === 'false') {
      this.logger.debug('Automated legal pipeline is disabled by configuration');
      return;
    }

    this.logger.log('Starting scheduled pipeline for all active sources');
    try {
      const results = await this.orchestrator.executeAllActiveSources();
      this.logger.log(
        `Completed scheduled pipeline execution: ${results.length} sources processed`
      );
    } catch (error) {
      this.logger.error(`Error in scheduled pipeline execution: ${error.message}`);
    }
  }

  /**
   * Validate cron expression format
   */
  private isValidCronExpression(expression: string): boolean {
    try {
      new CronJob(expression, () => {});
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all scheduled sources
   */
  getScheduledSources(): Array<{
    sourceId: string;
    nextRun: Date;
  }> {
    const results = [];

    for (const [sourceId, job] of this.scheduledJobs.entries()) {
      results.push({
        sourceId,
        nextRun: job.nextDate().toJSDate(),
      });
    }

    return results;
  }

  /**
   * Get scheduled source next run time
   */
  getSourceNextRun(sourceId: string): Date | null {
    const job = this.scheduledJobs.get(sourceId);
    return job ? job.nextDate().toJSDate() : null;
  }
}
