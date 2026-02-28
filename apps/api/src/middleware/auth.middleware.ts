import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../db/supabase.client';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/response';
import type { SubscriptionTier } from '@forgeitup/shared';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    errorResponse(res, 'Authentication required', 401);
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const payload = jwt.verify(token, secret) as JwtPayload;

    // Load user from DB
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, subscription_tier, generations_this_month')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      errorResponse(res, 'User not found', 401);
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier as SubscriptionTier,
      generationsThisMonth: user.generations_this_month,
    };

    next();
  } catch (err) {
    logger.debug(err, 'Auth token validation failed');
    errorResponse(res, 'Invalid or expired token', 401);
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const payload = jwt.verify(token, secret) as JwtPayload;

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, subscription_tier, generations_this_month')
      .eq('id', payload.sub)
      .single();

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier as SubscriptionTier,
        generationsThisMonth: user.generations_this_month,
      };
    }
  } catch {
    // Silently fail for optional auth
  }

  next();
}
