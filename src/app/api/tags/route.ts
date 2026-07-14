import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope } from '@/types/image';
import type { TagResponse } from '@/types/tag';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/tags';
const ACCESS_TOKEN_COOKIE = 'stycue_access_token';

async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = await getAuthHeader();

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}?${searchParams.toString()}`, {
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

  const result = (await backendResponse.json()) as ApiEnvelope<TagResponse[]>;
  return NextResponse.json(result, { status: backendResponse.status });
}

export async function POST(request: Request) {
  const authHeader = await getAuthHeader();

  const body = await request.json();

  const [backendResponse, fetchError] = await catchError(
    fetch(BACKEND_URL, {
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

  const result = (await backendResponse.json()) as ApiEnvelope<TagResponse[]>;
  return NextResponse.json(result, { status: backendResponse.status });
}
