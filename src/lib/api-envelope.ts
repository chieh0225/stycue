import type { ApiEnvelope } from '@/types/image';

// Some error responses from the backend (e.g. an invalid/non-existent id
// rejected at the routing layer before it reaches a controller) come back
// with an empty body rather than a JSON ApiEnvelope. Parsing defensively
// here avoids letting `res.json()` throw on an empty stream.
export async function parseApiEnvelope<T>(
  res: Response,
  emptyBodyMessage: string,
): Promise<ApiEnvelope<T>> {
  const text = await res.text();
  if (!text) {
    return {
      success: false,
      message: `${emptyBodyMessage}（${res.status}）`,
      data: null,
      errorCode: 'UPSTREAM_ERROR',
    };
  }

  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    return {
      success: false,
      message: '伺服器回應格式錯誤',
      data: null,
      errorCode: 'INVALID_RESPONSE',
    };
  }
}
