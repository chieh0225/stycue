import { NextResponse } from 'next/server';
import type { ApiEnvelope } from '@/types/image';
import type { PointWalletResponse } from '@/types/points';
import { getAuthHeader } from '../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/points/me';

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

  let backendResponse: Response;
  try {
    backendResponse = await fetch(BACKEND_URL, { headers: authHeader });
  } catch {
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

  const result = (await backendResponse.json()) as ApiEnvelope<PointWalletResponse>;
  return NextResponse.json(result, { status: backendResponse.status });
}
