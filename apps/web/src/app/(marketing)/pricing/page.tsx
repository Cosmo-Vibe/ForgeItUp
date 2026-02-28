'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@forgeitup/shared';

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Navbar */}
      <header className="border-b border-[#2E2E2E] bg-[#0F0F0F] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-[#F5F5F5]">ForgeItUp</span>
          </Link>
          <Link href="/register">
            <Button size="sm" variant="gradient">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#F5F5F5]">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-[#8A8A8A]">
            Start free, upgrade as you grow. Cancel anytime.
          </p>

          {/* Interval Toggle */}
          <div className="mt-8 inline-flex rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-1">
            <button
              onClick={() => setInterval('monthly')}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-all',
                interval === 'monthly'
                  ? 'bg-[#242424] text-[#F5F5F5]'
                  : 'text-[#8A8A8A] hover:text-[#F5F5F5]',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('annual')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                interval === 'annual'
                  ? 'bg-[#242424] text-[#F5F5F5]'
                  : 'text-[#8A8A8A] hover:text-[#F5F5F5]',
              )}
            >
              Annual
              <Badge variant="success" className="text-[10px] px-1">Save 30%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => {
            const isPopular = plan.name === 'pro';
            const price = interval === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const pricePerMonth = interval === 'annual' ? plan.priceAnnual / 12 : plan.priceMonthly;

            return (
              <Card
                key={plan.name}
                className={cn(
                  'relative flex flex-col border-[#2E2E2E] bg-[#1A1A1A]',
                  isPopular && 'border-primary ring-1 ring-primary/30',
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-3">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="capitalize text-[#F5F5F5]">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.name === 'free' && 'Perfect to try ForgeItUp'}
                    {plan.name === 'starter' && 'For hobbyist modders'}
                    {plan.name === 'pro' && 'For serious mod developers'}
                    {plan.name === 'team' && 'For studios and teams'}
                  </CardDescription>
                  <div className="mt-4">
                    {plan.priceMonthly === 0 ? (
                      <p className="text-4xl font-bold text-[#F5F5F5]">Free</p>
                    ) : (
                      <div>
                        <p className="text-4xl font-bold text-[#F5F5F5]">
                          ${pricePerMonth.toFixed(2)}
                          <span className="text-base font-normal text-[#8A8A8A]">/mo</span>
                        </p>
                        {interval === 'annual' && (
                          <p className="text-xs text-[#8A8A8A]">
                            ${price}/year — billed annually
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-[#8A8A8A]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.priceMonthly === 0 ? '/register' : `/register?plan=${plan.name}`}>
                    <Button
                      className="w-full"
                      variant={isPopular ? 'gradient' : 'outline'}
                    >
                      {plan.priceMonthly === 0 ? 'Start Free' : 'Get Started'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-[#F5F5F5]">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. You keep access until the end of your billing period.',
              },
              {
                q: 'Do unused generations roll over?',
                a: 'No, generation quotas reset each month. Upgrade to Pro or Team for more generations.',
              },
              {
                q: 'What Minecraft versions are supported?',
                a: 'Java Edition 1.7.10 to 1.21.x, and Bedrock Edition 1.19 to latest.',
              },
              {
                q: 'Can I use the generated code commercially?',
                a: 'Yes! You own the generated code. Use it however you like, including for paid mods on CurseForge or Modrinth.',
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-[#2E2E2E] bg-[#1A1A1A] p-5"
              >
                <p className="font-medium text-[#F5F5F5]">{q}</p>
                <p className="mt-2 text-sm text-[#8A8A8A]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
