import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Circular avatar container (see docs/design-component-inventory.md A8). Content
// is passed as children — an icon (UserIcon, sized by the caller) or initials
// text — since icon components are still defined per-file, not consolidated here.
const avatarVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full bg-foreground text-sm text-background',
  {
    variants: {
      size: {
        sm: 'h-7.5 w-7.5',
        md: 'h-8.5 w-8.5',
        lg: 'h-9 w-9',
        xl: 'h-9.5 w-9.5',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  },
);

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof avatarVariants>;

function Avatar({ className, size, ...props }: AvatarProps) {
  return <div className={cn(avatarVariants({ size, className }))} {...props} />;
}

export { Avatar, avatarVariants };
export type { AvatarProps };
