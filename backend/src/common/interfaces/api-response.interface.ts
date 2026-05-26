export type ApiSuccessResponse<T> = {
  success: true;
  data: T | null;
  message: string;
};
