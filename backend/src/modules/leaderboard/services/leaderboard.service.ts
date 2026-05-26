import { Injectable } from "@nestjs/common";
import { LeaderboardUserDto } from "../dto/response/weekly-leaderboard-response.dto";
import { LeaderboardMapper } from "../mappers/leaderboard.mapper";
import { LeaderboardRepository } from "../repositories/leaderboard.repository";

const DEFAULT_WEEKLY_LEADERBOARD_LIMIT = 10;

type UserInfo = {
  id: string;
  email: string | null;
  profile?: {
    fullName: string;
    avatarUrl: string | null;
  } | null;
};

@Injectable()
export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  async getWeeklyLeaderboard(
    currentUserId: string,
    now = new Date(),
    limit = DEFAULT_WEEKLY_LEADERBOARD_LIMIT
  ) {
    const { startAt, endAt } = this.getWeekWindow(now);
    const weeklyAttempts = await this.leaderboardRepository.findWeeklyAttempts(
      startAt,
      endAt
    );
    const weeklyUserIds = this.unique(
      weeklyAttempts.map((attempt) => attempt.userId)
    );
    const weeklyLessonIds = this.unique(
      weeklyAttempts.map((attempt) => attempt.lessonId)
    );
    const [previousAttempts, claimedRewards, currentUser] = await Promise.all([
      this.leaderboardRepository.findPreviousAttemptsBefore(
        startAt,
        weeklyUserIds,
        weeklyLessonIds
      ),
      this.leaderboardRepository.findClaimedChallengeRewards(startAt, endAt),
      this.leaderboardRepository.findUserSummary(currentUserId),
    ]);

    const userInfo = new Map<string, UserInfo>();
    const scores = new Map<string, number>();
    const previousBest = new Map<string, number>();
    const weeklyBest = new Map<string, number>();

    for (const attempt of previousAttempts) {
      const key = this.userLessonKey(attempt.userId, attempt.lessonId);
      previousBest.set(
        key,
        Math.max(previousBest.get(key) ?? 0, attempt.score)
      );
    }

    for (const attempt of weeklyAttempts) {
      userInfo.set(attempt.user.id, attempt.user);
      const key = this.userLessonKey(attempt.userId, attempt.lessonId);
      weeklyBest.set(key, Math.max(weeklyBest.get(key) ?? 0, attempt.score));
    }

    for (const [key, weeklyScore] of weeklyBest.entries()) {
      const [userId] = key.split(":");
      const improvement = Math.max(
        weeklyScore - (previousBest.get(key) ?? 0),
        0
      );
      if (improvement > 0) {
        scores.set(userId, (scores.get(userId) ?? 0) + improvement);
      }
    }

    for (const reward of claimedRewards) {
      userInfo.set(reward.user.id, reward.user);
      scores.set(
        reward.userId,
        (scores.get(reward.userId) ?? 0) + reward.dailyChallenge.rewardXp
      );
    }

    if (currentUser) {
      userInfo.set(currentUser.id, currentUser);
    }

    const rankedItems = Array.from(scores.entries())
      .map(([userId, xp]) =>
        this.toLeaderboardUser(userInfo.get(userId), userId, xp, currentUserId)
      )
      .sort((left, right) => {
        if (right.xp !== left.xp) {
          return right.xp - left.xp;
        }
        return (
          left.fullName.localeCompare(right.fullName) ||
          left.id.localeCompare(right.id)
        );
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    const currentUserRanked =
      rankedItems.find((item) => item.id === currentUserId) ??
      this.toLeaderboardUser(
        currentUser ?? null,
        currentUserId,
        0,
        currentUserId
      );

    return LeaderboardMapper.toWeeklyResponse({
      startAt,
      endAt,
      items: rankedItems.slice(0, limit),
      currentUser: currentUserRanked,
    });
  }

  private toLeaderboardUser(
    user: UserInfo | null | undefined,
    userId: string,
    xp: number,
    currentUserId: string
  ): LeaderboardUserDto {
    return {
      id: user?.id ?? userId,
      fullName: user?.profile?.fullName ?? user?.email ?? "Người học LEXI",
      avatarUrl: user?.profile?.avatarUrl ?? null,
      xp,
      rank: null,
      isCurrentUser: userId === currentUserId,
    };
  }

  private getWeekWindow(now: Date): { startAt: Date; endAt: Date } {
    const startAt = new Date(now);
    startAt.setHours(0, 0, 0, 0);
    const day = startAt.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    startAt.setDate(startAt.getDate() - daysSinceMonday);

    const endAt = new Date(startAt);
    endAt.setDate(endAt.getDate() + 7);

    return { startAt, endAt };
  }

  private userLessonKey(userId: string, lessonId: string): string {
    return `${userId}:${lessonId}`;
  }

  private unique(values: string[]): string[] {
    return Array.from(new Set(values));
  }
}
