'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ENV } from '@/lib/constants';

const schema = z.object({ email: z.string().email('Please enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${ENV.API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
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
        </div>

        <div className="rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] p-8 shadow-2xl">
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-xl font-semibold text-[#F5F5F5]">Check your email</h2>
              <p className="mt-2 text-sm text-[#8A8A8A]">
                We&apos;ve sent a password reset link to your email address. It may take a few
                minutes to arrive.
              </p>
              <Link href="/login">
                <Button variant="ghost" className="mt-6">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-[#F5F5F5]">Reset your password</h2>
              <p className="mt-2 mb-6 text-sm text-[#8A8A8A]">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>

              <Link href="/login">
                <Button variant="ghost" className="mt-4 w-full text-[#8A8A8A]">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
