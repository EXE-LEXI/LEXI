import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../core/prisma.module";
import { GamificationModule } from "../../gamification/gamification.module";
import { LessonsController } from "./controllers/lessons.controller";
import { LessonsRepository } from "./repositories/lessons.repository";
import { LessonProgressService } from "./services/lesson-progress.service";
import { LessonQueryService } from "./services/lesson-query.service";
import { LessonsService } from "./services/lessons.service";
import { QuizGradingService } from "./services/quiz-grading.service";
import { QuizSubmissionService } from "./services/quiz-submission.service";
import { RewardService } from "./services/reward.service";

@Module({
  imports: [PrismaModule, GamificationModule],
  controllers: [LessonsController],
  providers: [
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
