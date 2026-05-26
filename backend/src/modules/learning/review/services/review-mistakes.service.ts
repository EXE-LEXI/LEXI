import { Injectable } from "@nestjs/common";
import {
  DEFAULT_REVIEW_MISTAKES_LIMIT,
  DEFAULT_REVIEW_MISTAKES_PAGE,
} from "../constants/review.constants";
import { ReviewMistakesResponseDto } from "../dto/response/review-mistakes-response.dto";
import { ReviewMistakesMapper } from "../mappers/review-mistakes.mapper";
import { ReviewMistakesRepository } from "../repositories/review-mistakes.repository";

@Injectable()
export class ReviewMistakesService {
  constructor(
    private readonly reviewMistakesRepository: ReviewMistakesRepository
  ) {}

  async getLatestMistakes(
    userId: string,
    page = DEFAULT_REVIEW_MISTAKES_PAGE,
    limit = DEFAULT_REVIEW_MISTAKES_LIMIT
  ): Promise<ReviewMistakesResponseDto> {
    const [total, latestMistakes] =
      await this.reviewMistakesRepository.findLatestUniqueWrongAnswers(
        userId,
        page,
        limit
      );

    return ReviewMistakesMapper.toResponse(latestMistakes, total, page, limit);
  }
}
