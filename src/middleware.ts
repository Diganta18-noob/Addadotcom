import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // Check NextAuth token session cookie or custom session cookie
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value ||
      request.cookies.get('accessToken')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/account', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(request.url));
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
