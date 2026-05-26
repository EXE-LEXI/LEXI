import { apiRequest } from "./http";
import type {
  LessonDetail,
  ModulesListResponse,
  QuizSubmission,
  QuizSubmissionAnswer,
} from "../types/learning";
import type { ProgressSummary } from "../types/progress";

export function getProgressSummary(token: string) {
  return apiRequest<ProgressSummary>("/progress/me/summary", { token });
}

export function getModules(token: string, page = 1, limit = 20) {
  return apiRequest<ModulesListResponse>(
    `/modules?page=${page}&limit=${limit}`,
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
