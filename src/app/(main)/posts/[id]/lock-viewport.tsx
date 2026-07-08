'use client';

import { useEffect } from 'react';

// These post pages are full-viewport app shells (fixed inset-0) that scroll
// internally, so the document itself must not scroll. globals.css forces
// `html { overflow-y: scroll }` to avoid layout shift on the feed pages; here
// we override it to hidden while mounted so the browser's outer scrollbar is
// gone and the only scrollbar is the in-shell comment list.
export default function LockViewport() {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflowY;
    html.style.overflowY = 'hidden';
    return () => {
      html.style.overflowY = previous;
    };
  }, []);

  return null;
}
