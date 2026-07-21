import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { HomepageFeedResponse } from '@/types/homepage';
import type { ApiEnvelope } from '@/types/image';
import { getAuthHeader } from '../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/search';

// Query params the backend accepts, in its own PascalCase.
const FORWARDED_PARAMS = ['Keyword', 'Page', 'PageSize'];

export async function GET(request: Request) {
  const authHeader = await getAuthHeader();

  const incomingParams = new URL(request.url).searchParams;
  const forwardedParams = new URLSearchParams();
  for (const key of FORWARDED_PARAMS) {
    const value = incomingParams.get(key);
    if (value !== null) forwardedParams.set(key, value);
  }
  const query = forwardedParams.toString();

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}${query ? `?${query}` : ''}`, {
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

  const result = (await backendResponse.json()) as ApiEnvelope<HomepageFeedResponse>;
  return NextResponse.json(result, { status: backendResponse.status });
}
