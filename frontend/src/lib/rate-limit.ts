/**
 * Rate limiting for server actions
 * Uses Upstash Redis when configured; gracefully allows all requests when not.
 *
 * Env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * See: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

let authStrictLimiter: Ratelimit | null = null;
let authRelaxedLimiter: Ratelimit | null = null;
let expensiveLimiter: Ratelimit | null = null;

function initLimiters() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return;
  }

  try {
    const redis = new Redis({ url, token });

    // Auth strict: 5 req/min per IP (login, signup, password reset)
    authStrictLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, '1 m'),
      analytics: false,
    });

    // Auth relaxed: 3 req/15 min per IP (resend verification)
    authRelaxedLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, '15 m'),
      analytics: false,
    });

    // Expensive actions: 60 req/min per IP (admin search, etc.)
    expensiveLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(60, '1 m'),
      analytics: false,
    });
  } catch {
    // Redis init failed - limiters stay null, we allow all
  }
}

initLimiters();

export type RateLimitType = 'auth-strict' | 'auth-relaxed' | 'expensive';

/**
 * Get client IP from request headers.
 * Returns 'unknown' if not available (e.g. local dev).
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const cfIp = headersList.get('cf-connecting-ip');

    const ip = cfIp ?? realIp ?? forwarded?.split(',')[0]?.trim() ?? 'unknown';
    return ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

export interface RateLimitResult {
  allowed: boolean;
  error?: string;
}

/**
 * Check rate limit for the given identifier.
 * Returns { allowed: true } or { allowed: false, error: string }.
 * When Upstash is not configured, always allows.
 */
export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<RateLimitResult> {
  const limiter =
    type === 'auth-strict'
      ? authStrictLimiter
      : type === 'auth-relaxed'
        ? authRelaxedLimiter
        : expensiveLimiter;

  if (!limiter) {
    return { allowed: true };
  }

  try {
    const key = `${type}:${identifier}`;
    const result = await limiter.limit(key);

    if (result.success) {
      return { allowed: true };
    }

    const retryAfter = result.reset ? Math.ceil((result.reset - Date.now()) / 1000) : 60;
    return {
      allowed: false,
      error: `Too many requests. Please try again in ${retryAfter} seconds.`,
    };
  } catch {
    // On Redis error, allow the request (fail open)
    return { allowed: true };
  }
}

/**
 * Check rate limit by client IP.
 * Convenience wrapper for IP-based limiting.
 */
export async function checkRateLimitByIp(type: RateLimitType): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return checkRateLimit(type, ip);
}
