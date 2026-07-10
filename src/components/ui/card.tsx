import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

// StyCue-specific — not from a shadcn registry (the official Card ships
// header/footer/title sub-parts none of our usages need; ours is a single
// surface with a variant per context). See docs/design-component-inventory.md A2.
const cardVariants = cva('overflow-hidden', {
  variants: {
    variant: {
      post: 'rounded-card border border-border bg-card shadow-card',
      trending: 'rounded-card bg-card shadow-card',
      info: 'rounded-panel border border-border bg-muted',
      outline: 'rounded-xl border border-border',
    },
  },
  defaultVariants: {
    variant: 'post',
  },
});

function Card({
  className,
  variant = 'post',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ variant, className }))} {...props} />;
}

export { Card, cardVariants };
