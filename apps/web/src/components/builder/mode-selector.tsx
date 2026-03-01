'use client';

import { motion } from 'framer-motion';
import { Server, Smartphone, Package, Database, Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Platform, ModType } from '@forgeitup/shared';

interface ModeSelectorProps {
  selectedPlatform: Platform | null;
  selectedType: ModType | null;
  onPlatformChange: (platform: Platform) => void;
  onTypeChange: (type: ModType) => void;
}

const PLATFORMS = [
  {
    id: 'java' as Platform,
    name: 'Java Edition',
    description: 'Forge, Fabric, NeoForge, Quilt',
    icon: Server,
    color: '#22C55E',
    bgClass: 'bg-primary/10 border-primary/20 hover:border-primary/50',
    activeClass: 'border-primary bg-primary/20 ring-1 ring-primary/50',
  },
  {
    id: 'bedrock' as Platform,
    name: 'Bedrock Edition',
    description: 'Add-ons, Resource Packs, Behavior Packs',
    icon: Smartphone,
    color: '#69D3A7',
    bgClass: 'bg-bedrock/10 border-bedrock/20 hover:border-bedrock/50',
    activeClass: 'border-bedrock bg-bedrock/20 ring-1 ring-bedrock/50',
  },
];

const MOD_TYPES = {
  java: [
    {
      id: 'mod' as ModType,
      name: 'Mod',
      description: 'Full Java mod with custom code',
      icon: Package,
    },
    {
      id: 'datapack' as ModType,
      name: 'Datapack',
      description: 'JSON-based gameplay modifications',
      icon: Database,
    },
  ],
  bedrock: [
    {
      id: 'addon' as ModType,
      name: 'Add-on',
      description: 'Behavior + Resource pack bundle',
      icon: Puzzle,
    },
    {
      id: 'datapack' as ModType,
      name: 'Resource Pack',
      description: 'Textures, sounds, and visuals',
      icon: Package,
    },
  ],
};

export function ModeSelector({
  selectedPlatform,
  selectedType,
  onPlatformChange,
  onTypeChange,
}: ModeSelectorProps) {
  const availableTypes = selectedPlatform ? MOD_TYPES[selectedPlatform] : [];

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-[#8A8A8A] uppercase tracking-wider">
          Platform
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <motion.button
                key={platform.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPlatformChange(platform.id)}
                className={cn(
                  'relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200',
                  isSelected ? platform.activeClass : platform.bgClass,
                )}
                aria-pressed={isSelected}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <platform.icon
                    className="h-5 w-5"
                    style={{ color: platform.color }}
                  />
                </div>
                <div>
                  <p className="font-medium text-[#F5F5F5]">{platform.name}</p>
                  <p className="text-xs text-[#8A8A8A]">{platform.description}</p>
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="platform-indicator"
                    className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Type Selection */}
      {selectedPlatform && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="mb-3 text-sm font-medium text-[#8A8A8A] uppercase tracking-wider">
            Type
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableTypes.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTypeChange(type.id)}
                  className={cn(
                    'relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200',
                    isSelected
                      ? 'border-secondary bg-secondary/10 ring-1 ring-secondary/30'
                      : 'border-[#2E2E2E] bg-[#1A1A1A] hover:border-[#3E3E3E] hover:bg-[#242424]',
                  )}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      isSelected ? 'bg-secondary/20' : 'bg-[#242424]',
                    )}
                  >
                    <type.icon
                      className={cn(
                        'h-5 w-5',
                        isSelected ? 'text-secondary' : 'text-[#8A8A8A]',
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-[#F5F5F5]">{type.name}</p>
                    <p className="text-xs text-[#8A8A8A]">{type.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
