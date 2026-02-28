import type { Response } from 'express';
import type { ApiResponse } from '@forgeitup/shared';

export function successResponse<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = { success: true, data, error: null };
  res.status(statusCode).json(response);
}

export function errorResponse(res: Response, error: string, statusCode = 400): void {
  const response: ApiResponse<null> = { success: false, data: null, error };
  res.status(statusCode).json(response);
}

export function paginatedResponse<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): void {
  res.json({
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    },
    error: null,
  });
}
