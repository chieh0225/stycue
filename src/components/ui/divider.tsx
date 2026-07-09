import * as React from 'react';
import { cn } from '@/lib/utils';

// Hairline horizontal rule (see docs/design-component-inventory.md A8). No
// variants — every occurrence in the app is the same 1px border-color line;
// spacing/width overrides go through className.
function Divider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('h-px w-full bg-border', className)}
      {...props}
    />
  );
}

export { Divider };
