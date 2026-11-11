import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTHORIZED_ADMIN_EMAILS = [
  'harish.admin@atharvatravels.com',
  'bhaskar.admin@atharvatravels.com',
  'hemaraj.admin@atharvatravels.com',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, assets, and auth endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.png') ||
    pathname.startsWith('/car-logo.png') ||
    pathname.startsWith('/icon.png') ||
    pathname.startsWith('/apple-icon.png') ||
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/logout'
  ) {
    return NextResponse.next();
  }

  // 1. Guard all protected API endpoints: Require active session cookie
  if (pathname.startsWith('/api/')) {
    const sessionCookie = request.cookies.get('atharva_ets_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        {
          error:
            'Access Denied: Restricted access portal. You must be authenticated as an authorized Atharva administrator.',
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
