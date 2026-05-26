import { Injectable } from "@nestjs/common";
import { LessonReviewStatus } from "@prisma/client";
import { PrismaService } from "../../../../core/prisma.service";

@Injectable()
export class LessonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveLessonDetail(id: string) {
    return this.prisma.lesson.findFirst({
      where: {
        id,
        isActive: true,
        reviewStatus: LessonReviewStatus.PUBLISHED,
        module: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        videoUrl: true,
        sourceTitle: true,
        sourceUrl: true,
        legalDocumentNo: true,
        effectiveDate: true,
        reviewedAt: true,
        reviewerNote: true,
        module: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            sortOrder: true,
            options: {
              select: {
                id: true,
                optionText: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  findActiveLessonForSubmission(lessonId: string) {
    return this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isActive: true,
        reviewStatus: LessonReviewStatus.PUBLISHED,
        module: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
      },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }
}
