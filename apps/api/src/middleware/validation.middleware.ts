import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const zodError = result.error as ZodError;
      const message = zodError.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      errorResponse(res, message, 422);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const zodError = result.error as ZodError;
      const message = zodError.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      errorResponse(res, message, 422);
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
