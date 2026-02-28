// ============================================================
// Minecraft Types
// ============================================================

export type Platform = 'java' | 'bedrock';
export type ModType = 'mod' | 'datapack' | 'addon';
export type ModLoader = 'forge' | 'fabric' | 'neoforge' | 'quilt' | 'bedrock';
export type GenerationMode = 'ai' | 'manual';
export type GenerationStatus = 'pending' | 'processing' | 'done' | 'failed';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';

export interface MinecraftVersion {
  id: string;
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
  releaseTime: string;
  supported: boolean;
  platform: Platform[];
  loaders: ModLoader[];
  era: 'legacy' | 'modern';
}

export interface LoaderVersion {
  loader: ModLoader;
  version: string;
  mcVersion: string;
  stable: boolean;
}

// ============================================================
// Generation Types
// ============================================================

export interface GenerationConfig {
  platform: Platform;
  type: ModType;
  loader: ModLoader;
  mcVersion: string;
  loaderVersion: string;
  mode: GenerationMode;
  prompt?: string;
  features?: FeatureConfig[];
  modId?: string;
  modName?: string;
  author?: string;
  description?: string;
  version?: string;
}

export interface FeatureConfig {
  id: string;
  type: FeatureType;
  config: Record<string, unknown>;
  order: number;
}

export type FeatureType =
  | 'item'
  | 'block'
  | 'recipe'
  | 'mob'
  | 'command'
  | 'enchantment'
  | 'dimension'
  | 'biome'
  | 'worldgen'
  | 'event';

export interface GenerationOutput {
  files: GeneratedFile[];
  storagePath: string;
  downloadUrl: string;
  expiresAt: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  size: number;
}

export interface Generation {
  id: string;
  userId: string;
  status: GenerationStatus;
  platform: Platform;
  type: ModType;
  loader: ModLoader;
  mcVersion: string;
  loaderVersion: string;
  mode: GenerationMode;
  prompt?: string;
  configJson?: GenerationConfig;
  outputFiles?: GenerationOutput;
  storagePath?: string;
  aiModelUsed?: string;
  tokensUsed?: number;
  generationTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================================
// User Types
// ============================================================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  generationsThisMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

// ============================================================
// API Types
// ============================================================

export interface ApiResponse<T = null> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface GenerationStatusEvent {
  generationId: string;
  status: GenerationStatus;
  progress?: number;
  message?: string;
  logs?: string[];
}

// ============================================================
// Plan Types
// ============================================================

export interface PricingPlan {
  name: SubscriptionTier;
  priceMonthly: number;
  priceAnnual: number;
  limits: PlanLimits;
  features: string[];
}

export interface PlanLimits {
  generationsPerMonth: number | 'unlimited';
  aiMode: boolean;
  exportFormats: string[];
  priorityQueue: boolean;
  teamMembers?: number;
  apiAccess: boolean;
}
