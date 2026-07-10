import { NextResponse } from 'next/server';
import type { ApiEnvelope } from '@/types/image';
import { getAuthHeader } from '../_shared';

const BACKEND_BASE_URL = 'https://stycue.rocket-coding.com/api/images';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  const { imageId } = await params;
  const authHeader = await getAuthHeader();
  if (!authHeader) {
    return NextResponse.json(
      {
        success: false,
        message: '請先登入',
        data: null,
        errorCode: 'NO_TOKEN',
      } satisfies ApiEnvelope<unknown>,
      { status: 401 },
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_BASE_URL}/${encodeURIComponent(imageId)}`, {
      method: 'DELETE',
      headers: authHeader,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: '無法連線到伺服器，請稍後再試',
        data: null,
        errorCode: 'UPSTREAM_UNREACHABLE',
      } satisfies ApiEnvelope<unknown>,
      { status: 502 },
    );
  }

  const result = (await backendResponse.json()) as ApiEnvelope<unknown>;
  return NextResponse.json(result, { status: backendResponse.status });
}
