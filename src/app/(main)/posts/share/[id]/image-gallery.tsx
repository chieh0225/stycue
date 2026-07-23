'use client';

import Image from 'next/image';
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

  // Unlike commission posts (which always require body-shape photos, so
  // placeholder slots make sense), share posts can be published with zero
  // images — render nothing rather than 3 empty placeholder blocks.
  if (photos.length === 0) return null;

  return (
    <div ref={ref} className="mb-4.5 no-scrollbar flex gap-2.5 overflow-x-auto">
      {photos.map((photo, i) => (
        <Image
          key={photo.imageId}
          src={photo.url}
          alt={`圖片 ${i + 1}`}
          width={254}
          height={267}
          sizes="254px"
          className="w-63.5 shrink-0 overflow-hidden rounded-panel object-cover"
          style={{ aspectRatio: '1 / 1.05' }}
        />
      ))}
    </div>
  );
}
