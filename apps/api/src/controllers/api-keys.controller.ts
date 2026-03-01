import crypto from 'crypto';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.client';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { z } from 'zod';

// API key limits per subscription tier
const API_KEY_LIMITS: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 3,
  team: 10,
};

const createKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name must be at most 64 characters'),
});

function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = 'fig_' + crypto.randomBytes(32).toString('hex'); // 68 chars
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12); // "fig_" + 8 hex chars
  return { rawKey, keyHash, keyPrefix };
}

export const apiKeysController = {
  async create(req: Request, res: Response): Promise<void> {
    const result = createKeySchema.safeParse(req.body);
    if (!result.success) {
      errorResponse(res, result.error.errors[0]?.message ?? 'Invalid input', 422);
      return;
    }

    const user = req.user!;
    const tier = user.subscriptionTier;
    const limit = API_KEY_LIMITS[tier] ?? 0;

    if (limit === 0) {
      errorResponse(res, 'API key access requires a paid subscription', 403);
      return;
    }

    // Count existing active keys
    const { count, error: countError } = await supabaseAdmin
      .from('api_keys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      errorResponse(res, 'Failed to check API key limit', 500);
      return;
    }

    if ((count ?? 0) >= limit) {
      errorResponse(
        res,
        `Your ${tier} plan allows a maximum of ${limit} active API key${limit === 1 ? '' : 's'}`,
        403,
      );
      return;
    }

    const { rawKey, keyHash, keyPrefix } = generateApiKey();

    const { data: apiKey, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: result.data.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        is_active: true,
      })
      .select('id, name, key_prefix, is_active, requests_count, created_at')
      .single();

    if (error || !apiKey) {
      logger.error(error, 'Failed to create API key');
      errorResponse(res, 'Failed to create API key', 500);
      return;
    }

    logger.info({ userId: user.id, keyId: apiKey.id }, 'API key created');

    // Return raw key ONCE — never stored, cannot be recovered
    successResponse(
      res,
      {
        ...apiKey,
        rawKey, // shown only on creation
        warning: 'Store this key securely — it will never be shown again.',
      },
      201,
    );
  },

  async list(req: Request, res: Response): Promise<void> {
    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key_prefix, is_active, requests_count, last_used_at, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      errorResponse(res, 'Failed to fetch API keys', 500);
      return;
    }

    successResponse(res, keys ?? []);
  },

  async revoke(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', req.user!.id) // enforce ownership
      .select('id')
      .single();

    if (error || !data) {
      errorResponse(res, 'API key not found', 404);
      return;
    }

    logger.info({ keyId: id, userId: req.user!.id }, 'API key revoked');
    successResponse(res, { message: 'API key revoked' });
  },
};
