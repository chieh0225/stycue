'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectToPostsNew() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/posts/commissions/new');
  }, [router]);

  return null;
}
