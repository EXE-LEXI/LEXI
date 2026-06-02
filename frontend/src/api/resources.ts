import { apiRequest } from "./http";
import type { PaginatedResponse } from "../types/api";

export type ResourceLegalSourceSummary = {
  id: string;
  title: string;
  sourceUrl: string | null;
  legalDocumentNo: string | null;
  effectiveDate: string | null;
  excerpt: string;
  crawledAt: string | null;
  updatedAt: string;
};

export type ResourceLegalSourceDetail = ResourceLegalSourceSummary & {
  content: string;
};

export type ResourceMediaAsset = {
  id: string;
  title: string | null;
  assetType: string;
  sourceType: string;
  placement: string;
  url: string;
  mimeType: string | null;
  provider: string | null;
  metadata: unknown;
  lesson: {
    id: string;
    slug: string;
    title: string;
  } | null;
  updatedAt: string;
};

export function getResourceLegalSources(
  token: string,
  params: { page?: number; limit?: number; search?: string } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  return apiRequest<PaginatedResponse<ResourceLegalSourceSummary>>(
    `/resources/legal-sources?${query.toString()}`,
    { token }
  );
}

export function getResourceLegalSource(token: string, sourceId: string) {
  return apiRequest<ResourceLegalSourceDetail>(
    `/resources/legal-sources/${sourceId}`,
    { token }
  );
}

export function getResourceMediaAssets(
  token: string,
  params: { page?: number; limit?: number; search?: string; placement?: string } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 12));
  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.placement) {
    query.set("placement", params.placement);
  }

  return apiRequest<PaginatedResponse<ResourceMediaAsset>>(
    `/resources/media-assets?${query.toString()}`,
    { token }
  );
}
