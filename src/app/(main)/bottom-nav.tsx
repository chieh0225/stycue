'use client';

import { Bell, Home, Plus, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/',
    label: '首頁',
    special: false,
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/search',
    label: '搜尋',
    special: false,
    icon: <Search className="h-5 w-5" />,
  },
  {
    href: '/posts/new',
    label: '發表',
    icon: <Plus className="h-6 w-6" />,
    special: true,
  },
  {
    href: '/notifications',
    label: '通知',
    special: false,
    icon: <Bell className="h-5 w-5" />,
  },
  {
    href: '/profile',
    label: '個人',
    special: false,
    icon: <User className="h-5 w-5" />,
  },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The post detail page (/posts/{id}), its comment board
// (/posts/{id}/comments), the new-comment screen (/posts/{id}/comments/new),
// and the new-post preview page each have their own fixed bottom bar, so the
// global nav is hidden there to avoid stacking two bars.
function hidesBottomNav(pathname: string) {
  if (pathname === '/posts/new/preview') return true;
  return /^\/posts\/[^/]+(?:\/comments(?:\/new)?)?$/.test(pathname) && pathname !== '/posts/new';
}

export default function BottomNav() {
  const pathname = usePathname();

  if (hidesBottomNav(pathname)) return null;

  return (
    <nav className="sticky bottom-0 z-10 flex items-end border-t border-border-default bg-surface-base px-2 pt-2 pb-3 shadow-nav-top">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);

        if (item.special) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="mx-1 flex flex-1 justify-center"
              aria-label={item.label}
            >
              <div className="flex h-14 w-14 -translate-y-2 items-center justify-center rounded-full border-[3px] border-surface-base bg-brand-primary text-text-primary shadow-cta-strong">
                {item.icon}
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold ${
              active ? 'text-text-primary' : 'text-text-muted'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
