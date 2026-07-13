'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This route only ever exists as an intercepted modal (see
// ../@modal/(.)tags/page.tsx) rendered on top of /posts/new. Landing here
// directly — a hard refresh while the modal was open, a bookmark, a shared
// link — means the interception didn't apply, so bounce back to /posts/new.
//
// This redirect is done client-side (router.replace in an effect) rather
// than with next/navigation's server-side redirect(), because the server
// redirect was getting memoized by the client router/edge cache: after it
// fired once, later same-page clicks on "選擇標籤" would silently resolve
// to the cached "just go to /posts/new" outcome instead of re-triggering
// the interception, so the modal stopped opening until a full reload.
export default function NewPostTagsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/posts/new');
  }, [router]);

  return null;
}
