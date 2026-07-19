'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

// Same wheel-to-horizontal-scroll treatment as photo-gallery.tsx /
// image-gallery.tsx: the scrollbar is hidden (no-scrollbar), so desktop
// mouse users have no drag handle — redirect vertical wheel input to
// horizontal scroll via a non-passive native listener (React's onWheel is
// passive, so preventDefault() there can't stop the page from also
// scrolling).
function useWheelToHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return ref;
}

// Mirrors the trending Card in (main)/page.tsx: cover image, avatar row,
// name + like-count line.
function TrendingSkeleton() {
  const items = ['t-1', 't-2', 't-3'];
  const ref = useWheelToHorizontalScroll();

  return (
    <div ref={ref} className="-mx-1 no-scrollbar flex gap-3 overflow-x-auto pb-2">
      {items.map((key) => (
        <Card key={key} variant="trending" className="w-43 flex-none">
          <div className="shimmer-base h-54 w-full animate-shimmer" />
          <div className="flex items-center gap-2 px-3 py-3">
            <div className="shimmer-base h-8 w-8 animate-shimmer rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="shimmer-base h-3.5 w-16 animate-shimmer rounded-full" />
              <div className="shimmer-secondary h-3 w-10 animate-shimmer rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default TrendingSkeleton;
