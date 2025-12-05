import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token');

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

