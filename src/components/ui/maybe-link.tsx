import Link from 'next/link';
import type { ComponentProps } from 'react';
import { UNRELEASED_ROUTES } from '@/lib/unreleased-routes';

function isUnreleased(href: ComponentProps<typeof Link>['href']): boolean {
  const path = typeof href === 'string' ? href : href.pathname;
  return (UNRELEASED_ROUTES as readonly string[]).includes(path ?? '');
}

// Drop-in replacement for next/link's Link: identical markup/classes, but
// for routes with no real page yet this renders an inert <span> instead —
// same look, clicking does nothing. Delete the route from
// UNRELEASED_ROUTES the day its real page ships; no other change needed.
export function MaybeLink({ href, className, children, ...rest }: ComponentProps<typeof Link>) {
  if (isUnreleased(href)) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
