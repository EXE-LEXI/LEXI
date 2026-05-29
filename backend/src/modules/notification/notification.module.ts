import { Module } from "@nestjs/common";
import { DeviceTokensController } from "./controllers/device-tokens.controller";
import { NotificationPreferencesController } from "./controllers/notification-preferences.controller";
import { DeviceTokensRepository } from "./repositories/device-tokens.repository";
import { NotificationPreferencesRepository } from "./repositories/notification-preferences.repository";
import { DeviceTokensService } from "./services/device-tokens.service";
import { NotificationPreferencesService } from "./services/notification-preferences.service";
import { DailyReminderWorker } from "./services/daily-reminder.worker";

@Module({
  controllers: [DeviceTokensController, NotificationPreferencesController],
  providers: [
    DeviceTokensRepository,
    DeviceTokensService,
    NotificationPreferencesRepository,
    NotificationPreferencesService,
    DailyReminderWorker,
  ],
})
export class NotificationModule {}
