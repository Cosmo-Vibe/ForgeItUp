'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getVersionsByPlatform, type MinecraftVersion } from '@forgeitup/shared';
import type { Platform } from '@forgeitup/shared';

interface VersionPickerProps {
  platform: Platform;
  selectedVersion: string | null;
  onVersionChange: (version: string) => void;
}

export function VersionPicker({ platform, selectedVersion, onVersionChange }: VersionPickerProps) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const versions = useMemo(() => getVersionsByPlatform(platform), [platform]);

  const filteredVersions = useMemo(() => {
    const filtered = versions.filter(
      (v) => !search || v.id.includes(search) || v.type.includes(search),
    );
    return showAll ? filtered : filtered.slice(0, 12);
  }, [versions, search, showAll]);

  const groupedByEra = useMemo(() => {
    const groups: Record<string, MinecraftVersion[]> = {};
    for (const v of filteredVersions) {
      const key = v.era === 'modern' ? 'Modern (1.17+)' : 'Legacy (< 1.17)';
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    }
    return groups;
  }, [filteredVersions]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
        <Input
          placeholder="Search versions (e.g. 1.20.1)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-2">
        {Object.entries(groupedByEra).map(([era, eraVersions]) => (
          <div key={era} className="mb-2 last:mb-0">
            <p className="mb-1 px-2 text-xs font-medium text-[#8A8A8A] uppercase tracking-wider">
              {era}
            </p>
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
              {eraVersions.map((version) => {
                const isSelected = selectedVersion === version.id;
                return (
                  <button
                    key={version.id}
                    onClick={() => onVersionChange(version.id)}
                    className={cn(
                      'group flex flex-col items-center rounded-lg px-2 py-1.5 text-xs transition-all',
                      isSelected
                        ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                        : 'text-[#8A8A8A] hover:bg-[#242424] hover:text-[#F5F5F5]',
                    )}
                  >
                    <span className="font-mono font-medium">{version.id}</span>
                    <span
                      className={cn(
                        'text-[10px]',
                        isSelected ? 'text-primary/70' : 'text-[#8A8A8A]',
                      )}
                    >
                      {version.loaders.length} loader{version.loaders.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {versions.length > 12 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="flex w-full items-center justify-center gap-1 text-xs text-[#8A8A8A] hover:text-[#F5F5F5]"
        >
          Show all versions ({versions.length} total)
          <ChevronDown className="h-3 w-3" />
        </button>
      )}

      {selectedVersion && (
        <div className="flex items-center gap-2 text-sm text-[#8A8A8A]">
          <span>Selected:</span>
          <Badge variant="default" className="font-mono">
            Minecraft {selectedVersion}
          </Badge>
        </div>
      )}
    </div>
  );
}
