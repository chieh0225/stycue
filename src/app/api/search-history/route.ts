import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope } from '@/types/image';
import type { SearchHistoryResponse } from '@/types/search';
import { getAuthHeader } from '../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/users/me/search-history';

export async function GET(request: Request) {
  const authHeader = await getAuthHeader();

  const incomingParams = new URL(request.url).searchParams;
  const limit = incomingParams.get('Limit');
  const query = limit !== null ? `?Limit=${encodeURIComponent(limit)}` : '';

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}${query}`, {
      headers: authHeader ?? undefined,
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

  const result = (await backendResponse.json()) as ApiEnvelope<SearchHistoryResponse[]>;
  return NextResponse.json(result, { status: backendResponse.status });
}
