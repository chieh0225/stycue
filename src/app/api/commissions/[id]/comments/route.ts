import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { CommentResponse } from '@/types/comment';
import type { ApiEnvelope } from '@/types/image';
import { getAuthHeader } from '../../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/commissions';

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

  const result = (await backendResponse.json()) as ApiEnvelope<CommentResponse[]>;
  return NextResponse.json(result, { status: backendResponse.status });
}
