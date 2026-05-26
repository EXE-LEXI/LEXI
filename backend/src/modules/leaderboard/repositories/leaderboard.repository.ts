import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../core/prisma.service";

@Injectable()
export class LeaderboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  findWeeklyAttempts(startAt: Date, endAt: Date) {
    return this.prisma.lessonAttempt.findMany({
      where: {
        finishedAt: {
          gte: startAt,
          lt: endAt,
        },
      },
      select: {
        userId: true,
        lessonId: true,
        score: true,
        finishedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  findPreviousAttemptsBefore(
    startAt: Date,
    userIds: string[],
    lessonIds: string[]
  ) {
    if (userIds.length === 0 || lessonIds.length === 0) {
      return [];
    }

    return this.prisma.lessonAttempt.findMany({
      where: {
        userId: {
          in: userIds,
        },
        lessonId: {
          in: lessonIds,
        },
        finishedAt: {
          lt: startAt,
        },
      },
      select: {
        userId: true,
        lessonId: true,
        score: true,
      },
    });
  }

  findClaimedChallengeRewards(startAt: Date, endAt: Date) {
    return this.prisma.userChallenge.findMany({
      where: {
        claimedAt: {
          gte: startAt,
          lt: endAt,
        },
      },
      select: {
        userId: true,
        claimedAt: true,
        dailyChallenge: {
          select: {
            rewardXp: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  findUserSummary(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
