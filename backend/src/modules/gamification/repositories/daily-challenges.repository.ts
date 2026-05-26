import { Injectable } from "@nestjs/common";
import { DailyChallengeType, LessonReviewStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import { DEFAULT_DAILY_CHALLENGES } from "../constants/gamification.constants";

@Injectable()
export class DailyChallengesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveDailyChallenges() {
    await this.ensureDefaultDailyChallenges();

    return this.prisma.dailyChallenge.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  findActiveDailyChallengeById(challengeId: string) {
    return this.prisma.dailyChallenge.findFirst({
      where: {
        id: challengeId,
        isActive: true,
      },
    });
  }

  async countDistinctCompletedLessonsForDay(
    userId: string,
    startOfDay: Date,
    startOfNextDay: Date
  ): Promise<number> {
    const lessons = await this.prisma.lessonAttempt.groupBy({
      by: ["lessonId"],
      where: {
        userId,
        finishedAt: {
          gte: startOfDay,
          lt: startOfNextDay,
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
    });

    return lessons.length;
  }

  findUserChallenge(
    userId: string,
    dailyChallengeId: string,
    challengeDate: Date
  ) {
    return this.prisma.userChallenge.findUnique({
      where: {
        userId_dailyChallengeId_challengeDate: {
          userId,
          dailyChallengeId,
          challengeDate,
        },
      },
    });
  }

  upsertUserChallengeState(params: {
    userId: string;
    dailyChallengeId: string;
    challengeDate: Date;
    progress: number;
    isCompleted: boolean;
    now: Date;
  }) {
    return this.prisma.userChallenge.upsert({
      where: {
        userId_dailyChallengeId_challengeDate: {
          userId: params.userId,
          dailyChallengeId: params.dailyChallengeId,
          challengeDate: params.challengeDate,
        },
      },
      create: {
        userId: params.userId,
        dailyChallengeId: params.dailyChallengeId,
        challengeDate: params.challengeDate,
        progress: params.progress,
        isCompleted: params.isCompleted,
        completedAt: params.isCompleted ? params.now : null,
      },
      update: {
        progress: params.progress,
        isCompleted: params.isCompleted,
        completedAt: params.isCompleted ? params.now : null,
      },
    });
  }

  claimDailyChallenge(params: {
    userId: string;
    dailyChallengeId: string;
    challengeDate: Date;
    progress: number;
    now: Date;
    rewardXp: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const userChallenge = await tx.userChallenge.upsert({
        where: {
          userId_dailyChallengeId_challengeDate: {
            userId: params.userId,
            dailyChallengeId: params.dailyChallengeId,
            challengeDate: params.challengeDate,
          },
        },
        create: {
          userId: params.userId,
          dailyChallengeId: params.dailyChallengeId,
          challengeDate: params.challengeDate,
          progress: params.progress,
          isCompleted: true,
          completedAt: params.now,
        },
        update: {
          progress: params.progress,
          isCompleted: true,
          completedAt: params.now,
        },
      });

      if (userChallenge.claimedAt !== null) {
        return {
          userChallenge,
          wasClaimed: false,
        };
      }

      const claimResult = await tx.userChallenge.updateMany({
        where: {
          id: userChallenge.id,
          claimedAt: null,
        },
        data: {
          claimedAt: params.now,
        },
      });

      if (claimResult.count === 0) {
        return {
          userChallenge,
          wasClaimed: false,
        };
      }

      await tx.userProfile.updateMany({
        where: { userId: params.userId },
        data: {
          xp: {
            increment: params.rewardXp,
          },
        },
      });

      const claimedChallenge = await tx.userChallenge.findUniqueOrThrow({
        where: { id: userChallenge.id },
      });

      return {
        userChallenge: claimedChallenge,
        wasClaimed: true,
      };
    });
  }

  private async ensureDefaultDailyChallenges(
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ): Promise<void> {
    await Promise.all(
      DEFAULT_DAILY_CHALLENGES.map((challenge) =>
        tx.dailyChallenge.upsert({
          where: { code: challenge.code },
          create: {
            code: challenge.code,
            title: challenge.title,
            description: challenge.description,
            type: challenge.type,
            target: challenge.target,
            rewardXp: challenge.rewardXp,
            sortOrder: challenge.sortOrder,
          },
          update: {
            title: challenge.title,
            description: challenge.description,
            type: challenge.type,
            target: challenge.target,
            rewardXp: challenge.rewardXp,
            sortOrder: challenge.sortOrder,
            isActive: true,
          },
        })
      )
    );
  }

  calculateProgressForChallenge(params: {
    challengeType: DailyChallengeType;
    completedLessons: number;
  }): number {
    if (params.challengeType === DailyChallengeType.COMPLETE_LESSONS) {
      return params.completedLessons;
    }

    return 0;
  }
}
