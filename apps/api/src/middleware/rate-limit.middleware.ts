import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { PLAN_LIMITS } from '@forgeitup/shared';
import type { SubscriptionTier } from '@forgeitup/shared';
import { errorResponse } from '../utils/response';

// Global rate limit: 100 req/min per IP
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    errorResponse(res, 'Too many requests, please try again later.', 429);
  },
});

// Per-user generation rate limit (tier-aware)
export function generationRateLimit(req: Request, res: Response, next: () => void): void {
  const tier = (req.user?.subscriptionTier ?? 'free') as SubscriptionTier;
  const limit = PLAN_LIMITS[tier]?.rateLimit ?? 5;

  rateLimit({
    windowMs: 60 * 1000,
    max: limit,
    keyGenerator: (r) => r.user?.id ?? r.ip ?? 'anonymous',
    handler: (_req, _res, _next, options) => {
      errorResponse(
        res,
        `Rate limit exceeded. Your ${tier} plan allows ${options.max} generations per minute.`,
        429,
      );
    },
  })(req, res, next);
}

// Declare user type augmentation
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        subscriptionTier: SubscriptionTier;
        generationsThisMonth: number;
      };
    }
  }
}
