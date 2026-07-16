'use client';

import { Image } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ImageResponse } from '@/types/image';

// The scrollbar is hidden (no-scrollbar), so desktop mouse users have no drag
// handle to scroll horizontally — a plain vertical wheel does nothing here.
// Redirect vertical wheel input to horizontal scroll so the gallery stays
// reachable without a visible track. React's onWheel is registered as a
// passive listener, so preventDefault() there can't stop the page from also
// scrolling — we attach a native, non-passive listener instead.
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

export default function PhotoGallery({ photos }: { photos: ImageResponse[] }) {
  const ref = useWheelToHorizontalScroll();

  return (
    <div ref={ref} className="mb-5.5 no-scrollbar flex gap-2 overflow-x-auto">
      {photos.length > 0
        ? photos.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend
            <img
              key={photo.imageId}
              src={photo.url}
              alt={`身形照片 ${i + 1}`}
              className="w-45 shrink-0 overflow-hidden rounded-xl object-cover"
              style={{ aspectRatio: '1 / 1.2' }}
            />
          ))
        : [0, 1, 2].map((i) => (
            <div
              key={i}
              role="img"
              aria-label={`身形照片 ${i + 1}`}
              className="flex w-45 shrink-0 items-center justify-center rounded-xl bg-[#D9D2C0] text-text-primary"
              style={{ aspectRatio: '1 / 1.2' }}
            >
              <Image className="h-9 w-9" />
            </div>
          ))}
    </div>
  );
}
