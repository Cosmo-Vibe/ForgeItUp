import type { ModLoader, Platform } from '../types';

export interface LoaderInfo {
  id: ModLoader;
  name: string;
  description: string;
  platform: Platform;
  color: string;
  minMcVersion?: string;
  maxMcVersion?: string;
  websiteUrl: string;
}

export const LOADERS: LoaderInfo[] = [
  {
    id: 'forge',
    name: 'Forge',
    description: 'The classic Minecraft modloader with the largest mod ecosystem.',
    platform: 'java',
    color: '#FF6B35',
    minMcVersion: '1.7.10',
    websiteUrl: 'https://minecraftforge.net',
  },
  {
    id: 'fabric',
    name: 'Fabric',
    description: 'Lightweight, experimental modding toolchain for Minecraft.',
    platform: 'java',
    color: '#B5C5FF',
    minMcVersion: '1.14',
    websiteUrl: 'https://fabricmc.net',
  },
  {
    id: 'neoforge',
    name: 'NeoForge',
    description: 'The community fork of Forge with modern improvements.',
    platform: 'java',
    color: '#FFD700',
    minMcVersion: '1.20.2',
    websiteUrl: 'https://neoforged.net',
  },
  {
    id: 'quilt',
    name: 'Quilt',
    description: 'A community-driven fork of Fabric with enhanced features.',
    platform: 'java',
    color: '#9B59B6',
    minMcVersion: '1.18',
    websiteUrl: 'https://quiltmc.org',
  },
  {
    id: 'bedrock',
    name: 'Bedrock Add-ons',
    description: 'JSON-based behavior and resource packs for Minecraft Bedrock Edition.',
    platform: 'bedrock',
    color: '#69D3A7',
    minMcVersion: '1.19.0',
    websiteUrl: 'https://learn.microsoft.com/minecraft/creator',
  },
];

export function getLoaderInfo(loader: ModLoader): LoaderInfo | undefined {
  return LOADERS.find((l) => l.id === loader);
}

/**
 * Detects the recommended loader based on MC version and platform.
 * Logic:
 * - Bedrock → bedrock
 * - Java < 1.12 → forge (legacy)
 * - Java 1.12–1.16 → forge or fabric
 * - Java 1.17–1.20.1 → fabric or forge
 * - Java 1.20.2+ → neoforge or fabric (recommended)
 */
export function detectRecommendedLoader(mcVersion: string, platform: Platform): ModLoader {
  if (platform === 'bedrock') return 'bedrock';

  const [major, minor] = mcVersion.split('.').map(Number);
  if (major < 1) return 'forge';

  if (minor < 12) return 'forge';
  if (minor <= 16) return 'forge';
  if (minor >= 20 && mcVersion >= '1.20.2') return 'neoforge';
  return 'fabric';
}

export const LOADER_DISPLAY_NAMES: Record<ModLoader, string> = {
  forge: 'Forge',
  fabric: 'Fabric',
  neoforge: 'NeoForge',
  quilt: 'Quilt',
  bedrock: 'Bedrock Add-ons',
};
