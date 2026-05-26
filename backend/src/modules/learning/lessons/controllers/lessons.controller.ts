import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { SubmitQuizDto } from "../dto/request/submit-quiz.dto";
import { LessonDetailResponseDto } from "../dto/response/lesson-detail-response.dto";
import { QuizSubmissionResponseDto } from "../dto/response/quiz-submission-response.dto";
import { LessonsService } from "../services/lessons.service";

@ApiTags("lessons")
@ApiBearerAuth()
@Controller("lessons")
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get active lesson detail and quiz questions" })
  @ApiOkResponse({ type: LessonDetailResponseDto })
  async getLessonDetail(
    @Param("id") id: string
  ): Promise<LessonDetailResponseDto> {
    return this.lessonsService.getLessonDetail(id);
  }

  @Post(":id/submit")
  @ApiOperation({ summary: "Submit lesson quiz answers" })
  @ApiOkResponse({ type: QuizSubmissionResponseDto })
  async submitQuiz(
    @Param("id") id: string,
    @Body() submitDto: SubmitQuizDto,
    @CurrentUser() user: AuthUserDto
  ): Promise<QuizSubmissionResponseDto> {
    return this.lessonsService.submitQuiz(id, user.id, submitDto.answers);
  }
}
