import type { Request, Response, NextFunction } from 'express';
import { PLAN_LIMITS } from '@forgeitup/shared';
import type { SubscriptionTier } from '@forgeitup/shared';
import { errorResponse } from '../utils/response';

/**
 * Checks that the user has not exceeded their monthly generation quota.
 * Returns 402 Payment Required if quota is exceeded.
 */
export function subscriptionGuard(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    errorResponse(res, 'Authentication required', 401);
    return;
  }

  const tier = req.user.subscriptionTier as SubscriptionTier;
  const limit = PLAN_LIMITS[tier]?.generationsPerMonth ?? 1;

  if (limit !== Infinity && req.user.generationsThisMonth >= limit) {
    errorResponse(
      res,
      `You have used all ${limit} generations for this month on the ${tier} plan. Please upgrade to continue.`,
      402,
    );
    return;
  }

  next();
}

/**
 * Checks that the user has a specific tier or higher.
 */
export function requireTier(...tiers: SubscriptionTier[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401);
      return;
    }

    if (!tiers.includes(req.user.subscriptionTier)) {
      errorResponse(
        res,
        `This feature requires a ${tiers.join(' or ')} subscription.`,
        403,
      );
      return;
    }

    next();
  };
}
