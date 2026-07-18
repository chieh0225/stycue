import type { FavoriteResponse } from '@/types/favorite';
import type { ApiEnvelope } from '@/types/image';

export async function favoritePost(postId: string): Promise<ApiEnvelope<FavoriteResponse>> {
  const res = await fetch(`/api/posts/${postId}/favorites`, { method: 'POST' });
  return (await res.json()) as ApiEnvelope<FavoriteResponse>;
}

export async function unfavoritePost(postId: string): Promise<ApiEnvelope<FavoriteResponse>> {
  const res = await fetch(`/api/posts/${postId}/favorites`, { method: 'DELETE' });
  return (await res.json()) as ApiEnvelope<FavoriteResponse>;
}
