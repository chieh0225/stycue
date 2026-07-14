import { cookies } from 'next/headers';
import { catchError } from '@/lib/catch-error';
import type { CommentResponse } from '@/types/comment';
import type { ApiEnvelope } from '@/types/image';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/commissions';
const ACCESS_TOKEN_COOKIE = 'stycue_access_token';

// GET /api/commissions/{commissionId}/comments allows anonymous access, so
// callers get partial data (no isOwner/canEdit/canDelete/isLiked flags)
// rather than an error when logged out.
export async function getCommentsServer(
  commissionId: string,
): Promise<ApiEnvelope<CommentResponse[]>> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [res, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${commissionId}/comments`, { headers: authHeader, cache: 'no-store' }),
  );
  if (fetchError) {
    return {
      success: false,
      message: '無法連線到伺服器，請稍後再試',
      data: null,
      errorCode: 'UPSTREAM_UNREACHABLE',
    };
  }

  return (await res.json()) as ApiEnvelope<CommentResponse[]>;
}
