import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { GetLearningHistoryQueryDto } from "../dto/request/get-learning-history-query.dto";
import { ProgressService } from "../services/progress.service";

@ApiTags("progress")
@ApiBearerAuth()
@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get("me/summary")
  async getMyProgressSummary(@CurrentUser() user: AuthUserDto) {
    return this.progressService.getUserProgressSummary(user.id);
  }

  @Get("me/current")
  async getMyCurrentLesson(@CurrentUser() user: AuthUserDto) {
    return this.progressService.getUserCurrentLesson(user.id);
  }

  @Get("me/history")
  async getMyLearningHistory(
    @CurrentUser() user: AuthUserDto,
    @Query() query: GetLearningHistoryQueryDto
  ) {
    return this.progressService.getUserLearningHistory(
      user.id,
      query.page,
      query.limit
    );
  }

  @Get("me/history/:attemptId")
  async getMyAttemptDetail(
    @CurrentUser() user: AuthUserDto,
    @Param("attemptId") attemptId: string
  ) {
    return this.progressService.getUserAttemptDetail(user.id, attemptId);
  }
}
