import { NextResponse } from 'next/server';
import { catchError } from '@/lib/catch-error';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/Auth/register';

type RegisterResponse = {
  email: string;
  nickName: string;
  role: string;
  createdAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export async function POST(request: Request) {
  const body = await request.json();

  const [backendResponse, fetchError] = await catchError(
    fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
  if (fetchError) {
    return NextResponse.json(
      { success: false, message: '無法連線到伺服器，請稍後再試', data: null },
      { status: 502 },
    );
  }

  const result = (await backendResponse.json()) as ApiResponse<RegisterResponse>;

  return NextResponse.json(
    { success: result.success, message: result.message, data: result.data },
    { status: backendResponse.status },
  );
}
