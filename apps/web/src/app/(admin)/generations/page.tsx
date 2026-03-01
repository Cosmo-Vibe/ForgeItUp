'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-api';

interface Generation {
  id: string;
  user_id: string;
  status: string;
  platform: string;
  type: string;
  loader: string;
  mc_version: string;
  mode: string;
  prompt: string | null;
  config_json: Record<string, unknown> | null;
  output_files: Record<string, unknown> | null;
  error_message: string | null;
  ai_model_used: string | null;
  tokens_used: number | null;
  generation_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
  users: { email: string };
}

const STATUS_VARIANT: Record<string, string> = {
  done: 'success',
  processing: 'secondary',
  pending: 'default',
  failed: 'destructive',
};

export default function AdminGenerationsPage() {
  const [rows, setRows] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/generations?page=${page}`);
    const json = await res.json();
    setRows(json.data?.data ?? []);
    setTotal(json.data?.total ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Generations</h1>
          <p className="text-sm text-[#8A8A8A]">{total} total</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2E2E2E] text-left text-[#8A8A8A]">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Platform / Loader</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <>
                    <tr
                      key={g.id}
                      className="border-b border-[#2E2E2E] hover:bg-[#2E2E2E]/30"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#8A8A8A]">{g.id.slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-[#F5F5F5]">{g.users?.email ?? g.user_id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[g.status] as 'default'}>{g.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#F5F5F5]">
                        {g.platform} / {g.loader}
                      </td>
                      <td className="px-4 py-3 text-[#8A8A8A]">{g.mode}</td>
                      <td className="px-4 py-3 text-[#8A8A8A]">
                        {g.generation_time_ms ? `${(g.generation_time_ms / 1000).toFixed(1)}s` : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#8A8A8A]">
                        {new Date(g.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                          className="text-[#8A8A8A] hover:text-[#F5F5F5]"
                        >
                          {expanded === g.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                    {expanded === g.id && (
                      <tr key={`${g.id}-expanded`} className="bg-[#111111]">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            {g.prompt && (
                              <div>
                                <p className="mb-1 font-semibold text-[#8A8A8A]">Prompt</p>
                                <p className="text-[#F5F5F5]">{g.prompt}</p>
                              </div>
                            )}
                            {g.error_message && (
                              <div>
                                <p className="mb-1 font-semibold text-red-400">Error</p>
                                <p className="font-mono text-red-300">{g.error_message}</p>
                              </div>
                            )}
                            {g.ai_model_used && (
                              <div>
                                <p className="mb-1 font-semibold text-[#8A8A8A]">AI Model</p>
                                <p className="text-[#F5F5F5]">
                                  {g.ai_model_used} · {g.tokens_used?.toLocaleString() ?? '?'} tokens
                                </p>
                              </div>
                            )}
                            {g.output_files && (
                              <div>
                                <p className="mb-1 font-semibold text-[#8A8A8A]">Output Files</p>
                                <pre className="max-h-32 overflow-auto rounded bg-[#0F0F0F] p-2 text-[#F5F5F5]">
                                  {JSON.stringify(g.output_files, null, 2).slice(0, 500)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#2E2E2E] px-4 py-3">
              <span className="text-xs text-[#8A8A8A]">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
