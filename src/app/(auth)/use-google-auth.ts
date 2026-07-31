'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGoogleSignIn } from '@/lib/google-identity';
import { setAuthed } from '../auth';

// Shared by login/register pages: the backend's google-login endpoint
// handles both sign-up and sign-in for a Google account in one call.
export function useGoogleAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleCredential(idToken: string) {
    setApiError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const result = await res.json();
      if (!result.success) {
        setApiError(result.message || 'Google 登入失敗，請稍後再試');
        return;
      }
      setAuthed(result.data);
      router.push('/');
    } catch {
      setApiError('無法連線到伺服器，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  const { triggerClick } = useGoogleSignIn({
    onCredential: handleCredential,
    onError: (message) => {
      setLoading(false);
      setApiError(message);
    },
  });

  return { triggerClick, loading, apiError };
}
