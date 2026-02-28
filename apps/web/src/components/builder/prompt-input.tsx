'use client';

import { useState } from 'react';
import { Sparkles, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MAX_PROMPT_LENGTH } from '@/lib/constants';
import type { Platform, ModLoader } from '@forgeitup/shared';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  platform: Platform;
  loader: ModLoader;
  mcVersion: string;
  onImprove?: () => Promise<void>;
}

const EXAMPLE_PROMPTS: Record<string, string[]> = {
  java: [
    'Create a Minecraft mod that adds an obsidian sword with fire effects and +8 attack damage',
    'Add a new ore called Adamantite that spawns deep underground and can be used to craft powerful armor',
    'Create a mob called Shadow Wolf that spawns at night, drops a unique dark fur item',
    'Add a magical staff that shoots fireballs and has a custom particle effect',
    'Create a dimension called the Crystal Realm with unique biomes and structures',
  ],
  bedrock: [
    'Add-on that spawns custom fire dragons in the Nether with unique attacks',
    'Create a custom armor set called Void Armor with special visual effects',
    'Add new trading villager that sells rare enchanted items',
    'Create a custom boss mob that drops unique loot on defeat',
  ],
};

export function PromptInput({ value, onChange, platform, loader, mcVersion, onImprove }: PromptInputProps) {
  const [showExamples, setShowExamples] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const charCount = value.length;
  const isNearLimit = charCount > MAX_PROMPT_LENGTH * 0.8;
  const isOverLimit = charCount > MAX_PROMPT_LENGTH;

  const examples = EXAMPLE_PROMPTS[platform] ?? EXAMPLE_PROMPTS.java;

  const handleImprove = async () => {
    if (!onImprove || !value.trim()) return;
    setIsImproving(true);
    try {
      await onImprove();
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Describe your ${platform === 'java' ? 'mod or datapack' : 'add-on'} in natural language...\n\nExample: Create a Forge ${mcVersion} mod that adds a new dimension called the Crystal Realm with glowing ores and custom mobs.`}
          rows={8}
          className={cn(
            'w-full resize-none rounded-xl border bg-[#1A1A1A] px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#8A8A8A]',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
            'transition-all duration-200',
            isOverLimit ? 'border-red-500/50' : 'border-[#2E2E2E]',
          )}
          aria-label="Mod description prompt"
          maxLength={MAX_PROMPT_LENGTH + 100}
        />

        {/* Character count */}
        <div
          className={cn(
            'absolute bottom-3 right-3 text-xs',
            isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-[#8A8A8A]',
          )}
        >
          {charCount}/{MAX_PROMPT_LENGTH}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExamples(!showExamples)}
          className="text-[#8A8A8A]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Examples
          {showExamples ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {onImprove && value.trim() && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleImprove}
            disabled={isImproving || isOverLimit}
            className="text-secondary border-secondary/30 hover:bg-secondary/10"
          >
            <Wand2 className={cn('h-3.5 w-3.5', isImproving && 'animate-spin')} />
            {isImproving ? 'Improving...' : 'Improve with AI'}
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1 text-xs text-[#8A8A8A]">
          <span>Target:</span>
          <span className="font-medium text-[#F5F5F5]">
            {loader} {mcVersion}
          </span>
        </div>
      </div>

      {/* Examples panel */}
      {showExamples && (
        <div className="rounded-xl border border-[#2E2E2E] bg-[#1A1A1A] p-3 space-y-2">
          <p className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wider">
            Click to use example
          </p>
          {examples.map((example, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(example);
                setShowExamples(false);
              }}
              className="group w-full rounded-lg border border-[#2E2E2E] bg-[#242424] px-3 py-2 text-left text-sm text-[#8A8A8A] transition-all hover:border-primary/30 hover:bg-[#2A2A2A] hover:text-[#F5F5F5]"
            >
              <Sparkles className="mb-1 h-3 w-3 text-primary opacity-60 group-hover:opacity-100" />
              {example}
            </button>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-3">
        <p className="text-xs font-medium text-[#8A8A8A] mb-2">Tips for better results:</p>
        <ul className="space-y-1 text-xs text-[#8A8A8A]">
          <li>• Be specific about item stats, mob behaviors, and visual effects</li>
          <li>• Mention the game version if different from your selection</li>
          <li>• List all features you want included (items, blocks, recipes, etc.)</li>
          <li>• Describe the lore or theme for richer content generation</li>
        </ul>
      </div>
    </div>
  );
}
