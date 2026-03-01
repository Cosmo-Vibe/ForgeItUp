'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminFetch } from '@/lib/admin-api';

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  requests_count: number;
  last_used_at: string | null;
  created_at: string;
  users: { email: string };
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/api-keys?page=${page}`);
    const json = await res.json();
    setKeys(json.data?.data ?? []);
    setTotal(json.data?.total ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async () => {
    if (!revokeKey) return;
    setRevoking(true);
    const res = await adminFetch(`/api-keys/${revokeKey.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('API key revoked');
      setRevokeKey(null);
      load();
    } else {
      toast.error('Failed to revoke key');
    }
    setRevoking(false);
  };

  const pages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">API Keys</h1>
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
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Prefix</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requests</th>
                  <th className="px-4 py-3">Last Used</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-[#2E2E2E] hover:bg-[#2E2E2E]/30">
                    <td className="px-4 py-3 text-[#F5F5F5]">{k.users?.email ?? k.user_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-[#F5F5F5]">{k.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#8A8A8A]">{k.key_prefix}…</td>
                    <td className="px-4 py-3">
                      <Badge variant={k.is_active ? 'success' : 'destructive'}>
                        {k.is_active ? 'Active' : 'Revoked'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#F5F5F5]">{k.requests_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#8A8A8A]">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#8A8A8A]">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {k.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-red-500/30 px-2 text-xs text-red-400"
                          onClick={() => setRevokeKey(k)}
                        >
                          <Ban className="h-3 w-3" />
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
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

      {/* Revoke Confirm */}
      <Dialog open={!!revokeKey} onOpenChange={() => setRevokeKey(null)}>
        <DialogContent className="border-[#2E2E2E] bg-[#1A1A1A]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Revoke API Key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#8A8A8A]">
            Revoke key <strong className="font-mono text-[#F5F5F5]">{revokeKey?.key_prefix}…</strong>{' '}
            for <strong className="text-[#F5F5F5]">{revokeKey?.users?.email}</strong>?
            Any requests using this key will immediately fail.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRevokeKey(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRevoke}
              disabled={revoking}
            >
              Revoke
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
