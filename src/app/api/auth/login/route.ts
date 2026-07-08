import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/Auth/login';

type LoginResponse = {
  accessToken: string;
  email: string;
  nickName: string;
  role: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export async function POST(request: Request) {
  const body = await request.json();

  const backendResponse = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = (await backendResponse.json()) as ApiResponse<LoginResponse>;

  if (!result.success || !result.data) {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: backendResponse.status },
    );
  }

  const response = NextResponse.json({
    success: true,
    message: result.message,
    data: {
      email: result.data.email,
      nickName: result.data.nickName,
      role: result.data.role,
    },
  });

  response.cookies.set('stycue_access_token', result.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
