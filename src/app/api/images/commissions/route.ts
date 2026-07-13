import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';
import type { ApiEnvelope, ImageResponse } from '@/types/image';
import { getAuthHeader } from '../_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/images/commissions';

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

  const incoming = await request.formData();
  const file = incoming.get('File');
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      {
        success: false,
        message: '缺少圖片檔案',
        data: null,
        errorCode: 'INVALID_REQUEST',
      } satisfies ApiEnvelope<null>,
      { status: 400 },
    );
  }

  const outgoing = new FormData();
  outgoing.append('File', file, file instanceof File ? file.name : 'upload');
  const category = incoming.get('Category');
  if (category !== null) outgoing.append('Category', category);
  const brand = incoming.get('Brand');
  if (brand !== null) outgoing.append('Brand', brand);

  const [backendResponse, fetchError] = await catchError(
    fetch(BACKEND_URL, {
      method: 'POST',
      headers: authHeader, // do NOT set Content-Type — fetch derives the multipart boundary
      body: outgoing,
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

  const result = (await backendResponse.json()) as ApiEnvelope<ImageResponse>;
  return NextResponse.json(result, { status: backendResponse.status });
}
