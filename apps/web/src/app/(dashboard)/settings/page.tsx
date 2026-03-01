'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save, LogOut, User, Loader2, Trash2, AlertTriangle,
  Key, Plus, Ban, Copy, Check, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ENV } from '@/lib/constants';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(64),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  requests_count: number;
  last_used_at: string | null;
  created_at: string;
}

const API_KEY_LIMITS: Record<string, number> = {
  free: 0, starter: 1, pro: 3, team: 10,
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const tier = (session?.user as { subscriptionTier?: string })?.subscriptionTier ?? 'free';

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [rawKeyCopied, setRawKeyCopied] = useState(false);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: session?.user?.name ?? '' },
  });

  const loadApiKeys = useCallback(async () => {
    if (!session?.accessToken) return;
    setKeysLoading(true);
    try {
      const res = await fetch(`${ENV.API_URL}/api/v1/api-keys`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setApiKeys(json.data ?? []);
      }
    } finally {
      setKeysLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => { loadApiKeys(); }, [loadApiKeys]);

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${ENV.API_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ displayName: data.displayName }),
      });
      if (response.ok) toast.success('Profile updated successfully');
      else toast.error('Failed to update profile');
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await fetch(`${ENV.API_URL}/api/v1/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ name: keyName.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setNewRawKey(json.data.rawKey);
        setKeyName('');
        setCreateOpen(false);
        loadApiKeys();
      } else {
        toast.error(json.error ?? 'Failed to create API key');
      }
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevoke = async (key: ApiKey) => {
    const res = await fetch(`${ENV.API_URL}/api/v1/api-keys/${key.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    });
    if (res.ok) {
      toast.success('API key revoked');
      setRevokeKey(null);
      loadApiKeys();
    } else {
      toast.error('Failed to revoke key');
    }
  };

  const copyKey = async () => {
    if (!newRawKey) return;
    await navigator.clipboard.writeText(newRawKey);
    setRawKeyCopied(true);
    setTimeout(() => setRawKeyCopied(false), 2000);
  };

  const keyLimit = API_KEY_LIMITS[tier] ?? 0;
  const activeKeyCount = apiKeys.filter((k) => k.is_active).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Settings</h1>
        <p className="text-sm text-[#8A8A8A]">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Update your public profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Email</label>
              <Input value={session?.user?.email ?? ''} disabled className="text-[#8A8A8A]" />
              <p className="mt-1 text-xs text-[#8A8A8A]">Email cannot be changed</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Display Name</label>
              <Input
                placeholder="Your display name"
                error={errors.displayName?.message}
                {...register('displayName')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F5F5F5]">Subscription</p>
                <Badge variant="success" className="mt-1">{tier} plan</Badge>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="border-[#2E2E2E] bg-[#1A1A1A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Keys
              </CardTitle>
              <CardDescription className="mt-1">
                Use API keys to access ForgeItUp programmatically
              </CardDescription>
            </div>
            {keyLimit > 0 && (
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                disabled={activeKeyCount >= keyLimit}
              >
                <Plus className="h-4 w-4" />
                New Key
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {keyLimit === 0 ? (
            <div className="rounded-lg border border-[#2E2E2E] p-4 text-center">
              <Key className="mx-auto mb-2 h-8 w-8 text-[#8A8A8A]" />
              <p className="text-sm font-medium text-[#F5F5F5]">API access requires a paid plan</p>
              <p className="mt-1 text-xs text-[#8A8A8A]">
                Starter: 1 key · Pro: 3 keys · Team: 10 keys
              </p>
              <Button size="sm" className="mt-3" onClick={() => (window.location.href = '/billing')}>
                Upgrade Plan
              </Button>
            </div>
          ) : keysLoading ? (
            <p className="text-sm text-[#8A8A8A]">Loading...</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#8A8A8A]">
                {activeKeyCount} / {keyLimit} active key{keyLimit !== 1 ? 's' : ''}
              </p>
              {apiKeys.length === 0 ? (
                <p className="text-sm text-[#8A8A8A]">No API keys yet. Create one to get started.</p>
              ) : (
                <div className="divide-y divide-[#2E2E2E] rounded-lg border border-[#2E2E2E]">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#F5F5F5]">{k.name}</span>
                          <Badge variant={k.is_active ? 'success' : 'destructive'} className="text-xs">
                            {k.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </div>
                        <p className="mt-0.5 font-mono text-xs text-[#8A8A8A]">
                          {k.key_prefix}… · {k.requests_count} requests ·{' '}
                          {k.last_used_at
                            ? `last used ${new Date(k.last_used_at).toLocaleDateString()}`
                            : 'never used'}
                        </p>
                      </div>
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
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-lg border border-[#2E2E2E] bg-[#0F0F0F] p-3">
                <p className="text-xs text-[#8A8A8A]">
                  <strong className="text-[#F5F5F5]">Usage:</strong> Pass your key as the{' '}
                  <code className="rounded bg-[#2E2E2E] px-1">X-API-Key</code> header on any API request.
                  Rate limits and quotas from your subscription plan apply.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-[#1A1A1A]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions — proceed with caution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#2E2E2E] p-4">
            <div>
              <p className="text-sm font-medium text-[#F5F5F5]">Sign out</p>
              <p className="text-xs text-[#8A8A8A]">Sign out of all devices</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="border-[#2E2E2E] text-[#8A8A8A]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-red-500/20 p-4">
            <div>
              <p className="text-sm font-medium text-red-400">Delete Account</p>
              <p className="text-xs text-[#8A8A8A]">Permanently delete your account and all data</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => toast.error('Please contact support to delete your account')}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-[#2E2E2E] bg-[#1A1A1A]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#F5F5F5]">Key Name</label>
              <Input
                placeholder="e.g. My CI Pipeline"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                autoFocus
              />
              <p className="mt-1 text-xs text-[#8A8A8A]">
                A memorable label to identify this key.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateKey} disabled={creatingKey || !keyName.trim()}>
                {creatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show raw key once */}
      <Dialog open={!!newRawKey} onOpenChange={() => setNewRawKey(null)}>
        <DialogContent className="border-[#2E2E2E] bg-[#1A1A1A]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">Your New API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
              <p className="text-xs text-yellow-400">
                Copy this key now — it will never be shown again.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#2E2E2E] bg-[#0F0F0F] px-3 py-2">
              <code className="flex-1 break-all text-xs text-[#F5F5F5]">{newRawKey}</code>
              <button onClick={copyKey} className="shrink-0 text-[#8A8A8A] hover:text-[#F5F5F5]">
                {rawKeyCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <Button className="w-full" onClick={() => setNewRawKey(null)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm Dialog */}
      <Dialog open={!!revokeKey} onOpenChange={() => setRevokeKey(null)}>
        <DialogContent className="border-[#2E2E2E] bg-[#1A1A1A]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Revoke API Key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#8A8A8A]">
            Revoke <strong className="text-[#F5F5F5]">{revokeKey?.name}</strong>?
            Any applications using this key will stop working immediately.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRevokeKey(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => revokeKey && handleRevoke(revokeKey)}
            >
              Revoke
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
