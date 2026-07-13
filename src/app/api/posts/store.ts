import type { DraftPhoto } from '@/app/(main)/posts/commissions/new/draft';

export type CreatedPost = {
  postType: string;
  title: string;
  description: string;
  height: string;
  weight: string;
  age: string;
  budget: string;
  points: string;
  tags: string[];
  photos: DraftPhoto[];
  createdAt: string;
};

// Mock in-memory store: in-memory only, resets on server restart. Swap for a
// real posts table once the API exists.
//
// Stashed on globalThis because Next.js dev mode can compile the route
// handler and the server component that reads it into separate module
// instances — a plain module-scoped variable isn't reliably the same
// singleton across them, so a POST here wouldn't be visible to a GET there.
declare global {
  var __stycueCreatedPosts: Map<string, CreatedPost> | undefined;
}

const createdPosts = globalThis.__stycueCreatedPosts ?? new Map<string, CreatedPost>();
globalThis.__stycueCreatedPosts = createdPosts;

export function createPost(data: Omit<CreatedPost, 'createdAt' | 'photos'>): string {
  const id = `post-${Date.now().toString(36)}`;
  createdPosts.set(id, { ...data, photos: [], createdAt: new Date().toISOString() });
  return id;
}

export function getCreatedPost(id: string): CreatedPost | undefined {
  return createdPosts.get(id);
}

export function addPostImages(id: string, photos: DraftPhoto[]): boolean {
  const post = createdPosts.get(id);
  if (!post) return false;
  post.photos.push(...photos);
  return true;
}
