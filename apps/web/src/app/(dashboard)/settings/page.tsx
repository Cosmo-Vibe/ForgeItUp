'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, LogOut, User, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ENV } from '@/lib/constants';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(64),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: session?.user?.name ?? '',
    },
  });

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

      if (response.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

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
              <Input
                value={session?.user?.email ?? ''}
                disabled
                className="text-[#8A8A8A]"
              />
              <p className="mt-1 text-xs text-[#8A8A8A]">Email cannot be changed</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">
                Display Name
              </label>
              <Input
                placeholder="Your display name"
                error={errors.displayName?.message}
                {...register('displayName')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F5F5F5]">Subscription</p>
                <Badge variant="success" className="mt-1">
                  {session?.user?.subscriptionTier ?? 'free'} plan
                </Badge>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
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
    </div>
  );
}
