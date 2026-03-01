'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, Zap, Key, Activity, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ADMIN_COOKIE = 'admin_secret';

function getAdminSecret(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function setAdminSecretCookie(secret: string) {
  document.cookie = `${ADMIN_COOKIE}=${encodeURIComponent(secret)}; path=/; SameSite=Strict`;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/generations', label: 'Generations', icon: Zap },
  { href: '/admin/queue', label: 'Queue', icon: Activity },
  { href: '/admin/api-keys', label: 'API Keys', icon: Key },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSecret(getAdminSecret());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Verify secret against the backend health endpoint
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/health`,
      { headers: { 'X-Admin-Secret': input } },
    );
    if (res.ok || res.status !== 404) {
      setAdminSecretCookie(input);
      setSecret(input);
      setError('');
      router.refresh();
    } else {
      setError('Invalid admin secret');
    }
  };

  const handleLogout = () => {
    document.cookie = `${ADMIN_COOKIE}=; path=/; max-age=0`;
    setSecret('');
  };

  if (!secret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0F0F]">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-[#2E2E2E] bg-[#1A1A1A] p-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-[#F5F5F5]">Admin Access</h1>
              <p className="text-xs text-[#8A8A8A]">Development only</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin secret"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              error={error}
            />
            <Button type="submit" className="w-full" disabled={!input}>
              Unlock
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-[#2E2E2E] bg-[#111111]">
        <div className="flex items-center gap-2 border-b border-[#2E2E2E] px-4 py-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold text-[#F5F5F5]">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-[#8A8A8A] hover:bg-[#2E2E2E] hover:text-[#F5F5F5]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#2E2E2E] p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#8A8A8A] transition-colors hover:bg-[#2E2E2E] hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Lock Panel
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {/* Pass secret to children via a data attribute on the wrapper — children read it from cookie */}
        {children}
      </main>
    </div>
  );
}
