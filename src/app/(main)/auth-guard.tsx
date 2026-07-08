'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthed } from '../auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Deferred to a microtask so the check doesn't setState synchronously
    // within the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      if (isAuthed()) {
        setReady(true);
      } else {
        router.replace('/login');
      }
    });
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
