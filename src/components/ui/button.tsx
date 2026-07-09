import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

// shadcn-style Button whose variants are composed entirely from StyCue design
// tokens (see docs/design-component-inventory.md A4). No `asChild`/Radix Slot:
// CTAs that render as <Link> use `className={cn(buttonVariants({ ... }))}` — the
// documented shadcn pattern — so the primitive stays dependency-free.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-cta hover:bg-primary/90',
        secondary: 'border border-border bg-transparent text-foreground hover:bg-accent',
        goldDark: 'bg-gold-dark text-white shadow-gold-dark hover:bg-gold-dark/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        ghost: 'text-foreground hover:bg-accent',
      },
      size: {
        sm: 'h-9 px-4 text-meta',
        md: 'h-11 px-4 text-body',
        lg: 'h-13 px-5 text-title',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
export type { ButtonProps };
