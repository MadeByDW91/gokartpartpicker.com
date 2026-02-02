import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { IMPERSONATE_COOKIE } from '@/lib/impersonation';

/**
 * POST /api/impersonation/stop
 * Stops viewing as another user. Uses API route instead of server action
 * to avoid "unexpected response" from fetchServerAction.
 * Returns { success, redirect?, error? }.
 */
export async function POST() {
  try {
    const store = await cookies();
    store.delete(IMPERSONATE_COOKIE);
    return NextResponse.json({ success: true, redirect: '/admin' });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed to exit view-as' },
      { status: 500 }
    );
  }
}
