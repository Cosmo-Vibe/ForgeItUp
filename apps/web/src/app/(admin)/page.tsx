'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Zap, CreditCard, Activity, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminFetch } from '@/lib/admin-api';

interface Stats {
  totalUsers: number;
  totalGenerations: number;
  activeSubscriptions: number;
}

interface QueueCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface HealthResult {
  status: 'ok' | 'error';
  latencyMs?: number;
  error?: string;
}

interface Health {
  redis: HealthResult;
  supabase: HealthResult;
  queue: HealthResult;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<QueueCounts | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [statsRes, queueRes, healthRes] = await Promise.all([
      adminFetch('/stats').then((r) => r.json()),
      adminFetch('/queue').then((r) => r.json()),
      adminFetch('/health').then((r) => r.json()),
    ]);
    setStats(statsRes.data);
    setQueue(queueRes.data);
    setHealth(healthRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Dashboard</h1>
          <p className="text-sm text-[#8A8A8A]">Platform overview</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-400' },
          { label: 'Total Generations', value: stats?.totalGenerations, icon: Zap, color: 'text-primary' },
          { label: 'Active Subscriptions', value: stats?.activeSubscriptions, icon: CreditCard, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-[#2E2E2E] bg-[#1A1A1A]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${color}`} />
                <div>
                  <p className="text-2xl font-bold text-[#F5F5F5]">{value ?? '—'}</p>
                  <p className="text-xs text-[#8A8A8A]">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Queue Stats */}
        <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-primary" />
              Generation Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue ? (
              Object.entries(queue).map(([state, count]) => (
                <div key={state} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-[#8A8A8A]">{state}</span>
                  <Badge
                    variant={state === 'failed' ? 'destructive' : state === 'active' ? 'success' : 'default'}
                  >
                    {count}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8A8A8A]">Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
          <CardHeader>
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {health ? (
              Object.entries(health).map(([service, result]) => (
                <div key={service} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.status === 'ok' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm capitalize text-[#F5F5F5]">{service}</span>
                  </div>
                  <span className="text-xs text-[#8A8A8A]">
                    {result.latencyMs !== undefined ? `${result.latencyMs}ms` : result.error ?? '—'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8A8A8A]">Loading...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
