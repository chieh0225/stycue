import { cookies } from 'next/headers';
import { parseApiEnvelope } from '@/lib/api-envelope';
import { catchError } from '@/lib/catch-error';
import type { CommissionDetailResponse } from '@/types/commission';
import type { ApiEnvelope } from '@/types/image';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/commissions';
const ACCESS_TOKEN_COOKIE = 'stycue_access_token';

// GET /api/commissions/{id} allows anonymous access, so callers get partial
// data (no isOwner/canX flags) rather than an error when logged out.
export async function getCommissionServer(
  commissionId: string,
): Promise<ApiEnvelope<CommissionDetailResponse>> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [res, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${commissionId}`, { headers: authHeader, cache: 'no-store' }),
  );
  if (fetchError) {
    return {
      success: false,
      message: '無法連線到伺服器，請稍後再試',
      data: null,
      errorCode: 'UPSTREAM_UNREACHABLE',
    };
  }

  return parseApiEnvelope<CommissionDetailResponse>(res, '無法取得委託文');
}
