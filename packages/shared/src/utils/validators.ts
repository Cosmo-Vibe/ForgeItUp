import { z } from 'zod';

// ============================================================
// Minecraft ID Validation
// ============================================================

export const modIdSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/, 'Mod ID must be lowercase letters, numbers, and underscores only');

export const minecraftVersionSchema = z
  .string()
  .regex(/^\d+\.\d+(\.\d+)?$/, 'Invalid Minecraft version format');

// ============================================================
// Generation Request Schema
// ============================================================

export const generationRequestSchema = z.object({
  platform: z.enum(['java', 'bedrock']),
  type: z.enum(['mod', 'datapack', 'addon']),
  loader: z.enum(['forge', 'fabric', 'neoforge', 'quilt', 'bedrock']),
  mcVersion: minecraftVersionSchema,
  loaderVersion: z.string().min(1),
  mode: z.enum(['ai', 'manual']),
  prompt: z.string().max(4000).optional(),
  features: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        config: z.record(z.unknown()),
        order: z.number().int().min(0),
      }),
    )
    .optional(),
  modId: modIdSchema.optional(),
  modName: z.string().min(1).max(128).optional(),
  author: z.string().min(1).max(128).optional(),
  description: z.string().max(512).optional(),
  version: z.string().optional(),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;

// ============================================================
// Auth Schemas
// ============================================================

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(64).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ============================================================
// Billing Schemas
// ============================================================

export const subscribeSchema = z.object({
  tier: z.enum(['starter', 'pro', 'team']),
  interval: z.enum(['monthly', 'annual']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// ============================================================
// Utility functions
// ============================================================

export function sanitizeModId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^[^a-z]/, 'mod_$&')
    .replace(/_+/g, '_')
    .slice(0, 64);
}

export function validatePrompt(prompt: string): { valid: boolean; reason?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, reason: 'Prompt cannot be empty' };
  }
  if (prompt.length > 4000) {
    return { valid: false, reason: 'Prompt is too long (max 4000 characters)' };
  }
  // Basic injection prevention
  const dangerousPatterns = [
    /ignore previous instructions/i,
    /system prompt/i,
    /you are now/i,
    /jailbreak/i,
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(prompt)) {
      return { valid: false, reason: 'Prompt contains disallowed content' };
    }
  }
  return { valid: true };
}
