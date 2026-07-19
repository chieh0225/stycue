import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope } from '@/types/image';
import type { PublicUserProfileResponse } from '@/types/user';
import { getAuthHeader } from '../../../images/_shared';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ targetUserId: string }> },
) {
  const { targetUserId } = await params;

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

  const [backendResponse, fetchError] = await catchError(
    fetch(
      `https://stycue.rocket-coding.com/api/users/${encodeURIComponent(targetUserId)}/profile`,
      {
        headers: authHeader,
      },
    ),
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

  const result = (await backendResponse.json()) as ApiEnvelope<PublicUserProfileResponse>;
  return NextResponse.json(result, { status: backendResponse.status });
}
