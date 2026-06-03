import { apiRequest } from "./http";
import { API_BASE_URL } from "./config";
import type { AuthResponse, AuthUser } from "../types/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
};

export type PasswordResetRequestResponse = {
  accepted: boolean;
  resetToken?: string | null;
};

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getGoogleLoginUrl() {
  return `${API_BASE_URL}/auth/google`;
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<AuthUser>("/auth/me", { token });
}

export function refreshAuthSession(refreshToken: string) {
  return apiRequest<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function logout(refreshToken: string) {
  return apiRequest<{ message?: string }>("/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export function requestPasswordReset(email: string) {
  return apiRequest<PasswordResetRequestResponse>(
    "/auth/password-reset/request",
    {
      method: "POST",
      body: { email },
    }
  );
}

export function resetPassword(payload: {
  token: string;
  newPassword: string;
}) {
  return apiRequest<{ reset: boolean }>("/auth/password-reset/confirm", {
    method: "POST",
    body: payload,
  });
}
