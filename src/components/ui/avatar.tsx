'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Based on shadcn's official Base UI Avatar (base-vega style), edited directly
// with StyCue's brand sizes/colors — see docs/design-component-inventory.md A8.
// AvatarBadge/AvatarGroup dropped: nothing in the app uses those yet.
function Avatar({
  className,
  size = 'lg',
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'relative flex shrink-0 rounded-full select-none data-[size=lg]:size-9 data-[size=md]:size-8.5 data-[size=sm]:size-7.5 data-[size=xl]:size-9.5',
        className,
      )}
      {...props}
    />
  );
}

// AvatarPrimitive.Root tracks image-loading status itself: this always
// mounts, but only becomes visible once the src actually loads, and
// AvatarFallback shows automatically the rest of the time (no src, loading,
// or errored) — no manual conditional rendering needed at call sites.
function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('size-full rounded-full object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-foreground text-label-md text-background',
        className,
      )}
      {...props}
    />
  );
}

// Dynamic bg-* color standing in for a real photo not yet uploaded — distinct
// from Avatar/AvatarFallback's fixed brand color, which represents an actual
// icon/initials identity.
type PlaceholderAvatarProps = React.ComponentProps<typeof Avatar> & {
  accent: string;
  bordered?: boolean;
};

function PlaceholderAvatar({ accent, bordered, className, ...props }: PlaceholderAvatarProps) {
  return (
    <Avatar className={cn(bordered && 'border-2 border-border', accent, className)} {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback, PlaceholderAvatar };
