import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PipelineOrchestratorService } from '../services/pipeline-orchestrator.service';
import { PipelineSchedulerService } from '../services/pipeline-scheduler.service';
import { PipelineMonitorService } from '../services/pipeline-monitor.service';
import { SourceRegistryRepository } from '../repositories/source-registry.repository';
import { PrismaService } from '../../../core/prisma.service';

@Controller('admin/pipeline')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PipelineStatusController {
  constructor(
    private readonly orchestrator: PipelineOrchestratorService,
    private readonly scheduler: PipelineSchedulerService,
    private readonly monitor: PipelineMonitorService,
    private readonly sourceRegistry: SourceRegistryRepository,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Get all source registries
   * GET /admin/pipeline/sources
   */
  @Get('sources')
  async getAllSources() {
    return await this.sourceRegistry.findAll();
  }

  /**
   * Get single source
   * GET /admin/pipeline/sources/:id
   */
  @Get('sources/:id')
  async getSource(@Param('id') sourceId: string) {
    const source = await this.sourceRegistry.findById(sourceId);
    if (!source) {
      throw new BadRequestException('Source not found');
    }
    return source;
  }

  /**
   * Create new source registry
   * POST /admin/pipeline/sources
   */
  @Post('sources')
  async createSource(@Body() data: any) {
    const source = await this.sourceRegistry.create(data);
    return source;
  }

  /**
   * Update source registry
   * PATCH /admin/pipeline/sources/:id
   */
  @Patch('sources/:id')
  async updateSource(@Param('id') sourceId: string, @Body() data: any) {
    const source = await this.sourceRegistry.update(sourceId, data);
    return source;
  }

  /**
   * Disable source
   * DELETE /admin/pipeline/sources/:id
   */
  @Delete('sources/:id')
  async disableSource(@Param('id') sourceId: string) {
    await this.sourceRegistry.disable(sourceId);
    return { message: 'Source disabled' };
  }

  /**
   * Execute pipeline for single source
   * POST /admin/pipeline/execute/:sourceId
   */
  @Post('execute/:sourceId')
  async executePipeline(@Param('sourceId') sourceId: string) {
    return await this.orchestrator.executeSourcePipeline(sourceId);
  }

  /**
   * Execute pipeline for all active sources
   * POST /admin/pipeline/execute-all
   */
  @Post('execute-all')
  async executeAllPipelines() {
    return await this.orchestrator.executeAllActiveSources();
  }

  /**
   * Get crawl job status
   * GET /admin/pipeline/jobs/:jobId
   */
  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return await this.orchestrator.getPipelineStatus(jobId);
  }

  /**
   * Get all crawl jobs
   * GET /admin/pipeline/jobs
   */
  @Get('jobs')
  async getAllJobs() {
    return await this.prisma.crawlJob.findMany({
      orderBy: {
        startTime: 'desc',
      },
      take: 100,
    });
  }

  /**
   * Schedule source for automatic execution
   * POST /admin/pipeline/schedule/:sourceId
   */
  @Post('schedule/:sourceId')
  async scheduleSource(
    @Param('sourceId') sourceId: string,
    @Body() body: { cronExpression: string }
  ) {
    const { cronExpression } = body;

    if (!cronExpression) {
      throw new BadRequestException('cronExpression is required');
    }

    await this.scheduler.scheduleSource(sourceId, cronExpression);

    // Update source with cron expression
    await this.sourceRegistry.update(sourceId, {
      cronExpression,
    });

    return { message: 'Source scheduled', cronExpression };
  }

  /**
   * Get scheduled sources
   * GET /admin/pipeline/scheduled
   */
  @Get('scheduled')
  async getScheduledSources() {
    return this.scheduler.getScheduledSources();
  }

  /**
   * Unschedule source
   * DELETE /admin/pipeline/schedule/:sourceId
   */
  @Delete('schedule/:sourceId')
  async unscheduleSource(@Param('sourceId') sourceId: string) {
    await this.scheduler.unscheduleSource(sourceId);
    return { message: 'Source unscheduled' };
  }

  /**
   * Get daily metrics
   * GET /admin/pipeline/metrics/daily
   */
  @Get('metrics/daily')
  async getDailyMetrics() {
    return await this.monitor.getDailySummary();
  }

  /**
   * Get weekly metrics
   * GET /admin/pipeline/metrics/weekly
   */
  @Get('metrics/weekly')
  async getWeeklyMetrics() {
    return await this.monitor.getWeeklySummary();
  }

  /**
   * Get recent crawl error logs
   * GET /admin/pipeline/errors
   */
  @Get('errors')
  async getRecentErrors() {
    return await this.prisma.crawlErrorLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  /**
   * Get pipeline health status
   * GET /admin/pipeline/health
   */
  @Get('health')
  async getHealthStatus() {
    const activeJobs = await this.prisma.crawlJob.count({
      where: {
        status: 'IN_PROGRESS',
      },
    });

    const failedJobs = await this.prisma.crawlJob.count({
      where: {
        status: 'FAILED',
      },
    });

    const activeSources = await this.prisma.sourceRegistry.count({
      where: {
        status: 'ACTIVE',
      },
    });

    const disabledSources = await this.prisma.sourceRegistry.count({
      where: {
        status: 'DISABLED',
      },
    });

    const dailyMetrics = await this.monitor.getDailySummary();

    return {
      status: failedJobs === 0 ? 'HEALTHY' : 'DEGRADED',
      activeJobs,
      failedJobs,
      activeSources,
      disabledSources,
      todayMetrics: dailyMetrics,
      scheduledSources: this.scheduler.getScheduledSources(),
      timestamp: new Date(),
    };
  }
}
