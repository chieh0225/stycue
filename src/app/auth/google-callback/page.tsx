'use client';

import { useEffect } from 'react';

// Google's implicit OAuth flow redirects the popup here with the id_token (or
// an error) in the URL fragment. This page's only job is to forward that back
// to the window that opened the popup, then close itself.
export default function GoogleCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const state = params.get('state');
    const idToken = params.get('id_token');
    const error = params.get('error');

    window.opener?.postMessage(
      idToken ? { state, idToken } : { state, error: error ?? 'unknown_error' },
      window.location.origin,
    );
    window.close();
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center px-7">
      <p className="text-body-md text-text-muted">登入中...</p>
    </div>
  );
}
