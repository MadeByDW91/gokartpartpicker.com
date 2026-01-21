import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// In-memory rate limit: key -> timestamps in last 60s. Per-instance on Edge.
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const LIMIT_API = 60;
const LIMIT_ADMIN = 30;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || request.headers.get('x-real-ip') || null;
  return ip && ip.length > 0 && ip.length < 50 ? ip : '0.0.0.0';
}

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const list = rateLimitMap.get(key) ?? [];
  const recent = list.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) return false;
  recent.push(now);
  rateLimitMap.set(key, recent);
  return true;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1) Rate limit for /api and /admin
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    const ip = getClientIp(request);
    const limit = pathname.startsWith('/api') ? LIMIT_API : LIMIT_ADMIN;
    const rlKey = `${pathname.startsWith('/api') ? 'api' : 'admin'}:${ip}`;
    if (!checkRateLimit(rlKey, limit)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // 2) Skip Supabase if not configured (e.g. CI or local without .env)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 3) /admin: 403 when not authenticated
  if (pathname.startsWith('/admin') && !user) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
