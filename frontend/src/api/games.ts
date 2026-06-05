import { http } from "./http";

export const gamesApi = {
  getContent: (type?: string, limit = 10) => {
    return http.get("/games/content", { params: { type, limit } });
  },

  submitAttempt: (mode: string, score: number, details?: any) => {
    return http.post("/games/attempts", { mode, score, details });
  },
};
