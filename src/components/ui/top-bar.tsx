import * as React from 'react';
import { cn } from '@/lib/utils';

// StyCue-specific — no shadcn equivalent. Collapses the 5 hand-copied sticky
// headers (border/padding/shadow/z drift) into one component. See
// docs/design-component-inventory.md A1 for the standard spec this converges
// to and the per-page drift it replaces.
//
// `center` (default true) absolutely centers the title regardless of `left`/
// `right` width — this is how 4 of the 5 original headers behaved. Set
// `center={false}` to keep the title flowing inline right after `left`
// instead (posts/[id] detail header's original layout).
type TopBarProps = {
  left?: React.ReactNode;
  title: React.ReactNode;
  right?: React.ReactNode;
  center?: boolean;
  sticky?: boolean;
  className?: string;
};

function TopBar({ left, title, right, center = true, sticky = true, className }: TopBarProps) {
  return (
    <header
      data-slot="top-bar"
      className={cn(
        'relative z-10 flex flex-shrink-0 items-center gap-3.5 border-b border-border-subtle bg-secondary px-4 py-3 shadow-card',
        sticky && 'sticky top-0',
        !left && !right && 'justify-center',
        className,
      )}
    >
      {left}
      <h1
        className={cn(
          'text-title leading-6 font-bold text-foreground',
          center && (left || right) && 'absolute left-1/2 -translate-x-1/2',
        )}
      >
        {title}
      </h1>
      {right ? <span className="ml-auto">{right}</span> : null}
    </header>
  );
}

export { TopBar };
