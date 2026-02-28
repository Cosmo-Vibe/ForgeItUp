import type { MinecraftVersion } from '../types';

// Supported Java Edition versions (1.7.10 → 1.21.x)
export const JAVA_VERSIONS: MinecraftVersion[] = [
  // Modern Era (1.17+) — Fabric/NeoForge/Quilt recommended
  {
    id: '1.21.4',
    type: 'release',
    releaseTime: '2024-12-03',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'neoforge', 'quilt', 'forge'],
    era: 'modern',
  },
  {
    id: '1.21.1',
    type: 'release',
    releaseTime: '2024-08-08',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'neoforge', 'quilt', 'forge'],
    era: 'modern',
  },
  {
    id: '1.21',
    type: 'release',
    releaseTime: '2024-06-13',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'neoforge', 'quilt', 'forge'],
    era: 'modern',
  },
  {
    id: '1.20.6',
    type: 'release',
    releaseTime: '2024-04-29',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'neoforge', 'forge'],
    era: 'modern',
  },
  {
    id: '1.20.4',
    type: 'release',
    releaseTime: '2023-12-07',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'neoforge', 'forge', 'quilt'],
    era: 'modern',
  },
  {
    id: '1.20.2',
    type: 'release',
    releaseTime: '2023-09-25',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'neoforge', 'forge', 'quilt'],
    era: 'modern',
  },
  {
    id: '1.20.1',
    type: 'release',
    releaseTime: '2023-06-12',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'forge', 'quilt'],
    era: 'modern',
  },
  {
    id: '1.20',
    type: 'release',
    releaseTime: '2023-06-07',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'forge', 'quilt'],
    era: 'modern',
  },
  {
    id: '1.19.4',
    type: 'release',
    releaseTime: '2023-03-14',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'forge', 'quilt'],
    era: 'modern',
  },
  {
    id: '1.19.2',
    type: 'release',
    releaseTime: '2022-08-05',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'forge', 'quilt'],
    era: 'modern',
  },
  {
    id: '1.18.2',
    type: 'release',
    releaseTime: '2022-02-28',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'forge', 'quilt'],
    era: 'modern',
  },
  {
    id: '1.17.1',
    type: 'release',
    releaseTime: '2021-07-06',
    supported: true,
    platform: ['java'],
    loaders: ['fabric', 'forge'],
    era: 'modern',
  },
  // Classic Era (1.12-1.16) — Forge or Fabric
  {
    id: '1.16.5',
    type: 'release',
    releaseTime: '2021-01-15',
    supported: true,
    platform: ['java'],
    loaders: ['forge', 'fabric'],
    era: 'modern',
  },
  {
    id: '1.15.2',
    type: 'release',
    releaseTime: '2020-01-21',
    supported: true,
    platform: ['java'],
    loaders: ['forge', 'fabric'],
    era: 'modern',
  },
  {
    id: '1.14.4',
    type: 'release',
    releaseTime: '2019-07-19',
    supported: true,
    platform: ['java'],
    loaders: ['forge', 'fabric'],
    era: 'modern',
  },
  {
    id: '1.12.2',
    type: 'release',
    releaseTime: '2017-09-18',
    supported: true,
    platform: ['java'],
    loaders: ['forge'],
    era: 'legacy',
  },
  // Legacy Era (pre-1.12) — Forge only
  {
    id: '1.8.9',
    type: 'release',
    releaseTime: '2015-12-09',
    supported: true,
    platform: ['java'],
    loaders: ['forge'],
    era: 'legacy',
  },
  {
    id: '1.7.10',
    type: 'release',
    releaseTime: '2014-06-26',
    supported: true,
    platform: ['java'],
    loaders: ['forge'],
    era: 'legacy',
  },
];

// Supported Bedrock Edition versions
export const BEDROCK_VERSIONS: MinecraftVersion[] = [
  {
    id: '1.21.50',
    type: 'release',
    releaseTime: '2024-11-13',
    supported: true,
    platform: ['bedrock'],
    loaders: ['bedrock'],
    era: 'modern',
  },
  {
    id: '1.21.0',
    type: 'release',
    releaseTime: '2024-06-13',
    supported: true,
    platform: ['bedrock'],
    loaders: ['bedrock'],
    era: 'modern',
  },
  {
    id: '1.20.80',
    type: 'release',
    releaseTime: '2024-04-23',
    supported: true,
    platform: ['bedrock'],
    loaders: ['bedrock'],
    era: 'modern',
  },
  {
    id: '1.20.10',
    type: 'release',
    releaseTime: '2023-07-25',
    supported: true,
    platform: ['bedrock'],
    loaders: ['bedrock'],
    era: 'modern',
  },
  {
    id: '1.19.80',
    type: 'release',
    releaseTime: '2023-04-18',
    supported: true,
    platform: ['bedrock'],
    loaders: ['bedrock'],
    era: 'modern',
  },
  {
    id: '1.19.0',
    type: 'release',
    releaseTime: '2022-06-07',
    supported: true,
    platform: ['bedrock'],
    loaders: ['bedrock'],
    era: 'modern',
  },
];

export const ALL_VERSIONS = [...JAVA_VERSIONS, ...BEDROCK_VERSIONS];

export function getVersionsByPlatform(platform: 'java' | 'bedrock'): MinecraftVersion[] {
  return ALL_VERSIONS.filter((v) => v.platform.includes(platform));
}

export function getCompatibleLoaders(mcVersion: string, platform: 'java' | 'bedrock') {
  const version = ALL_VERSIONS.find((v) => v.id === mcVersion && v.platform.includes(platform));
  return version?.loaders ?? [];
}
