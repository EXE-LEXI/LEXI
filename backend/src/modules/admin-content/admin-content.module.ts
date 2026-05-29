import { Module } from "@nestjs/common";
import { AdminAiController } from "./controllers/admin-ai.controller";
import { AdminLessonsController } from "./controllers/admin-lessons.controller";
import { AdminMediaController } from "./controllers/admin-media.controller";
import { AdminNotificationsController } from "./controllers/admin-notifications.controller";
import { AdminSourcesController } from "./controllers/admin-sources.controller";
import { AiLearningController } from "./controllers/ai-learning.controller";
import { AdminContentRepository } from "./repositories/admin-content.repository";
import { AdminContentService } from "./services/admin-content.service";
import { LegalSourceCrawlWorker } from "./services/legal-source-crawl.worker";
import { AiRecommendationService } from "./services/ai-recommendation.service";
import { AiEnhancedLearningService } from "./services/ai-enhanced-learning.service";
import { VietnameseLawCrawlerService } from "./services/vietnamese-law-crawler.service";
import { AiJobProcessor } from "./services/ai-job-processor.service";

@Module({
  controllers: [
    AdminAiController,
    AdminLessonsController,
    AdminMediaController,
    AdminNotificationsController,
    AdminSourcesController,
    AiLearningController,
  ],
  providers: [
    AdminContentService,
    AdminContentRepository,
    LegalSourceCrawlWorker,
    AiRecommendationService,
    AiEnhancedLearningService,
    VietnameseLawCrawlerService,
    AiJobProcessor,
  ],
})
export class AdminContentModule {}
