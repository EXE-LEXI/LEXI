export type ApiSuccessResponse<T> = {
  success: true;
  data: T | null;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  error: unknown;
  message: string | string[];
  path: string;
  timestamp: string;
  details?: unknown;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};
