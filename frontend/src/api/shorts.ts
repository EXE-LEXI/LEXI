import { http } from "./http";

export const shortsApi = {
  getShorts: (category?: string, limit = 10, skip = 0) => {
    return http.get("/shorts", { params: { category, limit, skip } });
  },

  getShortById: (id: string) => {
    return http.get(`/shorts/${id}`);
  },

  likeVideo: (id: string) => {
    return http.post(`/shorts/${id}/like`);
  },

  bookmarkVideo: (id: string) => {
    return http.post(`/shorts/${id}/bookmark`);
  },

  getComments: (id: string) => {
    return http.get(`/shorts/${id}/comments`);
  },

  postComment: (id: string, content: string) => {
    return http.post(`/shorts/${id}/comments`, { content });
  },
};
