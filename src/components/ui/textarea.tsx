import * as React from 'react';
import { cn } from '@/lib/utils';

// Based on shadcn's official Base UI Textarea (base-vega style), edited
// directly with StyCue's brand border/radius/size — see
// docs/design-component-inventory.md A6. Same scope note as ui/input.tsx:
// only the bare bordered field, not the auto-growing title/description
// textareas in posts/new/preview (those size themselves via a ref effect and
// intentionally have no border/background, so they stay bespoke).
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-30 w-full resize-none rounded-lg border border-input bg-card p-3.5 text-sm leading-[1.7] text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-text-placeholder focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
