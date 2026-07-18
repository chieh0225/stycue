import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope } from '@/types/image';
import type { CreatePointPurchaseResponse } from '@/types/points';
import { getAuthHeader } from '../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/points/purchases';

export async function POST(request: Request) {
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

  const body = await request.text();

  const [backendResponse, fetchError] = await catchError(
    fetch(BACKEND_URL, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body,
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

  const result = (await backendResponse.json()) as ApiEnvelope<CreatePointPurchaseResponse>;
  return NextResponse.json(result, { status: backendResponse.status });
}
