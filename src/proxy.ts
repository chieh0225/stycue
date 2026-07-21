import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UNRELEASED_ROUTES } from '@/lib/unreleased-routes';

export function proxy(request: NextRequest) {
  if ((UNRELEASED_ROUTES as readonly string[]).includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
