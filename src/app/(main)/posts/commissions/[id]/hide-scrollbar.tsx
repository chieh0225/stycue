'use client';

import { useEffect } from 'react';

// These post pages scroll the document (header and comment bar are sticky). We
// keep that scroll working but hide the browser's native scrollbar so it does
// not show as an outer bar / reserved gutter. globals.css defines the
// `.hide-native-scrollbar` rule; we toggle it on <html> only while mounted so
// the feed pages keep their normal scrollbar.
export default function HideScrollbar() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('hide-native-scrollbar');
    // A soft navigation into this page can inherit the previous page's scroll
    // position; reset after the router's own scroll handling (next frame) so we
    // reliably start at the top with the header/first item in view.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('hide-native-scrollbar');
    };
  }, []);

  return null;
}
