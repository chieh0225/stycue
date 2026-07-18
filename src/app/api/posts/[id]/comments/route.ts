import { NextResponse } from 'next/server';
import { parseApiEnvelope } from '@/lib/api-envelope';
import { catchError } from '@/lib/catch-error';
import type { CommentResponse, UpsertCommentRequest } from '@/types/comment';
import type { ApiEnvelope } from '@/types/image';
import { getAuthHeader } from '../../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/posts';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = await getAuthHeader();

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${id}/comments`, {
      headers: authHeader ?? undefined,
      cache: 'no-store',
    }),
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

  const result = await parseApiEnvelope<CommentResponse[]>(backendResponse, '無法取得留言列表');
  return NextResponse.json(result, { status: backendResponse.status });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = await getAuthHeader();
  if (!authHeader) {
    return NextResponse.json(
      {
        success: false,
        message: '請先登入',
        data: null,
        errorCode: 'NO_TOKEN',
      } satisfies ApiEnvelope<null>,
      { status: 401 },
    );
  }

  const body = (await request.json()) as UpsertCommentRequest;

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${id}/comments`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
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

  const result = await parseApiEnvelope<CommentResponse>(backendResponse, '無法建立留言');
  return NextResponse.json(result, { status: backendResponse.status });
}
