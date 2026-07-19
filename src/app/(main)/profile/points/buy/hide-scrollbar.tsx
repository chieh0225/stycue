'use client';

import { useEffect } from 'react';

// This page scrolls the document (header and CTA bar are sticky). We keep
// that scroll working but hide the browser's native scrollbar so it does not
// show as an outer bar / reserved gutter. globals.css defines the
// `.hide-native-scrollbar` rule; we toggle it on <html> only while mounted so
// the feed pages keep their normal scrollbar.
export default function HideScrollbar() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('hide-native-scrollbar');
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('hide-native-scrollbar');
    };
  }, []);

  return null;
}
