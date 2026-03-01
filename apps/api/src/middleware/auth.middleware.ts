import crypto from 'crypto';
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

async function loadUserById(userId: string): Promise<Request['user'] | null> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, subscription_tier, generations_this_month')
    .eq('id', userId)
    .single();

  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email,
    subscriptionTier: user.subscription_tier as SubscriptionTier,
    generationsThisMonth: user.generations_this_month,
  };
}

/**
 * Primary auth middleware — supports two authentication methods:
 *
 * 1. X-API-Key header  → looked up by SHA-256 hash in api_keys table
 * 2. Authorization: Bearer <JWT>  → verified against JWT_SECRET
 *
 * Both paths end with req.user populated.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // ── Path 1: API Key ────────────────────────────────────────
  const rawApiKey = req.headers['x-api-key'] as string | undefined;

  if (rawApiKey) {
    const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    const { data: apiKey, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id, is_active')
      .eq('key_hash', keyHash)
      .single();

    if (error || !apiKey || !apiKey.is_active) {
      errorResponse(res, 'Invalid or revoked API key', 401);
      return;
    }

    const user = await loadUserById(apiKey.user_id);
    if (!user) {
      errorResponse(res, 'API key owner not found', 401);
      return;
    }

    // Fire-and-forget: atomically increment request count and update last_used_at
    void supabaseAdmin.rpc('increment_api_key_requests', { p_key_id: apiKey.id });

    req.user = user;
    next();
    return;
  }

  // ── Path 2: Bearer JWT ─────────────────────────────────────
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
    const user = await loadUserById(payload.sub);

    if (!user) {
      errorResponse(res, 'User not found', 401);
      return;
    }

    req.user = user;
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
    const user = await loadUserById(payload.sub);
    if (user) req.user = user;
  } catch {
    // Silently fail for optional auth
  }

  next();
}
