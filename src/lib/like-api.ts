import type { ApiEnvelope } from '@/types/image';
import type { LikeResponse } from '@/types/like';

export async function likeCommission(commissionId: string): Promise<ApiEnvelope<LikeResponse>> {
  const res = await fetch(`/api/commissions/${commissionId}/likes`, { method: 'POST' });
  return (await res.json()) as ApiEnvelope<LikeResponse>;
}

export async function unlikeCommission(commissionId: string): Promise<ApiEnvelope<LikeResponse>> {
  const res = await fetch(`/api/commissions/${commissionId}/likes`, { method: 'DELETE' });
  return (await res.json()) as ApiEnvelope<LikeResponse>;
}

export async function likeComment(commentId: string): Promise<ApiEnvelope<LikeResponse>> {
  const res = await fetch(`/api/comments/${commentId}/likes`, { method: 'POST' });
  return (await res.json()) as ApiEnvelope<LikeResponse>;
}

export async function unlikeComment(commentId: string): Promise<ApiEnvelope<LikeResponse>> {
  const res = await fetch(`/api/comments/${commentId}/likes`, { method: 'DELETE' });
  return (await res.json()) as ApiEnvelope<LikeResponse>;
}

export async function likePost(postId: string): Promise<ApiEnvelope<LikeResponse>> {
  const res = await fetch(`/api/posts/${postId}/likes`, { method: 'POST' });
  return (await res.json()) as ApiEnvelope<LikeResponse>;
}

export async function unlikePost(postId: string): Promise<ApiEnvelope<LikeResponse>> {
  const res = await fetch(`/api/posts/${postId}/likes`, { method: 'DELETE' });
  return (await res.json()) as ApiEnvelope<LikeResponse>;
}
