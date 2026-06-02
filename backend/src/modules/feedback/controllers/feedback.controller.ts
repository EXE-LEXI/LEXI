import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateFeedbackReportDto } from "../dto/request/create-feedback-report.dto";
import { FeedbackReportResponseDto } from "../dto/response/feedback-report-response.dto";
import { FeedbackService } from "../services/feedback.service";

@ApiTags("feedback")
@ApiBearerAuth()
@Controller("feedback")
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post("reports")
  @ApiOperation({ summary: "Submit user feedback or content report" })
  @ApiCreatedResponse({ type: FeedbackReportResponseDto })
  createReport(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: CreateFeedbackReportDto
  ): Promise<FeedbackReportResponseDto> {
    return this.feedbackService.createReport(user.id, dto);
  }
}
