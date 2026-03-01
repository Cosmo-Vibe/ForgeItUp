import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Block /admin/* completely in production — return 404 so the route is undetectable
  if (
    process.env.NODE_ENV === 'production' &&
    request.nextUrl.pathname.startsWith('/admin')
  ) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
