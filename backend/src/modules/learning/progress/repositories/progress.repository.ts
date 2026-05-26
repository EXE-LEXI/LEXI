import { Injectable } from "@nestjs/common";
import { LessonReviewStatus, ProgressStatus } from "@prisma/client";
import { PrismaService } from "../../../../core/prisma.service";

const currentLessonSelect = {
  id: true,
  slug: true,
  title: true,
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
} as const;

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  getProgressSummaryData(
    userId: string,
    startOfToday: Date,
    startOfTomorrow: Date,
    streakLookbackAttempts: number
  ) {
    return this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
              xp: true,
            },
          },
        },
      }),
      this.prisma.lesson.count({
        where: {
          isActive: true,
          reviewStatus: LessonReviewStatus.PUBLISHED,
          module: {
            isActive: true,
            category: {
              isActive: true,
            },
          },
        },
      }),
      this.prisma.userProgress.count({
        where: {
          userId,
          status: ProgressStatus.COMPLETED,
          lesson: {
            isActive: true,
            reviewStatus: LessonReviewStatus.PUBLISHED,
            module: {
              isActive: true,
              category: {
                isActive: true,
              },
            },
          },
        },
      }),
      this.prisma.lessonAttempt.count({
        where: {
          userId,
          finishedAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),
      this.prisma.lessonAttempt.findMany({
        where: {
          userId,
          finishedAt: {
            not: null,
          },
          lesson: {
            isActive: true,
            reviewStatus: LessonReviewStatus.PUBLISHED,
            module: {
              isActive: true,
              category: {
                isActive: true,
              },
            },
          },
        },
        orderBy: { finishedAt: "desc" },
        take: 5,
        select: {
          id: true,
          lessonId: true,
          score: true,
          correctAnswers: true,
          totalQuestions: true,
          finishedAt: true,
          lesson: {
            select: {
              title: true,
              module: {
                select: {
                  title: true,
                  category: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.lessonAttempt.findMany({
        where: {
          userId,
          finishedAt: {
            not: null,
          },
          lesson: {
            isActive: true,
            reviewStatus: LessonReviewStatus.PUBLISHED,
            module: {
              isActive: true,
              category: {
                isActive: true,
              },
            },
          },
        },
        orderBy: { finishedAt: "desc" },
        take: streakLookbackAttempts,
        select: {
          finishedAt: true,
        },
      }),
    ]);
  }

  findUserLearningHistory(userId: string, page: number, limit: number) {
    const where = {
      userId,
      finishedAt: {
        not: null,
      },
      lesson: {
        isActive: true,
        reviewStatus: LessonReviewStatus.PUBLISHED,
        module: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
      },
    } as const;

    return this.prisma.$transaction([
      this.prisma.lessonAttempt.count({
        where,
      }),
      this.prisma.lessonAttempt.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          finishedAt: "desc",
        },
        select: {
          id: true,
          lessonId: true,
          score: true,
          correctAnswers: true,
          totalQuestions: true,
          startedAt: true,
          finishedAt: true,
          lesson: {
            select: {
              id: true,
              title: true,
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
            },
          },
        },
      }),
    ]);
  }

  findUserAttemptDetail(userId: string, attemptId: string) {
    return this.prisma.lessonAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        finishedAt: {
          not: null,
        },
        lesson: {
          isActive: true,
          reviewStatus: LessonReviewStatus.PUBLISHED,
          module: {
            isActive: true,
            category: {
              isActive: true,
            },
          },
        },
      },
      select: {
        id: true,
        lessonId: true,
        score: true,
        correctAnswers: true,
        totalQuestions: true,
        startedAt: true,
        finishedAt: true,
        lesson: {
          select: {
            id: true,
            title: true,
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
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            selectedOption: {
              select: {
                id: true,
                optionText: true,
              },
            },
            isCorrect: true,
            question: {
              select: {
                id: true,
                questionText: true,
                explanation: true,
                sortOrder: true,
                options: {
                  where: {
                    isCorrect: true,
                  },
                  orderBy: {
                    sortOrder: "asc",
                  },
                  take: 1,
                  select: {
                    id: true,
                    optionText: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  findCurrentInProgressLesson(userId: string) {
    return this.prisma.userProgress.findFirst({
      where: {
        userId,
        status: ProgressStatus.IN_PROGRESS,
        lesson: {
          isActive: true,
          reviewStatus: LessonReviewStatus.PUBLISHED,
          module: {
            isActive: true,
            category: {
              isActive: true,
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        status: true,
        lastScore: true,
        completedAt: true,
        lesson: {
          select: currentLessonSelect,
        },
      },
    });
  }

  findFirstIncompleteLesson(userId: string) {
    return this.prisma.lesson.findFirst({
      where: {
        isActive: true,
        reviewStatus: LessonReviewStatus.PUBLISHED,
        module: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
        progress: {
          none: {
            userId,
            status: ProgressStatus.COMPLETED,
          },
        },
      },
      orderBy: [
        {
          module: {
            category: {
              sortOrder: "asc",
            },
          },
        },
        {
          module: {
            sortOrder: "asc",
          },
        },
        {
          sortOrder: "asc",
        },
      ],
      select: {
        ...currentLessonSelect,
        progress: {
          where: { userId },
          take: 1,
          select: {
            status: true,
            lastScore: true,
            completedAt: true,
          },
        },
      },
    });
  }
}
