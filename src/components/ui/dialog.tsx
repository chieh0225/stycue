'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Based on shadcn's official Base UI Dialog (base-vega style), edited directly
// with StyCue's brand look — see docs/design-component-inventory.md A5.
// Deviations from the registry source, all deliberate:
//  - Official close button imports `IconPlaceholder` (a lucide/tabler/… abstraction
//    layer that doesn't exist here); replaced with `lucide-react`'s `X`, now the
//    project's standard icon source (see design-decisions.md).
//  - Overlay `bg-black/10` → `bg-scrim-modal` (brand scrim token); content
//    `ring-1 ring-foreground/10` → `shadow-modal`; width fixed to `max-w-75`
//    (300px, the reconciled modal width, A5); official `grid gap-6 p-6` internal
//    spacing dropped so each modal keeps its own centred layout via className.
//  - `data-open:animate-in`/`zoom-in-95` etc. are kept verbatim from the registry
//    but are inert without tw-animate-css (not installed); modals appear/vanish
//    without a transition, same as the hand-rolled versions they replace.

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-y-0 left-1/2 isolate z-50 w-full max-w-md -translate-x-1/2 bg-scrim-modal duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = false,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-full max-w-75 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-popover text-sm text-popover-foreground shadow-modal duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" size="icon" className="absolute top-4 right-4" />}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">關閉</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

// Equal-width horizontal button row — StyCue's modal footer convention, replacing
// the official DialogFooter's phone-`flex-col-reverse`/desktop-`sm:justify-end`
// layout. Buttons inside pass their own `flex-1`. This is the one genuinely
// repeated modal sub-structure (3 modals); the buttons themselves differ in
// variant/label so they stay raw <Button> at each call site (not wrapped).
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex w-full items-center gap-2.5', className)}
      {...props}
    />
  );
}

// Base intentionally carries no font-size: each modal's title size differs
// (16 / 14.5 / 20px) and twMerge can't dedupe the project's custom text-* token
// utilities against a baked-in one, so the size is passed per call site.
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-bold text-foreground', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-meta leading-[1.6] text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
