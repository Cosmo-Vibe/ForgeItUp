import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import {
  Hammer,
  History,
  Zap,
  TrendingUp,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EXAMPLE_PROMPTS = [
  'Forge 1.20.1 sword with fire effects and custom damage',
  'Fabric 1.21 datapack with custom crafting recipe for Elytra',
  'Bedrock Add-on spawning custom dragons in the Nether',
  'NeoForge 1.20.4 biome with new ores and mobs',
];

const RECENT_LOADERS = [
  { name: 'Forge', color: 'forge', count: 0 },
  { name: 'Fabric', color: 'fabric', count: 0 },
  { name: 'NeoForge', color: 'neoforge', count: 0 },
  { name: 'Bedrock', color: 'bedrock', count: 0 },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'Modder';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5F5]">
            Welcome back, {userName}! 👋
          </h1>
          <p className="mt-1 text-[#8A8A8A]">
            Ready to forge something amazing? Start creating your next Minecraft mod.
          </p>
        </div>
        <Link href="/builder">
          <Button variant="gradient" size="lg" className="hidden sm:flex">
            <Hammer className="h-4 w-4" />
            New Generation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Generations', value: '0', icon: Package, color: 'text-primary' },
          { label: 'This Month', value: '0/1', icon: TrendingUp, color: 'text-secondary' },
          { label: 'AI Generations', value: '0', icon: Sparkles, color: 'text-yellow-400' },
          { label: 'Downloads', value: '0', icon: Zap, color: 'text-blue-400' },
        ].map((stat) => (
          <Card key={stat.label} className="border-[#2E2E2E] bg-[#1A1A1A]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg bg-[#242424] p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F5F5F5]">{stat.value}</p>
                <p className="text-xs text-[#8A8A8A]">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Start */}
        <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Start with AI
            </CardTitle>
            <CardDescription>Click a prompt to start generating instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <Link key={prompt} href={`/builder?prompt=${encodeURIComponent(prompt)}&mode=ai`}>
                <button className="group w-full rounded-lg border border-[#2E2E2E] bg-[#242424] px-4 py-3 text-left text-sm text-[#8A8A8A] transition-all hover:border-primary/40 hover:bg-[#2A2A2A] hover:text-[#F5F5F5]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1">{prompt}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
                  </div>
                </button>
              </Link>
            ))}
            <Link href="/builder?mode=ai">
              <Button variant="outline" className="mt-2 w-full text-[#8A8A8A]">
                Or write your own prompt
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Loader Stats */}
        <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-secondary" />
              Generations by Loader
            </CardTitle>
            <CardDescription>Your modding activity breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_LOADERS.map((loader) => (
              <div key={loader.name} className="flex items-center gap-3">
                <Badge variant={loader.color as 'forge' | 'fabric' | 'neoforge' | 'bedrock'} className="w-20 justify-center">
                  {loader.name}
                </Badge>
                <div className="flex-1 rounded-full bg-[#242424] h-2">
                  <div
                    className="h-2 rounded-full bg-primary/50"
                    style={{ width: `${loader.count}%` }}
                  />
                </div>
                <span className="w-4 text-right text-xs text-[#8A8A8A]">{loader.count}</span>
              </div>
            ))}

            <div className="mt-4 rounded-lg border border-dashed border-[#2E2E2E] p-4 text-center">
              <p className="text-sm text-[#8A8A8A]">No generations yet</p>
              <Link href="/builder">
                <Button variant="ghost" size="sm" className="mt-2 text-primary">
                  Create your first mod →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-[#1A1A1A] to-secondary/10 p-6">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F5]">
              Unlock unlimited generations
            </h3>
            <p className="text-sm text-[#8A8A8A]">
              Upgrade to Pro for 100 generations/month, AI mode, and all export formats.
            </p>
          </div>
          <Link href="/billing">
            <Button variant="gradient" className="shrink-0">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
        {/* Decorative glow */}
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-24 w-48 rounded-full bg-secondary/10 blur-3xl" />
      </div>
    </div>
  );
}
