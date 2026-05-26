import { Module } from "@nestjs/common";
import { AdminAiController } from "./controllers/admin-ai.controller";
import { AdminLessonsController } from "./controllers/admin-lessons.controller";
import { AdminMediaController } from "./controllers/admin-media.controller";
import { AdminNotificationsController } from "./controllers/admin-notifications.controller";
import { AdminSourcesController } from "./controllers/admin-sources.controller";
import { AdminContentRepository } from "./repositories/admin-content.repository";
import { AdminContentService } from "./services/admin-content.service";

@Module({
  controllers: [
    AdminAiController,
    AdminLessonsController,
    AdminMediaController,
    AdminNotificationsController,
    AdminSourcesController,
  ],
  providers: [AdminContentService, AdminContentRepository],
})
export class AdminContentModule {}
