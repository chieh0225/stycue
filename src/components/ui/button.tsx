import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Based on shadcn's official Base UI Button (base-vega style), edited directly
// with StyCue's brand variants/sizes — see docs/design-component-inventory.md A4.
// Structural bits (data-slot, focus ring, active press, aria-invalid, icon
// auto-sizing) are kept from the official source; colors/radius/sizes are ours.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-cta hover:bg-primary/90',
        secondary: 'border-border bg-transparent text-foreground hover:bg-accent',
        goldDark: 'bg-gold-dark text-white shadow-gold-dark hover:bg-gold-dark/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        ghost: 'text-foreground hover:bg-accent',
      },
      size: {
        sm: 'h-9 px-4 text-label-md',
        md: 'h-11 px-4 text-label-md',
        lg: 'h-13 px-5 text-label-md',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
