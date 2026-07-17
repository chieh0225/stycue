import RedirectToSharePostsNew from './redirect-client';

// This route only exists as an intercepted modal (../@modal/(.)tags); a
// direct/refresh landing here should just bounce back to /posts/share/new.
// Forced dynamic so Vercel never freezes that redirect into a static CDN
// response — only takes effect in a Server Component, hence the split into
// redirect-client.tsx.
export const dynamic = 'force-dynamic';

export default function NewSharePostTagsPage() {
  return <RedirectToSharePostsNew />;
}
