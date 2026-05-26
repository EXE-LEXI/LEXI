import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { ReviewRecommendationsResponseDto } from "../dto/response/review-recommendations-response.dto";
import { ReviewRecommendationsService } from "../services/review-recommendations.service";

@ApiTags("review")
@ApiBearerAuth()
@Controller("review")
@UseGuards(JwtAuthGuard)
export class ReviewRecommendationsController {
  constructor(
    private readonly reviewRecommendationsService: ReviewRecommendationsService
  ) {}

  @Get("recommendations")
  @ApiOperation({ summary: "Get personalized review recommendations" })
  @ApiOkResponse({ type: ReviewRecommendationsResponseDto })
  async getRecommendations(
    @CurrentUser() user: AuthUserDto
  ): Promise<ReviewRecommendationsResponseDto> {
    return this.reviewRecommendationsService.getRecommendations(user.id);
  }
}
