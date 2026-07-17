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
  // The amount to award — must be >= the commission's own configured points;
  // anything above that is charged to the commissioner's wallet as the
  // difference (backend errorCode COMMISSION_POINTS_TOO_LOW /
  // INSUFFICIENT_POINTS on the two failure cases).
  awardPoints?: number,
): Promise<ApiEnvelope<CommissionRewardResponse>> {
  const res = await fetch(`/api/commissions/${commissionId}/best-comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId, awardPoints }),
  });
  return (await res.json()) as ApiEnvelope<CommissionRewardResponse>;
}
