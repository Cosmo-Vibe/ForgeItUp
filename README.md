# ForgeItUp

> Generate Minecraft Mods, Datapacks, and Add-ons in Seconds

ForgeItUp is a SaaS platform that lets anyone create professional-quality Minecraft mods using AI or a visual builder. Supports Forge, Fabric, NeoForge, Quilt, and Bedrock Edition.

## Features

- **AI-Powered Generation** — Describe your mod in plain English
- **All Loaders** — Forge (1.7.10+), Fabric (1.14+), NeoForge (1.20.2+), Quilt (1.18+), Bedrock Add-ons
- **Multiple Output Formats** — `.jar`, `.zip`, `.mcaddon`, `.mcpack`, `.json`
- **Real-time Progress** — Live generation status via polling
- **Generation History** — All your mods with download and fork options
- **Subscription Billing** — Stripe-powered Free/Starter/Pro/Team plans
- **FR/EN i18n** — Full internationalization support

## Architecture

```
forgeitup/
├── apps/
│   ├── web/          # Next.js 14 frontend (Vercel)
│   └── api/          # Express API (Railway)
├── packages/
│   └── shared/       # Shared types & utilities
└── infra/            # Docker Compose, Dockerfiles, CI/CD
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TailwindCSS, shadcn/ui, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Auth | NextAuth.js, Firebase Auth |
| Database | Supabase (PostgreSQL) |
| Cache/Queue | Redis + BullMQ |
| AI | OpenAI GPT-4o, GPT-4o-mini |
| Storage | AWS S3 + CloudFront |
| Payments | Stripe |
| Deployment | Vercel + Railway |

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker (for Redis)

### Setup

```bash
# Clone and install
cd forgeitup
pnpm install

# Setup environment
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
# Fill in your API keys in both files

# Start Redis
cd infra && docker compose up -d redis && cd ..

# Start development
pnpm dev
```

## Subscription Plans

| Plan | Price | Generations/mo | AI Mode | Formats |
|------|-------|----------------|---------|---------|
| Free | $0 | 1 | ✗ | .zip |
| Starter | $4.99/mo | 20 | ✓ | .zip, .jar |
| Pro | $12.99/mo | 100 | ✓ | All |
| Team | $29.99/mo | Unlimited | ✓ | All + API |

## Database Setup

Run the migration in your Supabase SQL editor:
`apps/api/src/db/migrations/001_initial.sql`

## Deployment

- **Frontend**: Auto-deploys to Vercel from `main` branch
- **Backend**: Auto-deploys to Railway from `main` branch

## License

All Rights Reserved © 2025 ForgeItUp