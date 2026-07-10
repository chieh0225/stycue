import * as React from 'react';
import { cn } from '@/lib/utils';

// StyCue-specific — no shadcn equivalent. Shared shell for the fixed footers
// each post-detail/comment/preview screen builds on its own (composer,
// launcher, action bar). See docs/design-component-inventory.md A7.
//
// Only the structural bits (position, border, background) are baked in;
// layout (items-center, gap, padding) is left to each call site's className
// since the sites disagree on it (icon+pill row vs. two equal-width buttons).
type BottomBarProps = React.ComponentProps<'footer'> & {
  // preview page fixes the bar to the viewport instead of the scroll
  // container (its content scrolls under a `fixed` footer, not a `sticky`
  // one) — everywhere else `sticky` is correct.
  fixed?: boolean;
};

function BottomBar({ className, fixed = false, ...props }: BottomBarProps) {
  return (
    <footer
      data-slot="bottom-bar"
      className={cn(
        'z-10 flex flex-shrink-0 gap-3 border-t border-border bg-background px-4.5 py-3.5',
        fixed ? 'fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2' : 'sticky bottom-0',
        className,
      )}
      {...props}
    />
  );
}

export { BottomBar };
