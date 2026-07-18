import { cookies } from 'next/headers';
import { parseApiEnvelope } from '@/lib/api-envelope';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope } from '@/types/image';
import type { PostDetailResponse } from '@/types/post';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/posts';
const ACCESS_TOKEN_COOKIE = 'stycue_access_token';

// GET /api/posts/{id} allows anonymous access, so callers get partial data
// (no isOwner/canX/isLiked flags) rather than an error when logged out.
export async function getPostServer(postId: string): Promise<ApiEnvelope<PostDetailResponse>> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [res, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${postId}`, { headers: authHeader, cache: 'no-store' }),
  );
  if (fetchError) {
    return {
      success: false,
      message: '無法連線到伺服器，請稍後再試',
      data: null,
      errorCode: 'UPSTREAM_UNREACHABLE',
    };
  }

  return parseApiEnvelope<PostDetailResponse>(res, '無法取得貼文');
}
