'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '首頁' },
  { href: '/search', label: '搜尋' },
  { href: '/notifications', label: '通知' },
  { href: '/profile', label: '個人' },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();
  const [first, second, ...rest] = navItems;

  return (
    <nav className="sticky bottom-0 z-10 flex items-center border-t border-border-default bg-surface-base">
      {[first, second].map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              active ? 'text-text-primary' : 'text-text-muted'
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <div className="flex flex-1 justify-center">
        <Link
          href="/posts/new"
          aria-label="發表"
          className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-2xl leading-none text-text-primary shadow-md"
        >
          +
        </Link>
      </div>

      {rest.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              active ? 'text-text-primary' : 'text-text-muted'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
