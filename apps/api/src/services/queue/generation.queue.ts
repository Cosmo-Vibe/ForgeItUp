import { Queue, Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '../../utils/logger';
import { supabaseAdmin } from '../../db/supabase.client';
import { aiRouterService } from '../ai/ai-router.service';
import { storageService } from '../storage/s3.service';
import { buildSystemPrompt } from '../../prompts/mod-base.prompt';
import { parseAiResponse } from '../../utils/code-sanitizer';
import { createZipArchive } from '../../utils/zip-creator';
import type { GenerationConfig } from '@forgeitup/shared';

// ============================================================
// Redis Connection
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redisConnection: any = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ============================================================
// Queue Setup
// ============================================================

export const generationQueue = new Queue('generations', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 86400, count: 100 },
    removeOnFail: { age: 86400 * 7 },
  },
});

// ============================================================
// Worker
// ============================================================

interface GenerationJobData {
  generationId: string;
  userId: string;
  config: GenerationConfig;
  tier: string;
}

async function processGeneration(job: Job<GenerationJobData>): Promise<void> {
  const { generationId, userId, config } = job.data;
  const startTime = Date.now();

  logger.info({ generationId, userId }, 'Processing generation job');

  // Update status to processing
  await supabaseAdmin
    .from('generations')
    .update({ status: 'processing' })
    .eq('id', generationId);

  await job.updateProgress(10);

  try {
    // Step 1: Build system prompt
    const systemPrompt = buildSystemPrompt(config);
    const userPrompt = config.prompt ?? 'Create a basic mod with the specified configuration.';

    await job.updateProgress(20);

    // Step 2: Call AI (with retries built into the AI router)
    const aiResponse = await aiRouterService.generate({
      systemPrompt,
      userPrompt,
      complexity: estimateComplexity(config),
      maxTokens: 8000,
    });

    await job.updateProgress(60);

    // Step 3: Parse AI response into files
    const files = parseAiResponse(aiResponse, config);

    await job.updateProgress(75);

    // Step 4: Create ZIP archive
    const zipBuffer = await createZipArchive(files);

    await job.updateProgress(85);

    // Step 5: Upload to S3
    const storagePath = `${userId}/${generationId}/mod.zip`;
    const downloadUrl = await storageService.uploadBuffer(zipBuffer, storagePath, 'application/zip');

    await job.updateProgress(95);

    // Step 6: Finalize
    const generationTimeMs = Date.now() - startTime;
    const outputFiles = {
      files: files.map((f) => ({ ...f, size: Buffer.byteLength(f.content, 'utf8') })),
      storagePath,
      downloadUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await supabaseAdmin
      .from('generations')
      .update({
        status: 'done',
        output_files: outputFiles,
        storage_path: storagePath,
        ai_model_used: aiResponse.model,
        tokens_used: aiResponse.tokensUsed,
        generation_time_ms: generationTimeMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationId);

    await job.updateProgress(100);
    logger.info({ generationId, generationTimeMs }, 'Generation completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ generationId, error: errorMessage }, 'Generation failed');

    await supabaseAdmin
      .from('generations')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationId);

    throw error; // Let BullMQ handle retry logic
  }
}

function estimateComplexity(config: GenerationConfig): 'simple' | 'medium' | 'complex' {
  const prompt = config.prompt ?? '';
  const featureCount = config.features?.length ?? 0;

  if (featureCount > 5 || prompt.length > 1000) return 'complex';
  if (featureCount > 2 || prompt.length > 400) return 'medium';
  return 'simple';
}

// Start worker
export const generationWorker = new Worker<GenerationJobData>(
  'generations',
  processGeneration,
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '3'),
  },
);

generationWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

generationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Job failed');
});

generationWorker.on('error', (err) => {
  logger.error(err, 'Worker error');
});
