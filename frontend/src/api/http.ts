import { API_BASE_URL } from "./config";
import type { ApiErrorResponse, ApiSuccessResponse } from "../types/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(response: ApiErrorResponse) {
    const message = Array.isArray(response.message)
      ? response.message.join(", ")
      : String(response.message);

    super(message);
    this.name = "ApiError";
    this.statusCode = response.statusCode;
    this.details = response.details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok || payload.success === false) {
    throw new ApiError(payload as ApiErrorResponse);
  }

  return (payload as ApiSuccessResponse<T>).data as T;
}
