'use client';

import { Image } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ImageResponse } from '@/types/image';

// Same horizontal-scroll-via-wheel treatment as
// posts/commissions/[id]/photo-gallery.tsx, but sized to this design's own
// 254px / 1:1.05 cards (not the 身形照片 gallery's 180px / 1:1.2) — kept as
// its own small component rather than reusing PhotoGallery, see plan notes.
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

export default function ImageGallery({ photos }: { photos: ImageResponse[] }) {
  const ref = useWheelToHorizontalScroll();

  return (
    <div ref={ref} className="mb-4.5 no-scrollbar flex gap-2.5 overflow-x-auto">
      {photos.length > 0
        ? photos.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend
            <img
              key={photo.imageId}
              src={photo.url}
              alt={`圖片 ${i + 1}`}
              className="w-63.5 shrink-0 overflow-hidden rounded-panel object-cover"
              style={{ aspectRatio: '1 / 1.05' }}
            />
          ))
        : [0, 1, 2].map((i) => (
            <div
              key={i}
              role="img"
              aria-label={`圖片 ${i + 1}`}
              className="flex w-63.5 shrink-0 items-center justify-center rounded-panel bg-[#d9d2c0] text-text-primary"
              style={{ aspectRatio: '1 / 1.05' }}
            >
              <Image className="h-10 w-10" />
            </div>
          ))}
    </div>
  );
}
