import { z } from "zod";

/**
 * Common error response shape from the API
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Common success response shape
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Base schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Common loading states for components
 */
export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
}
