'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, TrendingUp, ExternalLink, Check, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { billingApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@forgeitup/shared';

interface UsageData {
  tier: string;
  generationsThisMonth: number;
  generationsLimit: number | null;
  percentageUsed: number;
}

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const result = await billingApi.getUsage();
      if (result.success) setUsage(result.data);
    } catch {
      toast.error('Failed to load usage data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') return;
    setSubscribing(tier);
    try {
      const result = await billingApi.subscribe(tier, interval);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch {
      toast.error('Failed to start checkout');
      setSubscribing(null);
    }
  };

  const handlePortal = async () => {
    try {
      const result = await billingApi.getPortalUrl();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Billing & Plans</h1>
        <p className="text-sm text-[#8A8A8A]">Manage your subscription and usage</p>
      </div>

      {/* Current Usage */}
      <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Current Usage
          </CardTitle>
          <CardDescription>Monthly generation quota</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-[#8A8A8A]">Loading usage...</span>
            </div>
          ) : usage ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#F5F5F5] font-medium">
                    {usage.generationsThisMonth} generations used
                  </span>
                  <Badge className="capitalize">{usage.tier}</Badge>
                </div>
                <span className="text-[#8A8A8A]">
                  {usage.generationsLimit === null
                    ? 'Unlimited'
                    : `${usage.generationsLimit} total`}
                </span>
              </div>
              {usage.generationsLimit !== null && (
                <Progress value={usage.percentageUsed} className="h-2" />
              )}
              {usage.generationsLimit !== null && usage.percentageUsed >= 80 && (
                <p className="text-xs text-yellow-400">
                  You&apos;ve used {usage.percentageUsed}% of your quota. Consider upgrading.
                </p>
              )}
            </div>
          ) : null}

          {usage?.tier !== 'free' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePortal}
              className="mt-4 text-[#8A8A8A]"
            >
              <ExternalLink className="h-4 w-4" />
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F5F5F5]">Upgrade Your Plan</h2>
          <div className="flex rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-1">
            <button
              onClick={() => setInterval('monthly')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all',
                interval === 'monthly'
                  ? 'bg-[#242424] text-[#F5F5F5]'
                  : 'text-[#8A8A8A]',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('annual')}
              className={cn(
                'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all',
                interval === 'annual'
                  ? 'bg-[#242424] text-[#F5F5F5]'
                  : 'text-[#8A8A8A]',
              )}
            >
              Annual
              <Badge variant="success" className="text-[9px] px-1">-30%</Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = usage?.tier === plan.name;
            const price =
              interval === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const pricePerMonth =
              interval === 'annual' ? plan.priceAnnual / 12 : plan.priceMonthly;
            const isPopular = plan.name === 'pro';

            return (
              <Card
                key={plan.name}
                className={cn(
                  'border-[#2E2E2E] bg-[#1A1A1A] relative',
                  isPopular && !isCurrent && 'border-primary/30',
                  isCurrent && 'border-primary ring-1 ring-primary/30',
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-4">
                    <Badge variant="default" className="text-xs">Current Plan</Badge>
                  </div>
                )}
                {isPopular && !isCurrent && (
                  <div className="absolute -top-2.5 left-4">
                    <Badge variant="success" className="text-xs">Popular</Badge>
                  </div>
                )}

                <CardContent className="p-4">
                  <p className="font-semibold capitalize text-[#F5F5F5]">{plan.name}</p>
                  <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">
                    {plan.priceMonthly === 0 ? 'Free' : `$${pricePerMonth.toFixed(2)}`}
                    {plan.priceMonthly > 0 && (
                      <span className="text-sm font-normal text-[#8A8A8A]">/mo</span>
                    )}
                  </p>
                  {interval === 'annual' && plan.priceAnnual > 0 && (
                    <p className="text-xs text-[#8A8A8A]">${price}/yr</p>
                  )}

                  <ul className="mt-3 space-y-1.5">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-xs text-[#8A8A8A]">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-4 w-full"
                    variant={isCurrent ? 'outline' : isPopular ? 'gradient' : 'outline'}
                    size="sm"
                    disabled={isCurrent || subscribing !== null || plan.name === 'free'}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {subscribing === plan.name ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isCurrent ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : null}
                    {isCurrent
                      ? 'Current Plan'
                      : plan.name === 'free'
                      ? 'Free Forever'
                      : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Need help */}
      <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-[#8A8A8A]" />
            <div>
              <p className="text-sm font-medium text-[#F5F5F5]">Need help with billing?</p>
              <p className="text-xs text-[#8A8A8A]">Contact us for custom enterprise pricing</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Zap className="h-4 w-4" />
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
