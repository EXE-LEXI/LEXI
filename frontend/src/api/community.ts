import { apiRequest } from "./http";

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string; // "civil" | "criminal" | "commercial"
  tags: string[];
  likes: number;
  isSolved: boolean;
  createdAt: string;
  updatedAt: string;
  comments: CommunityComment[];
}

export async function getCommunityPosts(
  token: string,
  filters?: { search?: string; category?: string }
): Promise<CommunityPost[]> {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.category) queryParams.set("category", filters.category);

  const queryStr = queryParams.toString();
  const path = `/community/posts${queryStr ? `?${queryStr}` : ""}`;

  return apiRequest<CommunityPost[]>(path, {
    token,
  });
}

export async function createCommunityPost(
  token: string,
  payload: { title: string; content: string; category: string; tags?: string[] }
): Promise<CommunityPost> {
  return apiRequest<CommunityPost>("/community/posts", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function likeCommunityPost(
  token: string,
  postId: string
): Promise<CommunityPost> {
  return apiRequest<CommunityPost>(`/community/posts/${postId}/like`, {
    method: "POST",
    token,
  });
}

export async function togglePostSolvedStatus(
  token: string,
  postId: string
): Promise<CommunityPost> {
  return apiRequest<CommunityPost>(`/community/posts/${postId}/solved`, {
    method: "PATCH",
    token,
  });
}

export async function addCommunityComment(
  token: string,
  postId: string,
  content: string
): Promise<CommunityComment> {
  return apiRequest<CommunityComment>(`/community/posts/${postId}/comments`, {
    method: "POST",
    token,
    body: { content },
  });
}

export async function deleteCommunityPost(
  token: string,
  postId: string
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/community/posts/${postId}`, {
    method: "DELETE",
    token,
  });
}
