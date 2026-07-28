'use client';

import { useCallback, useEffect, useRef } from 'react';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: { type: 'icon'; width: number }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

let gisScriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisScriptPromise = null;
      reject(new Error('無法載入 Google 登入元件'));
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

type UseGoogleSignInOptions = {
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
};

// Renders the real Google button into a hidden container and forwards
// clicks from the caller's own styled button to it, so the credential
// callback still fires as if the official button were clicked directly.
export function useGoogleSignIn({ onCredential, onError }: UseGoogleSignInOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef(false);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredentialRef.current(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'icon',
          width: 200,
        });
        readyRef.current = true;
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current('無法載入 Google 登入元件，請稍後再試');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const triggerClick = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      onErrorRef.current('Google 登入尚未設定，請稍後再試');
      return;
    }
    if (!readyRef.current) {
      onErrorRef.current('Google 登入元件尚未就緒，請稍後再試');
      return;
    }
    const realButton = containerRef.current?.querySelector<HTMLElement>('div[role="button"]');
    realButton?.click();
  }, []);

  return { containerRef, triggerClick };
}
