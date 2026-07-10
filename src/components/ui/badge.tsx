import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Based on shadcn's official Base UI Badge (base-vega style), edited directly
// with StyCue's brand variants — see docs/design-component-inventory.md A3.
// Static label/tag chip — dropdown/select triggers that look like a chip stay
// as <button> until a Select primitive exists.
const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-1 text-caption font-bold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        gold: 'bg-gold-soft text-gold-deep',
        blue: 'bg-tag-blue-bg text-tag-blue',
        green: 'bg-tag-green-bg text-tag-green',
        neutral: 'border-border bg-muted font-normal text-foreground',
      },
    },
    defaultVariants: {
      variant: 'gold',
    },
  },
);

function Badge({
  className,
  variant = 'gold',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };
