'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/',
    label: '首頁',
    special: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M3 11 12 4l9 7" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: '搜尋',
    special: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    href: '/posts/new',
    label: '發表',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="h-6 w-6"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
    special: true,
  },
  {
    href: '/notifications',
    label: '通知',
    special: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: '個人',
    special: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    ),
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
    <nav className="sticky bottom-0 z-10 flex items-end border-t border-border-default bg-surface-base px-2 pt-2 pb-3 shadow-[0_-4px_12px_rgba(217,154,61,0.08)]">
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
              <div className="flex h-14 w-14 -translate-y-2 items-center justify-center rounded-full border-[3px] border-surface-base bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.18)]">
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
