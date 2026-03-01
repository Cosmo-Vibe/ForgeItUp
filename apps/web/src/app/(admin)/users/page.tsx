'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminFetch } from '@/lib/admin-api';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  subscription_tier: string;
  subscription_status: string;
  generations_this_month: number;
  login_attempts: number;
  login_locked_until: string | null;
  created_at: string;
}

const TIER_COLORS: Record<string, string> = {
  free: 'default',
  starter: 'secondary',
  pro: 'success',
  team: 'destructive',
};

const MONTH_LIMITS: Record<string, number | string> = {
  free: 1,
  starter: 20,
  pro: 100,
  team: '∞',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editTier, setEditTier] = useState('');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/users?page=${page}`);
    const json = await res.json();
    setUsers(json.data?.data ?? []);
    setTotal(json.data?.total ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true);
    const res = await adminFetch(`/users/${editUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ subscriptionTier: editTier }),
    });
    if (res.ok) {
      toast.success('User updated');
      setEditUser(null);
      load();
    } else {
      toast.error('Failed to update user');
    }
    setSaving(false);
  };

  const handleResetCount = async (userId: string) => {
    const res = await adminFetch(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ generationsThisMonth: 0 }),
    });
    if (res.ok) { toast.success('Generation count reset'); load(); }
    else toast.error('Failed to reset count');
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    const res = await adminFetch(`/users/${deleteUser.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('User deleted');
      setDeleteUser(null);
      load();
    } else {
      toast.error('Failed to delete user');
    }
    setSaving(false);
  };

  const pages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Users</h1>
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
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Generations</th>
                  <th className="px-4 py-3">Locked</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#2E2E2E] hover:bg-[#2E2E2E]/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[#F5F5F5]">{u.email}</p>
                        <p className="text-xs text-[#8A8A8A]">{u.id.slice(0, 8)}…</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={TIER_COLORS[u.subscription_tier] as 'default'}>
                        {u.subscription_tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#F5F5F5]">
                      {u.generations_this_month} / {MONTH_LIMITS[u.subscription_tier]}
                    </td>
                    <td className="px-4 py-3">
                      {u.login_locked_until && new Date(u.login_locked_until) > new Date() ? (
                        <Badge variant="destructive">Locked</Badge>
                      ) : u.login_attempts > 0 ? (
                        <span className="text-yellow-400">{u.login_attempts} attempts</span>
                      ) : (
                        <span className="text-[#8A8A8A]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#8A8A8A]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-[#2E2E2E] px-2 text-xs"
                          onClick={() => { setEditUser(u); setEditTier(u.subscription_tier); }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-[#2E2E2E] px-2 text-xs text-[#8A8A8A]"
                          onClick={() => handleResetCount(u.id)}
                          title="Reset generation count"
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-red-500/30 px-2 text-xs text-red-400"
                          onClick={() => setDeleteUser(u)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="border-[#2E2E2E] bg-[#1A1A1A]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#8A8A8A]">{editUser?.email}</p>
            <div>
              <label className="mb-1 block text-sm text-[#F5F5F5]">Subscription Tier</label>
              <select
                value={editTier}
                onChange={(e) => setEditTier(e.target.value)}
                className="w-full rounded-lg border border-[#2E2E2E] bg-[#0F0F0F] px-3 py-2 text-sm text-[#F5F5F5]"
              >
                {['free', 'starter', 'pro', 'team'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="border-[#2E2E2E] bg-[#1A1A1A]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#8A8A8A]">
            Permanently delete <strong className="text-[#F5F5F5]">{deleteUser?.email}</strong>?
            This will cascade-delete all their generations, subscriptions, and API keys.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
