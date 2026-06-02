import { apiRequest } from "./http";

export type FeedbackCategory =
  | "CONTENT_ISSUE"
  | "LEGAL_CORRECTION"
  | "BUG"
  | "SUGGESTION"
  | "OTHER";

export type FeedbackReport = {
  id: string;
  category: FeedbackCategory;
  status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  subject: string;
  message: string;
  pagePath: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export function createFeedbackReport(
  token: string,
  payload: {
    category: FeedbackCategory;
    subject: string;
    message: string;
    pagePath?: string;
    metadata?: Record<string, unknown>;
  }
) {
  return apiRequest<FeedbackReport>("/feedback/reports", {
    method: "POST",
    token,
    body: payload,
  });
}
