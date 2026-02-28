'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  Hammer,
  History,
  Settings,
  CreditCard,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Builder', href: '/builder', icon: Hammer, badge: 'New' },
  { label: 'Generations', href: '/generations', icon: History },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Docs', href: '/docs', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#2E2E2E] bg-[#0F0F0F]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-[#2E2E2E] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <span className="text-lg font-bold text-[#F5F5F5]">ForgeItUp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-[#8A8A8A] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]',
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-[#8A8A8A] group-hover:text-[#F5F5F5]',
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="h-3 w-3 text-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2E2E2E] p-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-3">
          <p className="text-xs font-medium text-[#F5F5F5]">Free Plan</p>
          <p className="text-xs text-[#8A8A8A]">1/1 generations used</p>
          <Link
            href="/billing"
            className="mt-2 block text-xs font-medium text-primary hover:underline"
          >
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    </aside>
  );
}
