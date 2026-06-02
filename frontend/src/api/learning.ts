import { apiRequest } from "./http";
import type {
  AdaptiveQuestion,
  BadgesResponse,
  ContentRecommendation,
  DailyChallengeClaimResponse,
  DailyChallengesResponse,
  KnowledgeGap,
  LearningCategory,
  LearningConsistency,
  LearningPath,
  LearningPattern,
  LessonDetail,
  ModulesListResponse,
  NotificationPreferences,
  PerformanceFeedback,
  QuestionHint,
  QuizImprovement,
  QuizSubmission,
  QuizSubmissionAnswer,
  ReviewMistakesResponse,
  ReviewRecommendationItem,
  ReviewRecommendationsResponse,
  UserLearningProfile,
  WeeklyLeaderboard,
} from "../types/learning";
import type {
  CurrentLesson,
  LearningHistoryItem,
  ProgressSummary,
  AttemptDetail,
} from "../types/progress";
import type { PaginatedResponse } from "../types/api";

export function getProgressSummary(token: string) {
  return apiRequest<ProgressSummary>("/progress/me/summary", { token });
}

export function getCurrentLesson(token: string) {
  return apiRequest<CurrentLesson>("/progress/me/current", { token });
}

export function getLearningHistory(token: string, page = 1, limit = 10) {
  return apiRequest<PaginatedResponse<LearningHistoryItem>>(
    `/progress/me/history?page=${page}&limit=${limit}`,
    { token }
  );
}

export function getCategories(token: string) {
  return apiRequest<LearningCategory[]>("/categories", { token });
}

export function getModules(token: string, page = 1, limit = 20) {
  return apiRequest<ModulesListResponse>(
    `/modules?page=${page}&limit=${limit}`,
    { token }
  );
}

export function getModulesByCategory(
  token: string,
  categoryId: string | null,
  page = 1,
  limit = 20
) {
  const categoryQuery = categoryId ? `&categoryId=${categoryId}` : "";
  return apiRequest<ModulesListResponse>(
    `/modules?page=${page}&limit=${limit}${categoryQuery}`,
    { token }
  );
}

export function getLessonDetail(token: string, lessonId: string) {
  return apiRequest<LessonDetail>(`/lessons/${lessonId}`, { token });
}

export function submitQuiz(
  token: string,
  lessonId: string,
  answers: QuizSubmissionAnswer[]
) {
  return apiRequest<QuizSubmission>(`/lessons/${lessonId}/submit`, {
    method: "POST",
    token,
    body: { answers },
  });
}

export function getDailyChallenges(token: string) {
  return apiRequest<DailyChallengesResponse>("/gamification/daily-challenges", {
    token,
  });
}

export function claimDailyChallenge(token: string, challengeId: string) {
  return apiRequest<DailyChallengeClaimResponse>(
    `/gamification/daily-challenges/${challengeId}/claim`,
    { method: "POST", token }
  );
}

export function getBadges(token: string) {
  return apiRequest<BadgesResponse>("/gamification/badges", { token });
}

export function getWeeklyLeaderboard(token: string) {
  return apiRequest<WeeklyLeaderboard>("/leaderboard/weekly", { token });
}

export function getReviewRecommendations(token: string) {
  return apiRequest<ReviewRecommendationsResponse>("/review/recommendations", {
    token,
  });
}

export function getReviewMistakes(token: string, page = 1, limit = 10) {
  return apiRequest<ReviewMistakesResponse>(
    `/review/mistakes?page=${page}&limit=${limit}`,
    { token }
  );
}

export function getNotificationPreferences(token: string) {
  return apiRequest<NotificationPreferences>("/notifications/preferences", {
    token,
  });
}

export function updateNotificationPreferences(
  token: string,
  body: Partial<NotificationPreferences>
) {
  return apiRequest<NotificationPreferences>("/notifications/preferences", {
    method: "PATCH",
    token,
    body,
  });
}

export function upsertDeviceToken(token: string, deviceToken: string) {
  return apiRequest<{ id: string; token: string; platform: string }>(
    "/notifications/device-tokens",
    {
      method: "POST",
      token,
      body: { token: deviceToken, platform: "WEB" },
    }
  );
}

export function revokeDeviceToken(token: string, deviceToken: string) {
  return apiRequest<{ revoked: boolean }>(
    `/notifications/device-tokens/${encodeURIComponent(deviceToken)}`,
    { method: "DELETE", token }
  );
}

export function getLearningAttemptDetail(token: string, attemptId: string) {
  return apiRequest<AttemptDetail>(`/progress/me/history/${attemptId}`, { token });
}
