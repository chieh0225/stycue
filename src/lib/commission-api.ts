import type {
  CommissionDetailResponse,
  CommissionRewardResponse,
  CreateCommissionRequest,
} from '@/types/commission';
import type { ApiEnvelope } from '@/types/image';

export async function createCommission(
  payload: CreateCommissionRequest,
): Promise<ApiEnvelope<CommissionDetailResponse>> {
  const res = await fetch('/api/commissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiEnvelope<CommissionDetailResponse>;
}

export async function selectBestComment(
  commissionId: string,
  commentId: string,
  // Placeholder for the custom-amount feature in
  // backend-request-custom-award-amount.md — the backend currently ignores
  // any field besides commentId, so passing this today has no effect. Once
  // the backend confirms the real field name (spec calls it `awardPoints`),
  // rename this to match and drop this comment.
  awardPoints?: number,
): Promise<ApiEnvelope<CommissionRewardResponse>> {
  const res = await fetch(`/api/commissions/${commissionId}/best-comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId, awardPoints }),
  });
  return (await res.json()) as ApiEnvelope<CommissionRewardResponse>;
}
