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

export const shortsApi = {
  getShorts: (category?: string, limit = 10, skip = 0) => {
    return apiRequest(`/shorts${buildQuery({ category, limit, skip })}`);
  },

  getShortById: (id: string) => {
    return apiRequest(`/shorts/${id}`);
  },

  likeVideo: (id: string) => {
    return apiRequest(`/shorts/${id}/like`, { method: "POST" });
  },

  bookmarkVideo: (id: string) => {
    return apiRequest(`/shorts/${id}/bookmark`, { method: "POST" });
  },

  getComments: (id: string) => {
    return apiRequest(`/shorts/${id}/comments`);
  },

  postComment: (id: string, content: string) => {
    return apiRequest(`/shorts/${id}/comments`, {
      method: "POST",
      body: { content },
    });
  },
};
