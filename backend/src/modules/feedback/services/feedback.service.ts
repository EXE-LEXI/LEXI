import { Injectable } from "@nestjs/common";
import { CreateFeedbackReportDto } from "../dto/request/create-feedback-report.dto";
import { GetFeedbackReportsQueryDto } from "../dto/request/get-feedback-reports-query.dto";
import { UpdateFeedbackReportStatusDto } from "../dto/request/update-feedback-report-status.dto";
import {
  FeedbackReportListResponseDto,
  FeedbackReportResponseDto,
} from "../dto/response/feedback-report-response.dto";
import { FeedbackMapper } from "../mappers/feedback.mapper";
import { FeedbackRepository } from "../repositories/feedback.repository";

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  async createReport(
    userId: string,
    dto: CreateFeedbackReportDto
  ): Promise<FeedbackReportResponseDto> {
    const report = await this.feedbackRepository.createReport(userId, dto);
    return FeedbackMapper.toResponse(report);
  }

  async listReports(
    query: GetFeedbackReportsQueryDto
  ): Promise<FeedbackReportListResponseDto> {
    const result = await this.feedbackRepository.listReports(query);
    return FeedbackMapper.toListResponse(result);
  }

  async updateStatus(
    reportId: string,
    dto: UpdateFeedbackReportStatusDto
  ): Promise<FeedbackReportResponseDto> {
    const report = await this.feedbackRepository.updateStatus(
      reportId,
      dto.status
    );
    return FeedbackMapper.toResponse(report);
  }
}
