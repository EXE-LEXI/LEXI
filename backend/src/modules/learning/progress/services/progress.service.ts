import { Injectable, NotFoundException } from "@nestjs/common";
import {
  DEFAULT_HISTORY_LIMIT,
  DEFAULT_HISTORY_PAGE,
  STREAK_LOOKBACK_ATTEMPTS,
} from "../constants/progress.constants";
import { AttemptDetailResponseDto } from "../dto/response/attempt-detail-response.dto";
import { CurrentLessonResponseDto } from "../dto/response/current-lesson-response.dto";
import { LearningHistoryResponseDto } from "../dto/response/learning-history-response.dto";
import { ProgressSummaryResponseDto } from "../dto/response/progress-summary-response.dto";
import { ProgressMapper } from "../mappers/progress.mapper";
import { ProgressRepository } from "../repositories/progress.repository";

@Injectable()
export class ProgressService {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async getUserProgressSummary(
    userId: string
  ): Promise<ProgressSummaryResponseDto> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [
      user,
      totalLessons,
      completedLessons,
      completedToday,
      recentAttempts,
      streakAttempts,
    ] = await this.progressRepository.getProgressSummaryData(
      userId,
      startOfToday,
      startOfTomorrow,
      STREAK_LOOKBACK_ATTEMPTS
    );

    const streak = this.calculateLearningStreak(
      streakAttempts
        .map((attempt) => attempt.finishedAt)
        .filter((finishedAt): finishedAt is Date => finishedAt !== null),
      now
    );

    return ProgressMapper.toSummaryResponse({
      user,
      userId,
      totalLessons,
      completedLessons,
      completedToday,
      recentAttempts,
      streak,
    });
  }

  async getUserCurrentLesson(
    userId: string
  ): Promise<CurrentLessonResponseDto> {
    const inProgressLesson =
      await this.progressRepository.findCurrentInProgressLesson(userId);

    if (inProgressLesson) {
      return ProgressMapper.toCurrentLessonResponse({
        lesson: inProgressLesson.lesson,
        progress: inProgressLesson,
      });
    }

    const firstIncompleteLesson =
      await this.progressRepository.findFirstIncompleteLesson(userId);

    if (!firstIncompleteLesson) {
      return ProgressMapper.toCurrentLessonResponse({
        lesson: null,
      });
    }

    return ProgressMapper.toCurrentLessonResponse({
      lesson: firstIncompleteLesson,
      progress: firstIncompleteLesson.progress[0] ?? null,
    });
  }

  async getUserLearningHistory(
    userId: string,
    page = DEFAULT_HISTORY_PAGE,
    limit = DEFAULT_HISTORY_LIMIT
  ): Promise<LearningHistoryResponseDto> {
    const [total, attempts] =
      await this.progressRepository.findUserLearningHistory(
        userId,
        page,
        limit
      );

    return ProgressMapper.toHistoryResponse(attempts, total, page, limit);
  }

  async getUserLearningHistoryLegacy(
    userId: string,
    limit = DEFAULT_HISTORY_LIMIT
  ): Promise<LearningHistoryResponseDto> {
    return this.getUserLearningHistory(userId, DEFAULT_HISTORY_PAGE, limit);
  }

  async getUserAttemptDetail(
    userId: string,
    attemptId: string
  ): Promise<AttemptDetailResponseDto> {
    const attempt = await this.progressRepository.findUserAttemptDetail(
      userId,
      attemptId
    );

    if (!attempt) {
      throw new NotFoundException("Learning attempt not found");
    }

    return ProgressMapper.toAttemptDetailResponse(attempt);
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
