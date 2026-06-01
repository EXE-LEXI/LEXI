import { apiRequest } from "./http";
import type { AuthUser } from "../types/auth";

export type UpdateProfilePayload = {
  fullName?: string;
  avatarUrl?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export function getMe(token: string) {
  return apiRequest<AuthUser>("/users/me", { token });
}

export function updateMe(token: string, payload: UpdateProfilePayload) {
  return apiRequest<AuthUser>("/users/me", {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function changePassword(token: string, payload: ChangePasswordPayload) {
  return apiRequest<{ success: boolean }>("/users/me/password", {
    method: "PATCH",
    token,
    body: payload,
  });
}
