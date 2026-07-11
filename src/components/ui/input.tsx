import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Based on shadcn's official Base UI Input (base-vega style), edited directly
// with StyCue's brand border/radius/size — see docs/design-component-inventory.md
// A6. Only covers the bare bordered field (e.g. add-comment-form's 品牌名稱
// input); icon-prefixed fields (login/register) and pill-wrapped fields
// (comment composer) are a different composite not built here yet — see the
// Phase 3B note in docs/design-token-apply-log.md.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-9.5 w-full min-w-0 rounded-lg border border-input bg-card px-2.5 py-1 text-body-md text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-text-placeholder focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
