'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#2E2E2E] bg-[#0F0F0F] px-6">
      <div className="flex items-center gap-4">
        {/* Breadcrumb or page title slot */}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-[#8A8A8A]" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#F5F5F5]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  {session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-sm hidden sm:block">
                  {session.user.name ?? session.user.email?.split('@')[0]}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-[#2E2E2E] bg-[#1A1A1A] text-[#F5F5F5]"
            >
              <DropdownMenuLabel>
                <p className="font-medium">{session.user.name ?? 'User'}</p>
                <p className="text-xs text-[#8A8A8A]">{session.user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2E2E2E]" />
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer hover:bg-[#242424]">
                  <User className="mr-2 h-4 w-4" />
                  Profile & Settings
                </DropdownMenuItem>
              </Link>
              <Link href="/billing">
                <DropdownMenuItem className="cursor-pointer hover:bg-[#242424]">
                  Billing
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#2E2E2E]" />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:bg-[#242424] hover:text-red-400"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
