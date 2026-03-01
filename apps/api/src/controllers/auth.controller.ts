import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../db/supabase.client';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { registerSchema, loginSchema } from '@forgeitup/shared';

const JWT_EXPIRES_IN = '30d';

function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ sub: userId, email }, secret, { expiresIn: JWT_EXPIRES_IN });
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      errorResponse(res, result.error.errors[0]?.message ?? 'Invalid input', 422);
      return;
    }

    const { email, password, displayName } = result.data;

    // Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      errorResponse(res, 'An account with this email already exists', 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: passwordHash,
        display_name: displayName ?? email.split('@')[0],
        subscription_tier: 'free',
        subscription_status: 'inactive',
        generations_this_month: 0,
      })
      .select('id, email, display_name, avatar_url, subscription_tier')
      .single();

    if (error || !user) {
      logger.error(error, 'Failed to create user');
      errorResponse(res, 'Failed to create account', 500);
      return;
    }

    const token = generateToken(user.id, user.email);

    successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          subscriptionTier: user.subscription_tier,
        },
      },
      201,
    );
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      errorResponse(res, 'Invalid email or password', 422);
      return;
    }

    const { email, password } = result.data;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(
        'id, email, password_hash, display_name, avatar_url, subscription_tier, login_attempts, login_locked_until',
      )
      .eq('email', email)
      .single();

    if (error || !user || !user.password_hash) {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }

    // Check account lockout
    if (user.login_locked_until && new Date(user.login_locked_until) > new Date()) {
      const retryAfterSec = Math.ceil(
        (new Date(user.login_locked_until).getTime() - Date.now()) / 1000,
      );
      res.setHeader('Retry-After', String(retryAfterSec));
      errorResponse(
        res,
        `Account temporarily locked due to too many failed attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        429,
      );
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      const newAttempts = (user.login_attempts ?? 0) + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await supabaseAdmin
        .from('users')
        .update({
          login_attempts: newAttempts,
          ...(lockUntil ? { login_locked_until: lockUntil.toISOString() } : {}),
        })
        .eq('id', user.id);

      if (lockUntil) {
        errorResponse(
          res,
          'Too many failed attempts. Account locked for 15 minutes.',
          429,
        );
      } else {
        errorResponse(res, 'Invalid email or password', 401);
      }
      return;
    }

    // Successful login — reset lockout counters
    await supabaseAdmin
      .from('users')
      .update({ login_attempts: 0, login_locked_until: null })
      .eq('id', user.id);

    const token = generateToken(user.id, user.email);

    successResponse(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        subscriptionTier: user.subscription_tier,
      },
    });
  },

  async logout(_req: Request, res: Response): Promise<void> {
    // JWT is stateless — client should discard the token
    successResponse(res, { message: 'Logged out successfully' });
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
      errorResponse(res, 'Email is required', 400);
      return;
    }

    // Check user exists (but don't reveal if they don't)
    await supabaseAdmin.from('users').select('id').eq('email', email).single();

    // In production: send password reset email via SendGrid/Resend
    // For MVP: just return success
    logger.info({ email }, 'Password reset requested');

    successResponse(res, { message: 'If an account exists, a reset email has been sent.' });
  },

  async resetPassword(_req: Request, res: Response): Promise<void> {
    // TODO: Implement token-based password reset
    errorResponse(res, 'Password reset via link not yet implemented', 501);
  },

  async me(req: Request, res: Response): Promise<void> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, avatar_url, subscription_tier, subscription_status, generations_this_month, created_at')
      .eq('id', req.user!.id)
      .single();

    if (error || !user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      subscriptionTier: user.subscription_tier,
      subscriptionStatus: user.subscription_status,
      generationsThisMonth: user.generations_this_month,
      createdAt: user.created_at,
    });
  },
};
