import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { GetFeedbackReportsQueryDto } from "../dto/request/get-feedback-reports-query.dto";
import { UpdateFeedbackReportStatusDto } from "../dto/request/update-feedback-report-status.dto";
import {
  FeedbackReportListResponseDto,
  FeedbackReportResponseDto,
} from "../dto/response/feedback-report-response.dto";
import { FeedbackService } from "../services/feedback.service";

@ApiTags("admin-feedback")
@ApiBearerAuth()
@Controller("admin/feedback-reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @ApiOperation({ summary: "List feedback reports for admin review" })
  @ApiOkResponse({ type: FeedbackReportListResponseDto })
  listReports(
    @Query() query: GetFeedbackReportsQueryDto
  ): Promise<FeedbackReportListResponseDto> {
    return this.feedbackService.listReports(query);
  }

  @Patch(":reportId/status")
  @ApiOperation({ summary: "Update feedback report status" })
  @ApiOkResponse({ type: FeedbackReportResponseDto })
  updateStatus(
    @Param("reportId") reportId: string,
    @Body() dto: UpdateFeedbackReportStatusDto
  ): Promise<FeedbackReportResponseDto> {
    return this.feedbackService.updateStatus(reportId, dto);
  }
}
