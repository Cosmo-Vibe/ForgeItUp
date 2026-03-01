import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../db/supabase.client';
import { generationQueue } from '../services/queue/generation.queue';
import { storageService } from '../services/storage/s3.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { generationRequestSchema } from '@forgeitup/shared';

export const generationsController = {
  async create(req: Request, res: Response): Promise<void> {
    const result = generationRequestSchema.safeParse(req.body);
    if (!result.success) {
      errorResponse(res, result.error.errors[0]?.message ?? 'Invalid input', 422);
      return;
    }

    const config = result.data;
    const generationId = uuidv4();
    const userId = req.user!.id;

    // Create generation record
    const { error } = await supabaseAdmin.from('generations').insert({
      id: generationId,
      user_id: userId,
      status: 'pending',
      platform: config.platform,
      type: config.type,
      loader: config.loader,
      mc_version: config.mcVersion,
      loader_version: config.loaderVersion,
      mode: config.mode,
      prompt: config.prompt,
      config_json: config,
    });

    if (error) {
      logger.error(error, 'Failed to create generation record');
      errorResponse(res, 'Failed to create generation', 500);
      return;
    }

    // Increment monthly counter
    await supabaseAdmin.rpc('increment_generation_count', { user_id: userId });

    // Enqueue job (priority based on tier)
    const priority = req.user!.subscriptionTier === 'pro' || req.user!.subscriptionTier === 'team' ? 1 : 10;

    await generationQueue.add(
      'generate',
      {
        generationId,
        userId,
        config,
        tier: req.user!.subscriptionTier,
      },
      { priority },
    );

    logger.info({ generationId, userId }, 'Generation queued');

    successResponse(res, { id: generationId }, 201);
  },

  async list(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabaseAdmin
      .from('generations')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      errorResponse(res, 'Failed to fetch generations', 500);
      return;
    }

    paginatedResponse(res, data ?? [], count ?? 0, page, pageSize);
  },

  async get(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) {
      errorResponse(res, 'Generation not found', 404);
      return;
    }

    successResponse(res, data);
  },

  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('storage_path, status')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) {
      errorResponse(res, 'Generation not found', 404);
      return;
    }

    if (data.status !== 'done' || !data.storage_path) {
      errorResponse(res, 'Generation not ready for download', 400);
      return;
    }

    try {
      const { url, expiresAt } = await storageService.getSignedUrl(data.storage_path);
      successResponse(res, { url, expiresAt });
    } catch (err) {
      logger.error(err, 'Failed to generate download URL');
      errorResponse(res, 'Failed to generate download URL', 500);
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify ownership
    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('storage_path, status')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) {
      errorResponse(res, 'Generation not found', 404);
      return;
    }

    // Delete from storage if exists
    if (data.storage_path) {
      await storageService.deleteObject(data.storage_path).catch((err) =>
        logger.warn(err, 'Failed to delete storage object'),
      );
    }

    await supabaseAdmin.from('generations').delete().eq('id', id);

    successResponse(res, null);
  },

  async fork(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: original, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !original) {
      errorResponse(res, 'Generation not found', 404);
      return;
    }

    const newId = uuidv4();

    await supabaseAdmin.from('generations').insert({
      id: newId,
      user_id: userId,
      status: 'pending',
      platform: original.platform,
      type: original.type,
      loader: original.loader,
      mc_version: original.mc_version,
      loader_version: original.loader_version,
      mode: original.mode,
      prompt: original.prompt,
      config_json: original.config_json,
    });

    // Re-enqueue
    await generationQueue.add('generate', {
      generationId: newId,
      userId,
      config: original.config_json,
      tier: req.user!.subscriptionTier,
    });

    successResponse(res, { id: newId }, 201);
  },
};
