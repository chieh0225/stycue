import { NextResponse } from 'next/server';
import { parseApiEnvelope } from '@/lib/api-envelope';
import { catchError } from '@/lib/catch-error';
import type { CommissionRewardResponse } from '@/types/commission';
import type { ApiEnvelope } from '@/types/image';
import { getAuthHeader } from '../../../images/_shared';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/commissions';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const body = (await request.json()) as { commentId: string; awardPoints?: number };

  const [backendResponse, fetchError] = await catchError(
    fetch(`${BACKEND_URL}/${id}/best-comment`, {
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

  const result = await parseApiEnvelope<CommissionRewardResponse>(
    backendResponse,
    '無法選擇最佳留言',
  );
  return NextResponse.json(result, { status: backendResponse.status });
}
