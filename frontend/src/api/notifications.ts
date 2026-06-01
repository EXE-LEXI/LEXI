import { apiRequest } from "./http";
import type { PaginatedResponse } from "../types/api";

export type NotificationInboxItem = {
  id: string;
  type: string;
  category: "study" | "review" | "system";
  status: string;
  title: string;
  body: string;
  data: unknown;
  ctaPath: string | null;
  ctaText: string | null;
  isRead: boolean;
  readAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export function getNotificationInbox(
  token: string,
  params: { page?: number; limit?: number; isRead?: boolean } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 50));
  if (params.isRead !== undefined) {
    query.set("isRead", String(params.isRead));
  }

  return apiRequest<PaginatedResponse<NotificationInboxItem>>(
    `/notifications/inbox?${query.toString()}`,
    { token }
  );
}

export function markNotificationRead(token: string, notificationId: string) {
  return apiRequest<{ updated: true }>(
    `/notifications/inbox/${notificationId}/read`,
    { method: "PATCH", token }
  );
}

export function markAllNotificationsRead(token: string) {
  return apiRequest<{ updated: number }>("/notifications/inbox/read-all", {
    method: "PATCH",
    token,
  });
}

export function dismissNotification(token: string, notificationId: string) {
  return apiRequest<{ deleted: true }>(
    `/notifications/inbox/${notificationId}`,
    { method: "DELETE", token }
  );
}
