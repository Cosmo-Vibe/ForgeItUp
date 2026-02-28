import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    errorResponse(res, message, 422);
    return;
  }

  // Application-specific errors
  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode);
    return;
  }

  // Unexpected errors — don't leak details in production
  logger.error(err, 'Unhandled error');

  const message =
    process.env.NODE_ENV !== 'production' ? err.message : 'An internal error occurred';
  errorResponse(res, message, 500);
}
