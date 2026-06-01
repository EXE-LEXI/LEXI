import { apiRequest } from "./http";
import type { PaginatedResponse } from "../types/api";

export type LessonNote = {
  id: string;
  lessonId: string;
  text: string;
  videoTimeSeconds: number | null;
  createdAt: string;
  updatedAt: string;
};

export type LessonDiscussionAuthor = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

export type LessonDiscussionReply = {
  id: string;
  body: string;
  isAccepted: boolean;
  author: LessonDiscussionAuthor;
  createdAt: string;
  updatedAt: string;
};

export type LessonDiscussion = {
  id: string;
  lessonId: string;
  question: string;
  isSolved: boolean;
  author: LessonDiscussionAuthor;
  replies: LessonDiscussionReply[];
  createdAt: string;
  updatedAt: string;
};

export function getLessonNotes(token: string, lessonId: string) {
  return apiRequest<PaginatedResponse<LessonNote>>(
    `/lessons/${lessonId}/notes?page=1&limit=50`,
    { token }
  );
}

export function createLessonNote(
  token: string,
  lessonId: string,
  payload: { text: string; videoTimeSeconds?: number }
) {
  return apiRequest<LessonNote>(`/lessons/${lessonId}/notes`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function deleteLessonNote(token: string, noteId: string) {
  return apiRequest<{ deleted: true }>(`/lessons/notes/${noteId}`, {
    method: "DELETE",
    token,
  });
}

export function getLessonDiscussions(token: string, lessonId: string) {
  return apiRequest<PaginatedResponse<LessonDiscussion>>(
    `/lessons/${lessonId}/discussions?page=1&limit=50`,
    { token }
  );
}

export function createLessonDiscussion(
  token: string,
  lessonId: string,
  payload: { question: string }
) {
  return apiRequest<LessonDiscussion>(`/lessons/${lessonId}/discussions`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function createLessonDiscussionReply(
  token: string,
  discussionId: string,
  payload: { body: string }
) {
  return apiRequest<LessonDiscussion>(
    `/lessons/discussions/${discussionId}/replies`,
    {
      method: "POST",
      token,
      body: payload,
    }
  );
}
