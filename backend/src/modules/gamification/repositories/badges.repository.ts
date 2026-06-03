import { Injectable } from "@nestjs/common";
import { BadgeCriteriaType, Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import {
  BADGE_STREAK_LOOKBACK_ATTEMPTS,
  DEFAULT_BADGES,
} from "../constants/badges.constants";

@Injectable()
export class BadgesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBadgesForUser(userId: string) {
    await this.ensureDefaultBadges();

    return this.prisma.badge.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        iconName: true,
        criteriaType: true,
        users: {
          where: { userId },
          take: 1,
          select: {
            unlockedAt: true,
          },
        },
      },
    });
  }

  async awardEarnedBadges(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date
  ): Promise<any[]> {
    const badges = await tx.badge.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        iconName: true,
        criteriaType: true,
      },
    });

    const earnedCriteria = await this.getEarnedCriteria(tx, userId, now);
    const earnedBadges = badges.filter((badge) =>
      earnedCriteria.has(badge.criteriaType)
    );
    const existingUserBadges = await tx.userBadge.findMany({
      where: {
        userId,
        badgeId: {
          in: earnedBadges.map((badge) => badge.id),
        },
      },
      select: {
        badgeId: true,
      },
    });
    const existingBadgeIds = new Set(
      existingUserBadges.map((userBadge) => userBadge.badgeId)
    );
    const newBadges = earnedBadges.filter(
      (badge) => !existingBadgeIds.has(badge.id)
    );
    const userBadges = newBadges.map((badge) => ({
      userId,
      badgeId: badge.id,
      unlockedAt: now,
    }));

    if (userBadges.length === 0) {
      return [];
    }

    await Promise.all(
      userBadges.map((userBadge) =>
        tx.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId: userBadge.userId,
              badgeId: userBadge.badgeId,
            },
          },
          create: userBadge,
          update: {},
        })
      )
    );

    return newBadges.map((badge) => ({
      ...badge,
      unlockedAt: now,
    }));
  }

  ensureDefaultBadges(
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ): Promise<void> {
    return Promise.all(
      DEFAULT_BADGES.map((badge) =>
        tx.badge.upsert({
          where: { code: badge.code },
          create: {
            code: badge.code,
            title: badge.title,
            description: badge.description,
            iconName: badge.iconName,
            criteriaType: badge.criteriaType,
            sortOrder: badge.sortOrder,
          },
          update: {
            title: badge.title,
            description: badge.description,
            iconName: badge.iconName,
            criteriaType: badge.criteriaType,
            sortOrder: badge.sortOrder,
            isActive: true,
          },
        })
      )
    ).then(() => undefined);
  }

  private async getEarnedCriteria(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date
  ): Promise<Set<BadgeCriteriaType>> {
    const [completedLessons, attemptsCount, perfectAttempts, streakAttempts] =
      await Promise.all([
        tx.userProgress.count({
          where: {
            userId,
            status: "COMPLETED",
          },
        }),
        tx.lessonAttempt.count({
          where: {
            userId,
            finishedAt: {
              not: null,
            },
          },
        }),
        tx.lessonAttempt.count({
          where: {
            userId,
            score: 100,
            finishedAt: {
              not: null,
            },
          },
        }),
        tx.lessonAttempt.findMany({
          where: {
            userId,
            finishedAt: {
              not: null,
            },
          },
          orderBy: {
            finishedAt: "desc",
          },
          take: BADGE_STREAK_LOOKBACK_ATTEMPTS,
          select: {
            finishedAt: true,
          },
        }),
      ]);

    const earned = new Set<BadgeCriteriaType>();

    if (completedLessons >= 1) {
      earned.add(BadgeCriteriaType.FIRST_LESSON);
    }
    if (completedLessons >= 3) {
      earned.add(BadgeCriteriaType.THREE_LESSONS);
    }
    if (perfectAttempts >= 1) {
      earned.add(BadgeCriteriaType.PERFECT_SCORE);
    }
    if (attemptsCount >= 5) {
      earned.add(BadgeCriteriaType.FIVE_ATTEMPTS);
    }
    if (
      this.calculateLearningStreak(
        streakAttempts
          .map((attempt) => attempt.finishedAt)
          .filter((finishedAt): finishedAt is Date => finishedAt !== null),
        now
      ) >= 7
    ) {
      earned.add(BadgeCriteriaType.SEVEN_DAY_STREAK);
    }

    return earned;
  }

  private calculateLearningStreak(attemptDates: Date[], now: Date): number {
    if (attemptDates.length === 0) {
      return 0;
    }

    const activeDateKeys = new Set(
      attemptDates.map((date) => this.toDateKey(date))
    );
    const todayKey = this.toDateKey(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = this.toDateKey(yesterday);

    if (!activeDateKeys.has(todayKey) && !activeDateKeys.has(yesterdayKey)) {
      return 0;
    }

    let cursor = new Date(now);
    if (!activeDateKeys.has(todayKey)) {
      cursor = yesterday;
    }

    let streak = 0;
    while (activeDateKeys.has(this.toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  private toDateKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }
}
