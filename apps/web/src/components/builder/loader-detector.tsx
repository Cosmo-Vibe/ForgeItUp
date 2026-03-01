'use client';

import { useMemo } from 'react';
import { Info, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  detectRecommendedLoader,
  getCompatibleLoaders,
  LOADER_DISPLAY_NAMES,
  type MinecraftVersion,
} from '@forgeitup/shared';
import type { Platform, ModLoader } from '@forgeitup/shared';

interface LoaderDetectorProps {
  platform: Platform;
  mcVersion: string;
  selectedLoader: ModLoader | null;
  onLoaderChange: (loader: ModLoader) => void;
}

const LOADER_COLORS: Record<ModLoader, string> = {
  forge: 'forge',
  fabric: 'fabric',
  neoforge: 'neoforge',
  quilt: 'quilt',
  bedrock: 'bedrock',
};

const LOADER_DESCRIPTIONS: Record<ModLoader, string> = {
  forge: 'The classic modloader. Largest ecosystem, great for complex mods.',
  fabric: 'Lightweight and fast. Best performance and modern API design.',
  neoforge: 'Community-driven Forge fork. Best for 1.20.2+ projects.',
  quilt: 'Fabric fork with extra features. Growing community.',
  bedrock: 'JSON-based add-ons for Bedrock Edition. No compilation needed.',
};

export function LoaderDetector({
  platform,
  mcVersion,
  selectedLoader,
  onLoaderChange,
}: LoaderDetectorProps) {
  const compatibleLoaders = useMemo(
    () => getCompatibleLoaders(mcVersion, platform),
    [mcVersion, platform],
  );

  const recommendedLoader = useMemo(
    () => detectRecommendedLoader(mcVersion, platform),
    [mcVersion, platform],
  );

  return (
    <div className="space-y-3">
      {/* Auto-detection notice */}
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm text-[#F5F5F5]">
            Auto-detected: <strong className="text-primary">{LOADER_DISPLAY_NAMES[recommendedLoader]}</strong>
          </p>
          <p className="text-xs text-[#8A8A8A]">
            Best loader for Minecraft {mcVersion} on {platform === 'java' ? 'Java' : 'Bedrock'} Edition
          </p>
        </div>
      </div>

      {/* Loader selection */}
      <div className="grid gap-2">
        {compatibleLoaders.map((loader) => {
          const isSelected = selectedLoader === loader;
          const isRecommended = loader === recommendedLoader;
          const colorVariant = LOADER_COLORS[loader] as 'forge' | 'fabric' | 'neoforge' | 'bedrock' | 'quilt';

          return (
            <button
              key={loader}
              onClick={() => onLoaderChange(loader)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150',
                isSelected
                  ? `border-[${getLoaderColor(loader)}]/50 bg-[${getLoaderColor(loader)}]/10 ring-1 ring-[${getLoaderColor(loader)}]/30`
                  : 'border-[#2E2E2E] bg-[#1A1A1A] hover:border-[#3E3E3E] hover:bg-[#242424]',
              )}
              aria-pressed={isSelected}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={colorVariant} className="font-medium">
                    {LOADER_DISPLAY_NAMES[loader]}
                  </Badge>
                  {isRecommended && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#8A8A8A]">{LOADER_DESCRIPTIONS[loader]}</p>
              </div>
              {isSelected && (
                <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-primary bg-primary/30 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {compatibleLoaders.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
          <Info className="h-4 w-4 text-yellow-400" />
          <p className="text-sm text-yellow-400">No compatible loaders found for this version.</p>
        </div>
      )}
    </div>
  );
}

function getLoaderColor(loader: ModLoader): string {
  const colors: Record<ModLoader, string> = {
    forge: '#FF6B35',
    fabric: '#B5C5FF',
    neoforge: '#FFD700',
    quilt: '#9B59B6',
    bedrock: '#69D3A7',
  };
  return colors[loader];
}
