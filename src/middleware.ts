import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  // Set session ID cookie for guest tracking
  const response = NextResponse.next();
  if (!request.cookies.get('session_id')) {
    response.cookies.set('session_id', uuid(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  // Protected routes - require authentication
  if (pathname.startsWith('/account') || pathname === '/checkout/confirm') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if ((session.user as any)?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
