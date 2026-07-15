import { NextResponse } from 'next/server';
import { parseApiEnvelope } from '@/lib/api-envelope';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope } from '@/types/image';
import type { LikeResponse } from '@/types/like';
import { getAuthHeader } from '../../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/posts';

async function requireAuth() {
  const authHeader = await getAuthHeader();
  if (!authHeader) {
    return {
      authHeader: null,
      unauthorized: NextResponse.json(
        {
          success: false,
          message: '請先登入',
          data: null,
          errorCode: 'NO_TOKEN',
        } satisfies ApiEnvelope<null>,
        { status: 401 },
      ),
    };
  }
  return { authHeader, unauthorized: null };
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { authHeader, unauthorized } = await requireAuth();
  if (!authHeader) return unauthorized;

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${id}/likes`, { method: 'POST', headers: authHeader }),
  );
  if (fetchError) {
    return NextResponse.json(
      {
        success: false,
        message: '無法連線到伺服器，請稍後再試',
        data: null,
        errorCode: 'UPSTREAM_UNREACHABLE',
      } satisfies ApiEnvelope<null>,
      { status: 502 },
    );
  }

  const result = await parseApiEnvelope<LikeResponse>(backendResponse, '無法對貼文按讚');
  return NextResponse.json(result, { status: backendResponse.status });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { authHeader, unauthorized } = await requireAuth();
  if (!authHeader) return unauthorized;

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${id}/likes`, { method: 'DELETE', headers: authHeader }),
  );
  if (fetchError) {
    return NextResponse.json(
      {
        success: false,
        message: '無法連線到伺服器，請稍後再試',
        data: null,
        errorCode: 'UPSTREAM_UNREACHABLE',
      } satisfies ApiEnvelope<null>,
      { status: 502 },
    );
  }

  const result = await parseApiEnvelope<LikeResponse>(backendResponse, '無法取消對貼文按讚');
  return NextResponse.json(result, { status: backendResponse.status });
}
