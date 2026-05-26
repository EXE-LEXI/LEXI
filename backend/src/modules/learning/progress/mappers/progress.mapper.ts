import { buildPaginationMeta } from "../../../../common/dto/pagination-meta.dto";
import {
  DAILY_LESSON_TARGET,
  XP_PER_LEVEL,
} from "../constants/progress.constants";
import { AttemptDetailResponseDto } from "../dto/response/attempt-detail-response.dto";
import { CurrentLessonResponseDto } from "../dto/response/current-lesson-response.dto";
import { LearningHistoryResponseDto } from "../dto/response/learning-history-response.dto";
import { ProgressSummaryResponseDto } from "../dto/response/progress-summary-response.dto";
import { ProgressStatus } from "@prisma/client";

export class ProgressMapper {
  static toCurrentLessonResponse(params: {
    lesson: any | null;
    progress?: any | null;
  }): CurrentLessonResponseDto {
    if (!params.lesson) {
      return {
        currentLesson: null,
        progress: null,
        isCourseCompleted: true,
      };
    }

    const progress = params.progress ?? null;

    return {
      currentLesson: {
        id: params.lesson.id,
        slug: params.lesson.slug,
        title: params.lesson.title,
        module: {
          id: params.lesson.module.id,
          title: params.lesson.module.title,
        },
        category: {
          id: params.lesson.module.category.id,
          title: params.lesson.module.category.title,
        },
      },
      progress: {
        status: progress?.status ?? ProgressStatus.NOT_STARTED,
        lastScore: progress?.lastScore ?? null,
        completedAt: progress?.completedAt ?? null,
      },
      isCourseCompleted: false,
    };
  }

  static toSummaryResponse(params: {
    user: any;
    userId: string;
    totalLessons: number;
    completedLessons: number;
    completedToday: number;
    recentAttempts: any[];
    streak: number;
  }): ProgressSummaryResponseDto {
    const xp = params.user?.profile?.xp ?? 0;
    const completionRate =
      params.totalLessons === 0
        ? 0
        : Math.round((params.completedLessons / params.totalLessons) * 100);

    return {
      user: {
        id: params.user?.id ?? params.userId,
        email: params.user?.email ?? null,
        fullName: params.user?.profile?.fullName ?? "Learner",
        avatarUrl: params.user?.profile?.avatarUrl ?? null,
      },
      stats: {
        xp,
        streak: params.streak,
        level: Math.floor(xp / XP_PER_LEVEL) + 1,
        currentLevelXp: xp % XP_PER_LEVEL,
        nextLevelXp: XP_PER_LEVEL,
      },
      lessons: {
        total: params.totalLessons,
        completed: params.completedLessons,
        remaining: Math.max(params.totalLessons - params.completedLessons, 0),
        completionRate,
      },
      dailyGoal: {
        targetLessons: DAILY_LESSON_TARGET,
        completedLessons: params.completedToday,
        completionRate: Math.min(
          Math.round((params.completedToday / DAILY_LESSON_TARGET) * 100),
          100
        ),
      },
      recentAttempts: params.recentAttempts.map((attempt) => ({
        id: attempt.id,
        lessonId: attempt.lessonId,
        lessonTitle: attempt.lesson.title,
        moduleTitle: attempt.lesson.module.title,
        categoryTitle: attempt.lesson.module.category.title,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        finishedAt: attempt.finishedAt,
      })),
    };
  }

  static toHistoryResponse(
    attempts: any[],
    total: number,
    page: number,
    limit: number
  ): LearningHistoryResponseDto {
    return {
      items: attempts.map((attempt) => ({
        id: attempt.id,
        lessonId: attempt.lessonId,
        lessonTitle: attempt.lesson.title,
        module: {
          id: attempt.lesson.module.id,
          title: attempt.lesson.module.title,
        },
        category: {
          id: attempt.lesson.module.category.id,
          title: attempt.lesson.module.category.title,
        },
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: Math.max(
          attempt.totalQuestions - attempt.correctAnswers,
          0
        ),
        totalQuestions: attempt.totalQuestions,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
      })),
      meta: buildPaginationMeta({
        total,
        page,
        limit,
      }),
    };
  }

  static toAttemptDetailResponse(attempt: any): AttemptDetailResponseDto {
    const answers = [...attempt.answers].sort(
      (left, right) => left.question.sortOrder - right.question.sortOrder
    );

    return {
      id: attempt.id,
      lesson: {
        id: attempt.lesson.id,
        title: attempt.lesson.title,
      },
      module: {
        id: attempt.lesson.module.id,
        title: attempt.lesson.module.title,
      },
      category: {
        id: attempt.lesson.module.category.id,
        title: attempt.lesson.module.category.title,
      },
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: Math.max(
        attempt.totalQuestions - attempt.correctAnswers,
        0
      ),
      totalQuestions: attempt.totalQuestions,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
      answers: answers.map((answer) => {
        const correctOption = answer.question.options[0] ?? null;

        return {
          questionId: answer.questionId,
          questionText: answer.question.questionText,
          explanation: answer.question.explanation,
          isCorrect: answer.isCorrect,
          selectedOption: {
            id: answer.selectedOption.id,
            text: answer.selectedOption.optionText,
          },
          correctOption: correctOption
            ? {
                id: correctOption.id,
                text: correctOption.optionText,
              }
            : null,
        };
      }),
    };
  }
}
