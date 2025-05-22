
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_authenticated';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is trying to access an admin route
  if (pathname.startsWith('/admin')) {
    const isAuthenticated = request.cookies.has(ADMIN_COOKIE_NAME) && request.cookies.get(ADMIN_COOKIE_NAME)?.value === 'true';
    
    if (!isAuthenticated) {
      // If not authenticated, redirect to the main page
      // The admin login button is now on the main page's footer.
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = ''; // Clear any query params
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
