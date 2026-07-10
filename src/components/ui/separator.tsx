'use client';

import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import { cn } from '@/lib/utils';

// Based on shadcn's official Base UI Separator (base-vega style) — no brand
// edits needed, it already matches the app's hairline rule (see
// docs/design-component-inventory.md A8). `data-horizontal:`/`data-vertical:`
// come from the `@custom-variant` declarations in shadcn/tailwind.css
// (imported in globals.css) mapped to Base UI's `data-orientation` attribute.
function Separator({ className, orientation = 'horizontal', ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
