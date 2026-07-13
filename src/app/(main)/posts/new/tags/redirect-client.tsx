'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectToPostsNew() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/posts/new');
  }, [router]);

  return null;
}
