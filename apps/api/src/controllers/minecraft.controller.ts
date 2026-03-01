import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  getVersionsByPlatform,
  getCompatibleLoaders,
  detectRecommendedLoader,
  ALL_VERSIONS,
} from '@forgeitup/shared';
import { successResponse, errorResponse } from '../utils/response';

const detectLoaderSchema = z.object({
  mcVersion: z.string().min(1),
  platform: z.enum(['java', 'bedrock']),
});

export const minecraftController = {
  getVersions(req: Request, res: Response): void {
    const platform = req.query.platform as 'java' | 'bedrock' | undefined;

    if (platform && platform !== 'java' && platform !== 'bedrock') {
      errorResponse(res, 'Invalid platform. Must be "java" or "bedrock"', 400);
      return;
    }

    const versions = platform ? getVersionsByPlatform(platform) : ALL_VERSIONS;
    successResponse(res, versions);
  },

  getCompatibleLoaders(req: Request, res: Response): void {
    const version = Array.isArray(req.params.version) ? req.params.version[0] : req.params.version;
    const platform = (Array.isArray(req.query.platform)
      ? req.query.platform[0]
      : (req.query.platform ?? 'java')) as 'java' | 'bedrock';

    const loaders = getCompatibleLoaders(version ?? '', platform);

    if (loaders.length === 0) {
      errorResponse(res, `No supported loaders found for Minecraft ${version}`, 404);
      return;
    }

    successResponse(res, { version, platform, loaders });
  },

  detectLoader(req: Request, res: Response): void {
    const result = detectLoaderSchema.safeParse(req.body);
    if (!result.success) {
      errorResponse(res, result.error.errors[0]?.message ?? 'Invalid input', 422);
      return;
    }

    const { mcVersion, platform } = result.data;
    const recommended = detectRecommendedLoader(mcVersion, platform);
    const compatible = getCompatibleLoaders(mcVersion, platform);

    successResponse(res, {
      recommended,
      compatible,
      mcVersion,
      platform,
    });
  },
};
