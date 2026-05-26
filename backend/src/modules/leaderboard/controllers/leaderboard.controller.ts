import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { WeeklyLeaderboardResponseDto } from "../dto/response/weekly-leaderboard-response.dto";
import { LeaderboardService } from "../services/leaderboard.service";

@ApiTags("leaderboard")
@ApiBearerAuth()
@Controller("leaderboard")
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get("weekly")
  @ApiOperation({ summary: "Get weekly leaderboard from valid XP" })
  @ApiOkResponse({ type: WeeklyLeaderboardResponseDto })
  async getWeeklyLeaderboard(
    @CurrentUser() user: AuthUserDto
  ): Promise<WeeklyLeaderboardResponseDto> {
    return this.leaderboardService.getWeeklyLeaderboard(user.id);
  }
}
