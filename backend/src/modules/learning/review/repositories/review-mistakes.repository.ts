import { Injectable } from "@nestjs/common";
import { LessonReviewStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../../core/prisma.service";

const reviewMistakeInclude = {
  selectedOption: {
    select: {
      id: true,
      optionText: true,
    },
  },
  attempt: {
    select: {
      id: true,
      score: true,
      finishedAt: true,
    },
  },
  question: {
    select: {
      id: true,
      questionText: true,
      explanation: true,
      options: {
        where: {
          isCorrect: true,
        },
        select: {
          id: true,
          optionText: true,
        },
        take: 1,
      },
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
  },
} satisfies Prisma.UserAnswerInclude;

export type ReviewMistakeRecord = Prisma.UserAnswerGetPayload<{
  include: typeof reviewMistakeInclude;
}>;

@Injectable()
export class ReviewMistakesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestUniqueWrongAnswers(
    userId: string,
    page: number,
    limit: number
  ): Promise<[number, ReviewMistakeRecord[]]> {
    const latestByQuestion = new Map<string, ReviewMistakeRecord>();
    const offset = (page - 1) * limit;
    const requestedUniqueAnswers = offset + limit;
    const pageSize = Math.min(Math.max(requestedUniqueAnswers * 5, 25), 100);
    const maxScannedAnswers = Math.max(pageSize, requestedUniqueAnswers * 25);
    let scannedAnswers = 0;

    while (
      latestByQuestion.size < requestedUniqueAnswers &&
      scannedAnswers < maxScannedAnswers
    ) {
      const wrongAnswers = await this.prisma.userAnswer.findMany({
        where: {
          isCorrect: false,
          attempt: {
            userId,
          },
          question: {
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
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: scannedAnswers,
        take: pageSize,
        include: reviewMistakeInclude,
      });

      if (wrongAnswers.length === 0) {
        break;
      }

      for (const answer of wrongAnswers) {
        if (!latestByQuestion.has(answer.questionId)) {
          latestByQuestion.set(answer.questionId, answer);
        }

        if (latestByQuestion.size >= requestedUniqueAnswers) {
          break;
        }
      }

      scannedAnswers += wrongAnswers.length;

      if (wrongAnswers.length < pageSize) {
        break;
      }
    }

    const total = await this.countUniqueWrongQuestions(userId);
    const items = Array.from(latestByQuestion.values()).slice(
      offset,
      offset + limit
    );

    return [total, items];
  }

  private async countUniqueWrongQuestions(userId: string): Promise<number> {
    const groupedAnswers = await this.prisma.userAnswer.groupBy({
      by: ["questionId"],
      where: {
        isCorrect: false,
        attempt: {
          userId,
        },
        question: {
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
      },
    });

    return groupedAnswers.length;
  }
}
