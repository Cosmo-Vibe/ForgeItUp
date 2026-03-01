'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, Pause, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-api';

interface QueueCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

const STATE_CONFIG: Record<string, { color: string; bg: string }> = {
  active:    { color: 'text-green-400',  bg: 'bg-green-400' },
  waiting:   { color: 'text-yellow-400', bg: 'bg-yellow-400' },
  delayed:   { color: 'text-blue-400',   bg: 'bg-blue-400' },
  completed: { color: 'text-[#8A8A8A]',  bg: 'bg-[#8A8A8A]' },
  failed:    { color: 'text-red-400',    bg: 'bg-red-400' },
  paused:    { color: 'text-purple-400', bg: 'bg-purple-400' },
};

export default function AdminQueuePage() {
  const [counts, setCounts] = useState<QueueCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/queue');
    const json = await res.json();
    setCounts(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(load, 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, load]);

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Generation Queue</h1>
          <p className="text-sm text-[#8A8A8A]">{total} total jobs</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {autoRefresh && (
        <p className="text-xs text-[#8A8A8A]">Auto-refreshing every 5 seconds</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {counts &&
          Object.entries(counts).map(([state, count]) => {
            const cfg = STATE_CONFIG[state] ?? { color: 'text-[#8A8A8A]', bg: 'bg-[#8A8A8A]' };
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <Card key={state} className="border-[#2E2E2E] bg-[#1A1A1A]">
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm capitalize ${cfg.color}`}>{state}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#F5F5F5]">{count}</p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-[#2E2E2E]">
                    <div
                      className={`h-1.5 rounded-full transition-all ${cfg.bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#8A8A8A]">{pct}% of total</p>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Summary bar */}
      {counts && total > 0 && (
        <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
          <CardContent className="pt-4">
            <div className="flex h-4 w-full overflow-hidden rounded-full">
              {Object.entries(counts).map(([state, count]) => {
                const cfg = STATE_CONFIG[state];
                const pct = (count / total) * 100;
                return pct > 0 ? (
                  <div
                    key={state}
                    className={`${cfg.bg} opacity-80`}
                    style={{ width: `${pct}%` }}
                    title={`${state}: ${count}`}
                  />
                ) : null;
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(STATE_CONFIG).map(([state, cfg]) => (
                <span key={state} className={`flex items-center gap-1 text-xs ${cfg.color}`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${cfg.bg}`} />
                  {state}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
