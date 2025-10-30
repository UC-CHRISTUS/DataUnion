import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware - Simple pass-through for now
 * Authentication is handled client-side and in API routes
 */
export async function middleware(req: NextRequest) {
  // For now, just pass through all requests
  // Client-side will handle redirects based on auth state
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
