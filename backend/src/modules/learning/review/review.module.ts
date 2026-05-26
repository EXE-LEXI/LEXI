import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../core/prisma.module";
import { ReviewMistakesController } from "./controllers/review-mistakes.controller";
import { ReviewRecommendationsController } from "./controllers/review-recommendations.controller";
import { ReviewMistakesRepository } from "./repositories/review-mistakes.repository";
import { ReviewRecommendationsRepository } from "./repositories/review-recommendations.repository";
import { ReviewMistakesService } from "./services/review-mistakes.service";
import { ReviewRecommendationsService } from "./services/review-recommendations.service";

@Module({
  imports: [PrismaModule],
  controllers: [ReviewMistakesController, ReviewRecommendationsController],
  providers: [
    ReviewMistakesService,
    ReviewMistakesRepository,
    ReviewRecommendationsService,
    ReviewRecommendationsRepository,
  ],
  exports: [ReviewMistakesService, ReviewRecommendationsService],
})
export class ReviewModule {}
