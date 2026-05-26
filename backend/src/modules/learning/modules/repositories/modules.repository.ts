import { Injectable } from "@nestjs/common";
import { LessonReviewStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../../core/prisma.service";

@Injectable()
export class ModulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveModules(params: {
    categoryId?: string;
    page: number;
    limit: number;
  }) {
    const whereClause: Prisma.LearningModuleWhereInput = {
      isActive: true,
      category: {
        isActive: true,
      },
    };
    if (params.categoryId) {
      whereClause.categoryId = params.categoryId;
    }

    return this.prisma.$transaction([
      this.prisma.learningModule.count({
        where: whereClause,
      }),
      this.prisma.learningModule.findMany({
        where: whereClause,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          lessons: {
            where: {
              isActive: true,
              reviewStatus: LessonReviewStatus.PUBLISHED,
            },
            select: {
              id: true,
              title: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
  }
}
