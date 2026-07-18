import type { ApiEnvelope } from '@/types/image';
import type { CreatePostRequest, PostDetailResponse } from '@/types/post';

export async function createPost(
  payload: CreatePostRequest,
): Promise<ApiEnvelope<PostDetailResponse>> {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiEnvelope<PostDetailResponse>;
}

export async function updatePost(
  postId: string,
  payload: CreatePostRequest,
): Promise<ApiEnvelope<PostDetailResponse>> {
  const res = await fetch(`/api/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiEnvelope<PostDetailResponse>;
}
