import { API_BASE_URL } from "./config";
import { ApiError, apiRequest } from "./http";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginatedResponse,
} from "../types/api";

export type LessonReviewStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type LessonDraftStatus = "DRAFT" | "IN_REVIEW" | "ACCEPTED" | "REJECTED";
export type LegalSourceCrawlStatus = "PENDING" | "CRAWLED" | "FAILED" | "ARCHIVED";

export type AdminCategory = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminModule = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  category: AdminCategory;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminQuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type AdminQuestion = {
  id: string;
  text: string;
  explanation: string | null;
  sortOrder: number;
  options: AdminQuestionOption[];
};

export type AdminLesson = {
  id: string;
  title: string;
  slug?: string;
  content?: string | null;
  videoUrl?: string | null;
  sourceTitle?: string | null;
  sourceUrl?: string | null;
  legalDocumentNo?: string | null;
  effectiveDate?: string | null;
  reviewedAt?: string | null;
  reviewerNote?: string | null;
  sortOrder?: number;
  module?: {
    id: string;
    title: string;
    category?: { id: string; title: string };
  };
  category?: { id?: string; title: string };
  reviewStatus?: LessonReviewStatus | string;
  isActive?: boolean;
  questions?: AdminQuestion[];
  questionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSource = {
  id: string;
  title: string;
  sourceUrl?: string | null;
  documentNo?: string | null;
  legalDocumentNo?: string | null;
  effectiveDate?: string | null;
  rawText?: string;
  normalizedText?: string | null;
  contentHash?: string | null;
  crawlStatus?: LegalSourceCrawlStatus | string;
  crawledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminDraft = {
  id: string;
  title: string;
  content?: string;
  videoScript?: string | null;
  videoPrompt?: string | null;
  reviewerNote?: string | null;
  status?: LessonDraftStatus | string;
  source?: { title: string };
  sourceDocument?: {
    id: string;
    title: string;
    legalDocumentNo?: string | null;
    sourceUrl?: string | null;
  };
  module?: { id: string; title: string } | null;
  createdLesson?: {
    id: string;
    slug: string;
    title: string;
    reviewStatus: string;
    isActive: boolean;
  } | null;
  questions?: AdminQuestion[];
  createdAt?: string;
  updatedAt?: string;
};

export type AdminMediaAsset = {
  id: string;
  lesson?: {
    id: string;
    slug: string;
    title: string;
  } | null;
  draft?: {
    id: string;
    title: string;
  } | null;
  title?: string;
  type?: string;
  assetType?: string;
  sourceType?: string;
  placement?: string;
  status?: string;
  url?: string | null;
  mimeType?: string | null;
  provider?: string | null;
  renderPrompt?: string | null;
  metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminDeliveryLog = {
  id: string;
  type?: string;
  status?: string;
  providerMessageId?: string | null;
  createdAt?: string;
};

export type AdminFeedbackReportCategory =
  | "CONTENT_ISSUE"
  | "LEGAL_CORRECTION"
  | "BUG"
  | "SUGGESTION"
  | "OTHER";

export type AdminFeedbackReportStatus =
  | "OPEN"
  | "REVIEWING"
  | "RESOLVED"
  | "DISMISSED";

export type AdminFeedbackReport = {
  id: string;
  category: AdminFeedbackReportCategory;
  status: AdminFeedbackReportStatus;
  subject: string;
  message: string;
  pagePath: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
};

export type AdminVoucherCampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";
export type AdminVoucherRedemptionStatus = "PENDING" | "FULFILLED" | "CANCELLED";

export type AdminVoucherCampaign = {
  id: string;
  title: string;
  description: string | null;
  costCoins: number;
  stock: number | null;
  status: AdminVoucherCampaignStatus;
  startsAt: string | null;
  endsAt: string | null;
  isRedeemable: boolean;
  createdAt: string;
};

export type AdminVoucherRedemption = {
  id: string;
  campaignId: string;
  costCoins: number;
  status: AdminVoucherRedemptionStatus;
  code: string | null;
  note: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
  campaign: {
    id: string;
    title: string;
  };
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  profile: {
    fullName: string;
    avatarUrl: string | null;
    xp: number;
    streak: number;
  } | null;
  level: number;
  legalCoins: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserSummary = {
  totalUsers: number;
  activeThisWeek: number;
  totalXp: number;
  totalLegalCoins: number;
};

export type AdminQuestionPayload = {
  text: string;
  explanation?: string | null;
  sortOrder?: number;
  options: Array<{
    id?: string;
    text: string;
    isCorrect: boolean;
    sortOrder?: number;
  }>;
};

export type AdminModulePayload = {
  categoryId: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type AdminLessonPayload = {
  moduleId: string;
  slug?: string | null;
  title: string;
  content?: string | null;
  videoUrl?: string | null;
  sourceTitle?: string | null;
  sourceUrl?: string | null;
  legalDocumentNo?: string | null;
  effectiveDate?: string | null;
  reviewedAt?: string | null;
  reviewerNote?: string | null;
  sortOrder?: number;
  reviewStatus?: LessonReviewStatus;
  isActive?: boolean;
};

export type AdminSourcesCrawlResponse = {
  sources: AdminSource[];
  drafts: AdminDraft[];
  errors: Array<{ url: string; message: string }>;
};

export function getAdminLessons(token: string) {
  return apiRequest<PaginatedResponse<AdminLesson>>("/admin/lessons", {
    token,
  });
}

export function getAdminCategories(token: string) {
  return apiRequest<AdminCategory[]>("/admin/categories", { token });
}

export function getAdminModules(token: string) {
  return apiRequest<PaginatedResponse<AdminModule>>("/admin/modules", {
    token,
  });
}

export function createAdminModule(token: string, payload: AdminModulePayload) {
  return apiRequest<AdminModule>("/admin/modules", {
    token,
    method: "POST",
    body: payload,
  });
}

export function updateAdminModule(
  token: string,
  moduleId: string,
  payload: Partial<AdminModulePayload>
) {
  return apiRequest<AdminModule>(`/admin/modules/${moduleId}`, {
    token,
    method: "PATCH",
    body: payload,
  });
}

export function getAdminSources(token: string) {
  return apiRequest<PaginatedResponse<AdminSource>>("/admin/sources", {
    token,
  });
}

export function getAdminLessonDrafts(token: string) {
  return apiRequest<PaginatedResponse<AdminDraft>>("/admin/ai/lesson-drafts", {
    token,
  });
}

export function getAdminMediaAssets(token: string) {
  return apiRequest<PaginatedResponse<AdminMediaAsset>>(
    "/admin/media-assets",
    { token }
  );
}

export function getAdminNotificationLogs(token: string) {
  return apiRequest<PaginatedResponse<AdminDeliveryLog>>(
    "/admin/notifications/delivery-logs",
    { token }
  );
}

export function getAdminFeedbackReports(
  token: string,
  params: {
    page?: number;
    limit?: number;
    status?: AdminFeedbackReportStatus | "all";
    category?: AdminFeedbackReportCategory | "all";
    search?: string;
  } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.search?.trim()) query.set("search", params.search.trim());

  return apiRequest<PaginatedResponse<AdminFeedbackReport>>(
    `/admin/feedback-reports?${query.toString()}`,
    { token }
  );
}

export function updateAdminFeedbackReportStatus(
  token: string,
  reportId: string,
  status: AdminFeedbackReportStatus
) {
  return apiRequest<AdminFeedbackReport>(
    `/admin/feedback-reports/${reportId}/status`,
    {
      token,
      method: "PATCH",
      body: { status },
    }
  );
}

export function getAdminVoucherCampaigns(token: string) {
  return apiRequest<AdminVoucherCampaign[]>(
    "/admin/rewards/voucher-campaigns",
    { token }
  );
}

export function createAdminVoucherCampaign(
  token: string,
  payload: {
    title: string;
    description?: string | null;
    costCoins: number;
    stock?: number | null;
    status?: AdminVoucherCampaignStatus;
    startsAt?: string | null;
    endsAt?: string | null;
  }
) {
  return apiRequest<AdminVoucherCampaign>(
    "/admin/rewards/voucher-campaigns",
    {
      token,
      method: "POST",
      body: payload,
    }
  );
}

export function updateAdminVoucherCampaign(
  token: string,
  campaignId: string,
  payload: Partial<{
    title: string;
    description: string | null;
    costCoins: number;
    stock: number | null;
    status: AdminVoucherCampaignStatus;
    startsAt: string | null;
    endsAt: string | null;
  }>
) {
  return apiRequest<AdminVoucherCampaign>(
    `/admin/rewards/voucher-campaigns/${campaignId}`,
    {
      token,
      method: "PATCH",
      body: payload,
    }
  );
}

export function getAdminVoucherRedemptions(
  token: string,
  params: { page?: number; limit?: number; status?: AdminVoucherRedemptionStatus | "all" } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  if (params.status && params.status !== "all") query.set("status", params.status);

  return apiRequest<PaginatedResponse<AdminVoucherRedemption>>(
    `/admin/rewards/voucher-redemptions?${query.toString()}`,
    { token }
  );
}

export function updateAdminVoucherRedemption(
  token: string,
  redemptionId: string,
  payload: {
    status: AdminVoucherRedemptionStatus;
    code?: string | null;
    note?: string | null;
  }
) {
  return apiRequest<AdminVoucherRedemption>(
    `/admin/rewards/voucher-redemptions/${redemptionId}`,
    {
      token,
      method: "PATCH",
      body: payload,
    }
  );
}

export function getAdminUsers(
  token: string,
  params: { page?: number; limit?: number; search?: string } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  if (params.search?.trim()) query.set("search", params.search.trim());

  return apiRequest<PaginatedResponse<AdminUser>>(
    `/admin/users?${query.toString()}`,
    { token }
  );
}

export function getAdminUserSummary(token: string) {
  return apiRequest<AdminUserSummary>("/admin/users/summary", { token });
}

export function getAdminLesson(token: string, lessonId: string) {
  return apiRequest<AdminLesson>(`/admin/lessons/${lessonId}`, { token });
}

export function createAdminLesson(token: string, payload: AdminLessonPayload) {
  return apiRequest<AdminLesson>("/admin/lessons", {
    token,
    method: "POST",
    body: payload,
  });
}

export function updateAdminLesson(token: string, lessonId: string, payload: Partial<AdminLessonPayload>) {
  return apiRequest<AdminLesson>(`/admin/lessons/${lessonId}`, {
    token,
    method: "PATCH",
    body: payload,
  });
}

export function getAdminQuestions(token: string, lessonId: string) {
  return apiRequest<AdminQuestion[]>(`/admin/lessons/${lessonId}/questions`, { token });
}

export function createAdminQuestion(token: string, lessonId: string, payload: AdminQuestionPayload) {
  return apiRequest<AdminQuestion>(`/admin/lessons/${lessonId}/questions`, {
    token,
    method: "POST",
    body: payload,
  });
}

export function createAdminQuestionsBulk(
  token: string,
  lessonId: string,
  questions: AdminQuestionPayload[]
) {
  return apiRequest<AdminQuestion[]>(
    `/admin/lessons/${lessonId}/questions/bulk`,
    {
      token,
      method: "POST",
      body: { questions },
    }
  );
}

export function updateAdminQuestion(token: string, questionId: string, payload: AdminQuestionPayload) {
  return apiRequest<AdminQuestion>(`/admin/questions/${questionId}`, {
    token,
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminQuestion(token: string, questionId: string) {
  return apiRequest<any>(`/admin/questions/${questionId}`, {
    token,
    method: "DELETE",
  });
}

export function createAdminMediaAsset(token: string, payload: any) {
  return apiRequest<any>("/admin/media-assets", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function uploadAdminMediaFile(
  token: string,
  file: File,
  title?: string,
  placement: "SHORTS" | "LESSON_RESOURCE" = "SHORTS",
  options: {
    lessonId?: string | null;
    shortsCategory?: string;
    shortsDescription?: string;
    shortsAuthor?: string;
    quizQuestion?: string;
    quizOptions?: string[];
    quizCorrectIndex?: number;
    quizExplanation?: string;
  } = {}
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("placement", placement);
  if (title?.trim()) formData.append("title", title.trim());
  if (options.lessonId) formData.append("lessonId", options.lessonId);
  if (options.shortsCategory) formData.append("shortsCategory", options.shortsCategory);
  if (options.shortsDescription?.trim()) {
    formData.append("shortsDescription", options.shortsDescription.trim());
  }
  if (options.shortsAuthor?.trim()) {
    formData.append("shortsAuthor", options.shortsAuthor.trim());
  }
  if (options.quizQuestion?.trim()) {
    formData.append("quizQuestion", options.quizQuestion.trim());
  }
  options.quizOptions?.forEach((option, index) => {
    if (option.trim()) {
      formData.append(`quizOption${index + 1}`, option.trim());
    }
  });
  if (options.quizCorrectIndex !== undefined) {
    formData.append("quizCorrectIndex", String(options.quizCorrectIndex));
  }
  if (options.quizExplanation?.trim()) {
    formData.append("quizExplanation", options.quizExplanation.trim());
  }

  const response = await fetch(`${API_BASE_URL}/admin/media-assets/upload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = (await response.json()) as
    | ApiSuccessResponse<AdminMediaAsset>
    | ApiErrorResponse;

  if (!response.ok || payload.success === false) {
    throw new ApiError(payload as ApiErrorResponse);
  }

  return (payload as ApiSuccessResponse<AdminMediaAsset>).data as AdminMediaAsset;
}

export function attachMediaAssetToLesson(token: string, assetId: string, payload: any) {
  return apiRequest<any>(`/admin/media-assets/${assetId}/attach-to-lesson`, {
    token,
    method: "POST",
    body: payload,
  });
}

export function deleteAdminMediaAsset(token: string, assetId: string) {
  return apiRequest<AdminMediaAsset>(`/admin/media-assets/${assetId}`, {
    token,
    method: "DELETE",
  });
}

export function createAdminSource(token: string, payload: any) {
  return apiRequest<AdminSource>("/admin/sources", {
    token,
    method: "POST",
    body: payload,
  });
}

export function getAdminSource(token: string, sourceId: string) {
  return apiRequest<AdminSource>(`/admin/sources/${sourceId}`, { token });
}

export function updateAdminSource(token: string, sourceId: string, payload: any) {
  return apiRequest<AdminSource>(`/admin/sources/${sourceId}`, {
    token,
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminSource(token: string, sourceId: string) {
  return apiRequest<any>(`/admin/sources/${sourceId}`, {
    token,
    method: "DELETE",
  });
}

export function crawlAdminSources(
  token: string,
  payload: {
    urls: string[];
    moduleId?: string | null;
    generateDrafts?: boolean;
    questionCount?: number;
  }
) {
  return apiRequest<AdminSourcesCrawlResponse>("/admin/sources/crawl", {
    token,
    method: "POST",
    body: payload,
  });
}

export function generateAdminLessonDraft(token: string, payload: any) {
  return apiRequest<AdminDraft>("/admin/ai/lesson-drafts/generate", {
    token,
    method: "POST",
    body: payload,
  });
}

export function getAdminLessonDraft(token: string, draftId: string) {
  return apiRequest<AdminDraft>(`/admin/ai/lesson-drafts/${draftId}`, { token });
}

export function updateAdminLessonDraft(token: string, draftId: string, payload: any) {
  return apiRequest<AdminDraft>(`/admin/ai/lesson-drafts/${draftId}`, {
    token,
    method: "PATCH",
    body: payload,
  });
}

export function createLessonFromDraft(token: string, draftId: string, payload: any) {
  return apiRequest<AdminLesson>(`/admin/ai/lesson-drafts/${draftId}/create-lesson`, {
    token,
    method: "POST",
    body: payload,
  });
}
