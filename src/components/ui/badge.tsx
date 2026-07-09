import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Static label/tag chip (see docs/design-component-inventory.md A3). Distinct
// from Button: never interactive on its own — dropdown/select triggers that
// happen to look like a chip stay as <button> until a Select primitive exists.
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold',
  {
    variants: {
      variant: {
        gold: 'bg-gold-soft text-gold-deep',
        blue: 'bg-tag-blue-bg text-tag-blue',
        green: 'bg-tag-green-bg text-tag-green',
        neutral: 'border border-border bg-muted font-normal text-foreground',
      },
    },
    defaultVariants: {
      variant: 'gold',
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
export type { BadgeProps };
