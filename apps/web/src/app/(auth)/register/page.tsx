'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Github, Mail, Lock, User, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema } from '@forgeitup/shared';
import { ENV } from '@/lib/constants';

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${ENV.API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error ?? 'Registration failed');
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success('Account created! Please sign in.');
        router.push('/login');
      } else {
        toast.success('Welcome to ForgeItUp!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      toast.error('OAuth sign-in failed');
      setOauthLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F0F] px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-bold text-[#F5F5F5]">ForgeItUp</span>
          </Link>
          <p className="mt-2 text-sm text-[#8A8A8A]">Create your free account</p>
        </div>

        <div className="rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] p-8 shadow-2xl">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#2E2E2E]" />
            <span className="text-xs text-[#8A8A8A]">or</span>
            <div className="h-px flex-1 bg-[#2E2E2E]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">
                Display Name <span className="text-[#8A8A8A]">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
                <Input
                  type="text"
                  placeholder="Steve"
                  className="pl-10"
                  error={errors.displayName?.message}
                  {...register('displayName')}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  className="pl-10"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Free Account
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-[#8A8A8A]">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>

          <p className="mt-4 text-center text-sm text-[#8A8A8A]">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
