'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectToSharePostsNew() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/posts/share/new');
  }, [router]);

  return null;
}
