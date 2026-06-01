import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Core modules
import { PrismaModule } from '../../core/prisma.module';

// Services
import { SourceRegistryRepository } from './repositories/source-registry.repository';
import { UrlDiscoveryService } from './services/url-discovery.service';
import { WebCrawlerService } from './services/web-crawler.service';
import { DataValidatorService } from './services/data-validator.service';
import { AiProcessorService } from './services/ai-processor.service';
import { PersistenceService } from './services/persistence.service';
import { PipelineMonitorService } from './services/pipeline-monitor.service';
import { PipelineOrchestratorService } from './services/pipeline-orchestrator.service';
import { PipelineSchedulerService } from './services/pipeline-scheduler.service';

// Controller
import { PipelineStatusController } from './controllers/pipeline-status.controller';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [PipelineStatusController],
  providers: [
    SourceRegistryRepository,
    UrlDiscoveryService,
    WebCrawlerService,
    DataValidatorService,
    AiProcessorService,
    PersistenceService,
    PipelineMonitorService,
    PipelineOrchestratorService,
    PipelineSchedulerService,
  ],
  exports: [
    SourceRegistryRepository,
    UrlDiscoveryService,
    WebCrawlerService,
    DataValidatorService,
    AiProcessorService,
    PersistenceService,
    PipelineMonitorService,
    PipelineOrchestratorService,
    PipelineSchedulerService,
  ],
})
export class AutomatedPipelineModule {}
