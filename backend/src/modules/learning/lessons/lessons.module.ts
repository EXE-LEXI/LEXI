import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../core/prisma.module";
import { GamificationModule } from "../../gamification/gamification.module";
import { RewardsModule } from "../../rewards/rewards.module";
import { LessonsController } from "./controllers/lessons.controller";
import { LessonInteractionsController } from "./controllers/lesson-interactions.controller";
import { LessonInteractionsRepository } from "./repositories/lesson-interactions.repository";
import { LessonsRepository } from "./repositories/lessons.repository";
import { LessonInteractionsService } from "./services/lesson-interactions.service";
import { LessonProgressService } from "./services/lesson-progress.service";
import { LessonQueryService } from "./services/lesson-query.service";
import { LessonsService } from "./services/lessons.service";
import { QuizGradingService } from "./services/quiz-grading.service";
import { QuizSubmissionService } from "./services/quiz-submission.service";
import { RewardService } from "./services/reward.service";

@Module({
  imports: [PrismaModule, GamificationModule, RewardsModule],
  controllers: [LessonsController, LessonInteractionsController],
  providers: [
    LessonInteractionsService,
    LessonInteractionsRepository,
    LessonsService,
    LessonsRepository,
    LessonQueryService,
    QuizGradingService,
    LessonProgressService,
    RewardService,
    QuizSubmissionService,
  ],
  exports: [LessonsService],
})
export class LessonsModule {}
