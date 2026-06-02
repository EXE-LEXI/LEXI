import { Injectable } from "@nestjs/common";
import { FeedbackReportStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import { CreateFeedbackReportDto } from "../dto/request/create-feedback-report.dto";
import { GetFeedbackReportsQueryDto } from "../dto/request/get-feedback-reports-query.dto";

const feedbackReportInclude = {
  user: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          fullName: true,
        },
      },
    },
  },
} satisfies Prisma.FeedbackReportInclude;

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  createReport(userId: string, dto: CreateFeedbackReportDto) {
    return this.prisma.feedbackReport.create({
      data: {
        userId,
        category: dto.category,
        subject: dto.subject,
        message: dto.message,
        pagePath: dto.pagePath,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
      include: feedbackReportInclude,
    });
  }

  async listReports(query: GetFeedbackReportsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.FeedbackReportWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { subject: { contains: query.search } },
        { message: { contains: query.search } },
        { pagePath: { contains: query.search } },
      ];
    }

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.feedbackReport.findMany({
        where,
        include: feedbackReportInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.feedbackReport.count({ where }),
    ]);

    return { reports, total, page, limit };
  }

  updateStatus(reportId: string, status: FeedbackReportStatus) {
    return this.prisma.feedbackReport.update({
      where: { id: reportId },
      data: { status },
      include: feedbackReportInclude,
    });
  }
}
