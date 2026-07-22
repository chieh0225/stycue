'use client';

import Image from 'next/image';
import { useState } from 'react';

// Same per-image loading-state pattern as comments/comment-board.tsx's
// ImageCell, but the placeholder reuses the homepage's shimmer skeleton
// styling (shimmer-base/animate-shimmer) instead of ImageCell's flat-color +
// icon treatment, so the transition from skeleton screen to real images
// feels continuous.
export function HomepageImage({
  src,
  alt,
  className,
  sizes = '50vw',
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {/* Stays mounted and cross-fades with the <img> below (same duration)
          instead of being removed the instant status flips — an instant
          unmount left a gap where the wrapper's transparent background
          showed through mid-fade, reading as a flicker. animate-shimmer is
          dropped as soon as loading ends so the sweep freezes in place
          rather than continuing to move underneath the fade-out — a moving
          highlight fading out read as a flash. */}
      <div
        className={`absolute inset-0 transition-opacity duration-400 ease-linear ${status === 'loaded' ? 'opacity-0' : 'opacity-100'} ${status === 'error' ? 'bg-secondary' : `shimmer-base ${status === 'loading' ? 'animate-shimmer' : ''}`}`}
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        decoding="sync"
        onLoad={(e) => {
          // The load event only means the bytes arrived — decoding the
          // bitmap can still lag behind on a slow connection or weak
          // device, so revealing on load alone can flash a partially
          // decoded/blocky frame. decode() resolves only once it's fully
          // decoded and safe to paint at full quality.
          const img = e.currentTarget;
          img
            .decode()
            .then(() => setStatus('loaded'))
            .catch(() => setStatus('loaded'));
        }}
        onError={() => setStatus('error')}
        className={`h-full w-full object-cover transition-opacity duration-400 ease-linear ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
