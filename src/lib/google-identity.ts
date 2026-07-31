'use client';

import { useCallback, useEffect, useRef } from 'react';

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

type UseGoogleSignInOptions = {
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
};

// Opens Google's OAuth consent screen in a popup and waits for
// src/app/auth/google-callback/page.tsx to forward the id_token back via
// postMessage. This intentionally avoids Google Identity Services'
// renderButton: in production Google renders that button as a FedCM iframe,
// and browsers block synthetic clicks on it as an anti-clickjacking measure,
// so a custom button can't proxy clicks to it reliably.
export function useGoogleSignIn({ onCredential, onError }: UseGoogleSignInOptions) {
  const stateRef = useRef<string | null>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const { data } = event;
      if (!data || typeof data !== 'object' || !('state' in data)) return;
      if (data.state !== stateRef.current) return;
      stateRef.current = null;

      if ('idToken' in data && typeof data.idToken === 'string') {
        onCredentialRef.current(data.idToken);
      } else if ('error' in data && data.error !== 'access_denied') {
        onErrorRef.current('Google 登入失敗，請稍後再試');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const triggerClick = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      onErrorRef.current('Google 登入尚未設定，請稍後再試');
      return;
    }

    const state = crypto.randomUUID();
    stateRef.current = state;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/auth/google-callback`,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: crypto.randomUUID(),
      state,
      prompt: 'select_account',
    });

    const popup = window.open(
      `${GOOGLE_OAUTH_URL}?${params.toString()}`,
      'google-oauth',
      'width=480,height=640',
    );
    if (!popup) {
      stateRef.current = null;
      onErrorRef.current('瀏覽器阻擋了登入視窗，請允許彈出視窗後再試一次');
    }
  }, []);

  return { triggerClick };
}
