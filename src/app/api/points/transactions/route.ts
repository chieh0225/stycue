import { NextResponse } from 'next/server';
import type { ApiEnvelope } from '@/types/image';
import type { PagedResponse, PointTransactionResponse } from '@/types/points';
import { getAuthHeader } from '../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/points/transactions';

// Query params the backend accepts, in its own PascalCase.
const FORWARDED_PARAMS = [
  'TransactionType',
  'ReferenceType',
  'ReferenceId',
  'StartAt',
  'EndAt',
  'Page',
  'PageSize',
];

export async function GET(request: Request) {
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

  const incomingParams = new URL(request.url).searchParams;
  const forwardedParams = new URLSearchParams();
  for (const key of FORWARDED_PARAMS) {
    const value = incomingParams.get(key);
    if (value !== null) forwardedParams.set(key, value);
  }
  const query = forwardedParams.toString();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}${query ? `?${query}` : ''}`, {
      headers: authHeader,
    });
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

  const result = (await backendResponse.json()) as ApiEnvelope<
    PagedResponse<PointTransactionResponse>
  >;
  return NextResponse.json(result, { status: backendResponse.status });
}
