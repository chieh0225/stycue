'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '首頁' },
  { href: '/search', label: '搜尋' },
  { href: '/posts/new', label: '發表' },
  { href: '/notifications', label: '通知' },
  { href: '/profile', label: '個人' },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              active ? 'text-black dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-600'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
