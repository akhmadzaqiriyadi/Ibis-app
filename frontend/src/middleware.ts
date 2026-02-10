import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // 2. Define protected routes
  const protectedPaths = ['/dashboard'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 3. Define auth paths (login, register)
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some((path) => 
    request.nextUrl.pathname.startsWith(path)
  );

  // 4. Redirect LOGIC
  
  // If accessing protected route without token -> Redirect to Login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth page WITH token -> Redirect to Dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 5. Config to match paths
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login', 
    '/register'
  ],
};
