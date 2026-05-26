import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  DailyChallengeClaimResponseDto,
  DailyChallengesResponseDto,
} from "../dto/response/daily-challenge-response.dto";
import { DailyChallengesService } from "../services/daily-challenges.service";

@ApiTags("gamification")
@ApiBearerAuth()
@Controller("gamification")
@UseGuards(JwtAuthGuard)
export class DailyChallengesController {
  constructor(
    private readonly dailyChallengesService: DailyChallengesService
  ) {}

  @Get("daily-challenges")
  @ApiOperation({ summary: "Get today's daily challenges for current user" })
  @ApiOkResponse({ type: DailyChallengesResponseDto })
  async getDailyChallenges(
    @CurrentUser() user: AuthUserDto
  ): Promise<DailyChallengesResponseDto> {
    return this.dailyChallengesService.getDailyChallenges(user.id);
  }

  @Post("daily-challenges/:challengeId/claim")
  @ApiOperation({ summary: "Claim today's completed daily challenge reward" })
  @ApiOkResponse({ type: DailyChallengeClaimResponseDto })
  async claimDailyChallenge(
    @CurrentUser() user: AuthUserDto,
    @Param("challengeId") challengeId: string
  ): Promise<DailyChallengeClaimResponseDto> {
    return this.dailyChallengesService.claimDailyChallenge(
      user.id,
      challengeId
    );
  }
}
