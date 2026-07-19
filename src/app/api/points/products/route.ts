import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope } from '@/types/image';
import type { PointProductResponse } from '@/types/points';
import { getAuthHeader } from '../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/points/products';

export async function GET() {
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
    fetch(BACKEND_URL, { headers: authHeader }),
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

  const result = (await backendResponse.json()) as ApiEnvelope<PointProductResponse[]>;
  return NextResponse.json(result, { status: backendResponse.status });
}
