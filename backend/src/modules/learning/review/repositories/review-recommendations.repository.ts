import { Injectable } from "@nestjs/common";
import { LessonReviewStatus, Prisma, ProgressStatus } from "@prisma/client";
import { PrismaService } from "../../../../core/prisma.service";

const recommendationLessonSelect = {
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
} satisfies Prisma.LessonSelect;

export type RecommendationLessonRecord = Prisma.LessonGetPayload<{
  select: typeof recommendationLessonSelect;
}>;

export type RecentMistakeRecommendationRecord = Prisma.UserAnswerGetPayload<{
  select: {
    questionId: true;
    createdAt: true;
    attempt: {
      select: {
        score: true;
        finishedAt: true;
      };
    };
    question: {
      select: {
        lesson: {
          select: typeof recommendationLessonSelect;
        };
      };
    };
  };
}>;

export type LowScoreRecommendationRecord = Prisma.LessonAttemptGetPayload<{
  select: {
    lessonId: true;
    score: true;
    finishedAt: true;
    lesson: {
      select: typeof recommendationLessonSelect;
    };
  };
}>;

export type InProgressRecommendationRecord = Prisma.UserProgressGetPayload<{
  select: {
    lessonId: true;
    lastScore: true;
    updatedAt: true;
    lesson: {
      select: typeof recommendationLessonSelect;
    };
  };
}>;

@Injectable()
export class ReviewRecommendationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findRecentMistakes(userId: string, take: number) {
    return this.prisma.userAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: {
          userId,
        },
        question: {
          lesson: this.activeLessonWhere(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      select: {
        questionId: true,
        createdAt: true,
        attempt: {
          select: {
            score: true,
            finishedAt: true,
          },
        },
        question: {
          select: {
            lesson: {
              select: recommendationLessonSelect,
            },
          },
        },
      },
    });
  }

  findLowScoreAttempts(userId: string, take: number, maxScore: number) {
    return this.prisma.lessonAttempt.findMany({
      where: {
        userId,
        finishedAt: {
          not: null,
        },
        score: {
          lt: maxScore,
        },
        lesson: this.activeLessonWhere(),
      },
      orderBy: [
        {
          score: "asc",
        },
        {
          finishedAt: "desc",
        },
      ],
      take,
      select: {
        lessonId: true,
        score: true,
        finishedAt: true,
        lesson: {
          select: recommendationLessonSelect,
        },
      },
    });
  }

  findInProgressLessons(userId: string, take: number) {
    return this.prisma.userProgress.findMany({
      where: {
        userId,
        status: ProgressStatus.IN_PROGRESS,
        lesson: this.activeLessonWhere(),
      },
      orderBy: {
        updatedAt: "desc",
      },
      take,
      select: {
        lessonId: true,
        lastScore: true,
        updatedAt: true,
        lesson: {
          select: recommendationLessonSelect,
        },
      },
    });
  }

  private activeLessonWhere() {
    return {
      isActive: true,
      reviewStatus: LessonReviewStatus.PUBLISHED,
      module: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
    } as const;
  }
}
