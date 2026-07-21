// Routes whose page.tsx is still a placeholder. Remove an entry the same
// day its real page ships — nothing else needs to change.
export const UNRELEASED_ROUTES = [
  '/profile/following',
  '/profile/favorites',
  '/profile/commissions/sent',
  '/profile/settings',
  '/profile/posts',
  '/forgot-password',
] as const;
