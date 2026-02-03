import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Serve /api/health from middleware so uptime monitors get 200 even if
 * the App Router API route is not present in the deployed bundle.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/health' && request.method === 'GET') {
    return NextResponse.json(
      { status: 'ok', timestamp: Date.now() },
      { status: 200 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/health',
};
