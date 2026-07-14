import type { CommissionDetailResponse, CreateCommissionRequest } from '@/types/commission';
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
