import { NextResponse } from 'next/server';

/**
 * Lightweight health check for uptime monitoring (e.g. UptimeRobot).
 * No DB or external calls. Do not expose env or internals.
 *
 * Usage: GET /api/health
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: Date.now() },
    { status: 200 }
  );
}
