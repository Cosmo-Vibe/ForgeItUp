import type { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { supabaseAdmin } from '../db/supabase.client';
import { generationQueue } from '../services/queue/generation.queue';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { z } from 'zod';

const PAGE_SIZE = 50;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redisForHealth: any = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
});

const updateUserSchema = z.object({
  subscriptionTier: z.enum(['free', 'starter', 'pro', 'team']).optional(),
  generationsThisMonth: z.number().int().min(0).optional(),
  subscriptionStatus: z.enum(['active', 'inactive', 'cancelled']).optional(),
});

export const adminController = {
  async getStats(_req: Request, res: Response): Promise<void> {
    const [usersResult, generationsResult, subsResult] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('generations').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_status', 'active'),
    ]);

    successResponse(res, {
      totalUsers: usersResult.count ?? 0,
      totalGenerations: generationsResult.count ?? 0,
      activeSubscriptions: subsResult.count ?? 0,
    });
  },

  async getUsers(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
    const from = (page - 1) * PAGE_SIZE;

    const { data, count, error } = await supabaseAdmin
      .from('users')
      .select(
        'id, email, display_name, subscription_tier, subscription_status, generations_this_month, login_attempts, login_locked_until, created_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      errorResponse(res, 'Failed to fetch users', 500);
      return;
    }

    successResponse(res, {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
    });
  },

  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, result.error.errors[0]?.message ?? 'Invalid input', 422);
      return;
    }

    const updates: Record<string, unknown> = {};
    if (result.data.subscriptionTier !== undefined)
      updates['subscription_tier'] = result.data.subscriptionTier;
    if (result.data.generationsThisMonth !== undefined)
      updates['generations_this_month'] = result.data.generationsThisMonth;
    if (result.data.subscriptionStatus !== undefined)
      updates['subscription_status'] = result.data.subscriptionStatus;

    if (Object.keys(updates).length === 0) {
      errorResponse(res, 'No fields to update', 400);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, subscription_tier, subscription_status, generations_this_month')
      .single();

    if (error || !data) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    logger.info({ adminUpdate: { userId: id, updates } }, 'Admin updated user');
    successResponse(res, data);
  },

  async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

    if (error) {
      errorResponse(res, 'Failed to delete user', 500);
      return;
    }

    logger.warn({ deletedUserId: id }, 'Admin deleted user');
    successResponse(res, { message: 'User deleted' });
  },

  async getGenerations(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
    const from = (page - 1) * PAGE_SIZE;

    const { data, count, error } = await supabaseAdmin
      .from('generations')
      .select(
        'id, user_id, status, platform, type, loader, mc_version, mode, prompt, config_json, output_files, error_message, ai_model_used, tokens_used, generation_time_ms, created_at, completed_at, users!inner(email)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      errorResponse(res, 'Failed to fetch generations', 500);
      return;
    }

    successResponse(res, {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
    });
  },

  async getApiKeys(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
    const from = (page - 1) * PAGE_SIZE;

    const { data, count, error } = await supabaseAdmin
      .from('api_keys')
      .select(
        'id, user_id, name, key_prefix, is_active, requests_count, last_used_at, created_at, users!inner(email)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      errorResponse(res, 'Failed to fetch API keys', 500);
      return;
    }

    successResponse(res, {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
    });
  },

  async revokeApiKey(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      errorResponse(res, 'Failed to revoke API key', 500);
      return;
    }

    logger.warn({ revokedKeyId: id }, 'Admin revoked API key');
    successResponse(res, { message: 'API key revoked' });
  },

  async getQueueStats(_req: Request, res: Response): Promise<void> {
    try {
      const counts = await generationQueue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed',
        'delayed',
        'paused',
      );
      successResponse(res, counts);
    } catch (err) {
      logger.error(err, 'Failed to get queue stats');
      errorResponse(res, 'Failed to fetch queue stats', 500);
    }
  },

  async getSystemHealth(_req: Request, res: Response): Promise<void> {
    const results: Record<string, { status: 'ok' | 'error'; latencyMs?: number; error?: string }> =
      {};

    // Redis health
    const redisStart = Date.now();
    try {
      await redisForHealth.connect().catch(() => {}); // ignore if already connected
      await redisForHealth.ping();
      results['redis'] = { status: 'ok', latencyMs: Date.now() - redisStart };
    } catch (err) {
      results['redis'] = {
        status: 'error',
        latencyMs: Date.now() - redisStart,
        error: err instanceof Error ? err.message : 'Unknown',
      };
    }

    // Supabase health
    const sbStart = Date.now();
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .select('id', { head: true, count: 'exact' })
        .limit(1);
      results['supabase'] = {
        status: error ? 'error' : 'ok',
        latencyMs: Date.now() - sbStart,
        ...(error ? { error: error.message } : {}),
      };
    } catch (err) {
      results['supabase'] = {
        status: 'error',
        latencyMs: Date.now() - sbStart,
        error: err instanceof Error ? err.message : 'Unknown',
      };
    }

    // BullMQ/Queue health
    try {
      await generationQueue.getJobCounts('waiting');
      results['queue'] = { status: 'ok' };
    } catch (err) {
      results['queue'] = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown',
      };
    }

    const allOk = Object.values(results).every((r) => r.status === 'ok');
    res.status(allOk ? 200 : 503).json({ success: allOk, data: results, error: null });
  },
};
