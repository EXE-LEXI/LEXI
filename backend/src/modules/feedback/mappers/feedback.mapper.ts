import { buildPaginationMeta } from "../../../common/dto/pagination-meta.dto";
import {
  FeedbackReportListResponseDto,
  FeedbackReportResponseDto,
} from "../dto/response/feedback-report-response.dto";

export class FeedbackMapper {
  static toResponse(report: any): FeedbackReportResponseDto {
    return {
      id: report.id,
      category: report.category,
      status: report.status,
      subject: report.subject,
      message: report.message,
      pagePath: report.pagePath,
      metadata: report.metadata,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      user: report.user
        ? {
            id: report.user.id,
            email: report.user.email,
            fullName: report.user.profile?.fullName ?? null,
          }
        : null,
    };
  }

  static toListResponse(params: {
    reports: any[];
    total: number;
    page: number;
    limit: number;
  }): FeedbackReportListResponseDto {
    return {
      items: params.reports.map((report) => this.toResponse(report)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }
}
