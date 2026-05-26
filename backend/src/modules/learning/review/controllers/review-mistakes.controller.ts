import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { DEFAULT_REVIEW_MISTAKES_LIMIT } from "../constants/review.constants";
import { GetReviewMistakesQueryDto } from "../dto/request/get-review-mistakes-query.dto";
import { ReviewMistakesResponseDto } from "../dto/response/review-mistakes-response.dto";
import { ReviewMistakesService } from "../services/review-mistakes.service";

@ApiTags("review")
@ApiBearerAuth()
@Controller("review")
@UseGuards(JwtAuthGuard)
export class ReviewMistakesController {
  constructor(private readonly reviewMistakesService: ReviewMistakesService) {}

  @Get("mistakes")
  @ApiOperation({ summary: "Get latest unique wrong answers for review" })
  @ApiOkResponse({ type: ReviewMistakesResponseDto })
  async getMistakes(
    @CurrentUser() user: AuthUserDto,
    @Query() query: GetReviewMistakesQueryDto
  ): Promise<ReviewMistakesResponseDto> {
    return this.reviewMistakesService.getLatestMistakes(
      user.id,
      query.page,
      query.limit ?? DEFAULT_REVIEW_MISTAKES_LIMIT
    );
  }
}
