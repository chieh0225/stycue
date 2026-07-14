import type { CommentResponse, UpsertCommentRequest } from '@/types/comment';
import type { ApiEnvelope } from '@/types/image';

export async function createComment(
  commissionId: string,
  payload: UpsertCommentRequest,
): Promise<ApiEnvelope<CommentResponse>> {
  const res = await fetch(`/api/commissions/${commissionId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiEnvelope<CommentResponse>;
}

export async function createReply(
  commentId: string,
  payload: UpsertCommentRequest,
): Promise<ApiEnvelope<CommentResponse>> {
  const res = await fetch(`/api/comments/${commentId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiEnvelope<CommentResponse>;
}

export async function updateComment(
  commentId: string,
  payload: UpsertCommentRequest,
): Promise<ApiEnvelope<CommentResponse>> {
  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiEnvelope<CommentResponse>;
}
