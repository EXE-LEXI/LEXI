import { apiRequest } from "./http";

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export const gamesApi = {
  getContent: (type?: string, limit = 10) => {
    return apiRequest(`/games/content${buildQuery({ type, limit })}`);
  },

  submitAttempt: (mode: string, score: number, details?: unknown) => {
    return apiRequest("/games/attempts", {
      method: "POST",
      body: { mode, score, details },
    });
  },
};
