import { Module } from "@nestjs/common";
import { PrismaModule } from "../../core/prisma.module";
import { AdminFeedbackController } from "./controllers/admin-feedback.controller";
import { FeedbackController } from "./controllers/feedback.controller";
import { FeedbackRepository } from "./repositories/feedback.repository";
import { FeedbackService } from "./services/feedback.service";

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController, AdminFeedbackController],
  providers: [FeedbackService, FeedbackRepository],
})
export class FeedbackModule {}
