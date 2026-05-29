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

// ====== AI LEARNING FEATURES ======

/**
 * Get personalized learning recommendations based on user progress
 */
export function getRecommendations(token: string, limit: number = 5) {
  return apiRequest<ContentRecommendation[]>(
    `/api/ai-learning/recommendations?limit=${limit}`,
    { token }
  );
}

/**
 * Get comprehensive user learning profile and statistics
 */
export function getLearningProfile(token: string) {
  return apiRequest<UserLearningProfile>(
    "/api/ai-learning/learning-profile",
    { token }
  );
}

/**
 * Get quiz improvement suggestions for a specific lesson
 */
export function getQuizImprovements(token: string, lessonId: string) {
  return apiRequest<QuizImprovement>(
    `/api/ai-learning/quiz-improvements/${lessonId}`,
    { token }
  );
}

/**
 * Analyze user's learning consistency and study streak
 */
export function getLearningConsistency(token: string) {
  return apiRequest<LearningConsistency>(
    "/api/ai-learning/consistency-analysis",
    { token }
  );
}

/**
 * Identify knowledge gaps and suggest related lessons
 */
export function getKnowledgeGaps(token: string, limit: number = 5) {
  return apiRequest<KnowledgeGap[]>(
    `/api/ai-learning/knowledge-gaps?limit=${limit}`,
    { token }
  );
}

/**
 * Get adaptive quiz questions with difficulty adjusted to user level
 */
export function getAdaptiveQuizQuestions(
  token: string,
  lessonId: string,
  count: number = 3
) {
  return apiRequest<AdaptiveQuestion[]>(
    `/api/ai-learning/adaptive-quiz/${lessonId}?count=${count}`,
    { token }
  );
}

/**
 * Get personalized learning path with milestones
 */
export function getLearningPath(token: string) {
  return apiRequest<LearningPath>(
    "/api/ai-learning/learning-path",
    { token }
  );
}

/**
 * Get AI-generated performance feedback for a quiz attempt
 */
export function getPerformanceFeedback(token: string, attemptId: string) {
  return apiRequest<PerformanceFeedback>(
    `/api/ai-learning/attempt/${attemptId}/feedback`,
    { token }
  );
}

/**
 * Get a hint for a specific quiz question
 */
export function getQuestionHint(token: string, questionId: string) {
  return apiRequest<QuestionHint>(
    `/api/ai-learning/hint/${questionId}`,
    { token }
  );
}

/**
 * Analyze user's learning patterns and get study recommendations
 */
export function getLearningPatterns(token: string) {
  return apiRequest<LearningPattern>(
    "/api/ai-learning/learning-patterns",
    { token }
  );
}

/**
 * Get personalized review recommendations
 */
export function getAiReviewRecommendations(
  token: string,
  limit: number = 5
) {
  return apiRequest<ReviewRecommendationItem[]>(
    `/api/ai-learning/review-recommendations?limit=${limit}`,
    { token }
  );
}
