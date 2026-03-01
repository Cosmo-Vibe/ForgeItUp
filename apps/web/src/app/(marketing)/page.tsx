import Link from 'next/link';
import { ArrowRight, Zap, Github, Star, Package, Hammer, Sparkles, Globe, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Describe your mod in plain English and let AI write the complete code for you.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Globe,
    title: 'All Loaders & Versions',
    description: 'Forge, Fabric, NeoForge, Quilt, and Bedrock from 1.7.10 to 1.21.x.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: Shield,
    title: 'Production-Ready Code',
    description: 'Generated code follows best practices and includes all required metadata files.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Clock,
    title: 'Ready in 20 Seconds',
    description: 'From prompt to downloadable .jar or .zip in under 20 seconds with our priority queue.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
];

const LOADERS = [
  { name: 'Forge', color: '#FF6B35', versions: '1.7.10→1.21' },
  { name: 'Fabric', color: '#B5C5FF', versions: '1.14→1.21' },
  { name: 'NeoForge', color: '#FFD700', versions: '1.20.2→1.21' },
  { name: 'Quilt', color: '#9B59B6', versions: '1.18→1.21' },
  { name: 'Bedrock', color: '#69D3A7', versions: '1.19→latest' },
];

const EXAMPLE_MODS = [
  {
    title: 'Obsidian Sword',
    description: 'A powerful sword with fire effects and +8 attack damage',
    loader: 'Forge',
    version: '1.20.1',
    time: '8s',
    color: 'forge',
  },
  {
    title: 'Crystal Biome',
    description: 'A new dimension with glowing crystals and custom mobs',
    loader: 'Fabric',
    version: '1.21',
    time: '15s',
    color: 'fabric',
  },
  {
    title: 'Dragon Add-on',
    description: 'Custom fire-breathing dragons spawning in the Nether',
    loader: 'Bedrock',
    version: '1.21.50',
    time: '12s',
    color: 'bedrock',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#2E2E2E]/50 bg-[#0F0F0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-[#F5F5F5]">ForgeItUp</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/pricing" className="text-sm text-[#8A8A8A] hover:text-[#F5F5F5]">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-[#8A8A8A] hover:text-[#F5F5F5]">
              Docs
            </Link>
            <Link
              href="https://github.com"
              className="text-sm text-[#8A8A8A] hover:text-[#F5F5F5]"
            >
              <Github className="h-4 w-4" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#8A8A8A]">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="gradient">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pb-20 pt-24">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <Badge variant="default" className="mb-6 inline-flex">
            <Star className="h-3 w-3" />
            Now with NeoForge 1.21 support
          </Badge>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-[#F5F5F5] sm:text-6xl lg:text-7xl">
            Generate Minecraft Mods
            <br />
            <span className="gradient-text">in Seconds</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#8A8A8A]">
            Describe your mod in plain English. Our AI generates production-ready code for Forge,
            Fabric, NeoForge, Quilt, and Bedrock — ready to download in under 20 seconds.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="xl" variant="gradient" className="group gap-3">
                Start Building for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="xl" variant="outline">
                View Examples
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#8A8A8A]">
            No credit card required · 1 free generation forever
          </p>

          {/* Loader badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {LOADERS.map((loader) => (
              <div
                key={loader.name}
                className="flex items-center gap-2 rounded-full border border-[#2E2E2E] bg-[#1A1A1A] px-3 py-1.5"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: loader.color }}
                />
                <span className="text-sm font-medium" style={{ color: loader.color }}>
                  {loader.name}
                </span>
                <span className="text-xs text-[#8A8A8A]">{loader.versions}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#F5F5F5]">Everything you need to mod</h2>
          <p className="mt-3 text-[#8A8A8A]">
            Professional-grade tools made accessible to everyone
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="border-[#2E2E2E] bg-[#1A1A1A] hover:border-[#3E3E3E] transition-colors"
            >
              <CardContent className="p-6">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-[#F5F5F5]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#8A8A8A]">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Example Mods Gallery */}
      <section className="bg-[#1A1A1A] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#F5F5F5]">Mods generated with ForgeItUp</h2>
            <p className="mt-3 text-[#8A8A8A]">Real examples from our community</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {EXAMPLE_MODS.map((mod) => (
              <Card
                key={mod.title}
                className="border-[#2E2E2E] bg-[#242424] hover:border-[#3E3E3E] transition-colors"
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#8A8A8A]" />
                    <span className="text-sm font-medium text-[#F5F5F5]">{mod.title}</span>
                    <Badge variant={mod.color as 'forge' | 'fabric' | 'bedrock'} className="ml-auto">
                      {mod.loader}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#8A8A8A]">{mod.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#8A8A8A]">
                    <span>MC {mod.version}</span>
                    <span>Generated in {mod.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-[#F5F5F5]">
          Start forging your first mod
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#8A8A8A]">
          Join thousands of modders creating better Minecraft experiences. Free to start, upgrade
          when you need more.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/register">
            <Button size="xl" variant="gradient">
              <Hammer className="h-5 w-5" />
              Create Your First Mod
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="xl" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2E2E2E] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-bold text-[#F5F5F5]">ForgeItUp</span>
            </Link>
            <div className="flex gap-6 text-sm text-[#8A8A8A]">
              <Link href="/pricing" className="hover:text-[#F5F5F5]">Pricing</Link>
              <Link href="/docs" className="hover:text-[#F5F5F5]">Docs</Link>
              <Link href="/privacy" className="hover:text-[#F5F5F5]">Privacy</Link>
              <Link href="/terms" className="hover:text-[#F5F5F5]">Terms</Link>
            </div>
            <p className="text-sm text-[#8A8A8A]">
              © 2025 ForgeItUp. Not affiliated with Mojang.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
