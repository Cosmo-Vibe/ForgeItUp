import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../db/supabase.client';
import { successResponse, errorResponse } from '../utils/response';
import type { Request, Response } from 'express';
import { z } from 'zod';

export const userRouter = Router();

userRouter.use(authMiddleware);

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(64).optional(),
  avatarUrl: z.string().url().optional(),
});

userRouter.patch('/me', async (req: Request, res: Response) => {
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    errorResponse(res, result.error.errors[0]?.message ?? 'Invalid input', 422);
    return;
  }

  const updates: Record<string, string> = {};
  if (result.data.displayName) updates['display_name'] = result.data.displayName;
  if (result.data.avatarUrl) updates['avatar_url'] = result.data.avatarUrl;

  if (Object.keys(updates).length === 0) {
    errorResponse(res, 'No fields to update', 400);
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', req.user!.id)
    .select('id, email, display_name, avatar_url, subscription_tier')
    .single();

  if (error || !data) {
    errorResponse(res, 'Failed to update profile', 500);
    return;
  }

  successResponse(res, data);
});
