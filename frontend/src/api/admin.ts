import { apiRequest } from "./http";
import type { PaginatedResponse } from "../types/api";

export type AdminLesson = {
  id: string;
  title: string;
  slug?: string;
  module?: { title: string };
  category?: { title: string };
  reviewStatus?: string;
  isActive?: boolean;
  updatedAt?: string;
};

export type AdminSource = {
  id: string;
  title: string;
  documentNo?: string | null;
  crawlStatus?: string;
  updatedAt?: string;
};

export type AdminDraft = {
  id: string;
  title: string;
  status?: string;
  source?: { title: string };
  updatedAt?: string;
};

export type AdminMediaAsset = {
  id: string;
  title?: string;
  type?: string;
  status?: string;
  url?: string | null;
  updatedAt?: string;
};

export type AdminDeliveryLog = {
  id: string;
  type?: string;
  status?: string;
  providerMessageId?: string | null;
  createdAt?: string;
};

export function getAdminLessons(token: string) {
  return apiRequest<PaginatedResponse<AdminLesson>>("/admin/lessons", {
    token,
  });
}

export function getAdminSources(token: string) {
  return apiRequest<PaginatedResponse<AdminSource>>("/admin/sources", {
    token,
  });
}

export function getAdminLessonDrafts(token: string) {
  return apiRequest<PaginatedResponse<AdminDraft>>("/admin/ai/lesson-drafts", {
    token,
  });
}

export function getAdminMediaAssets(token: string) {
  return apiRequest<PaginatedResponse<AdminMediaAsset>>(
    "/admin/media-assets",
    { token }
  );
}

export function getAdminNotificationLogs(token: string) {
  return apiRequest<PaginatedResponse<AdminDeliveryLog>>(
    "/admin/notifications/delivery-logs",
    { token }
  );
}
