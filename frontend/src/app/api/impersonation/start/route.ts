import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { IMPERSONATE_COOKIE } from '@/lib/impersonation';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8,
} as const;

/**
 * POST /api/impersonation/start
 * Start viewing as the designated test user (VIEW_AS_TEST_USER_ID or first user).
 * Uses API route instead of server action to avoid "unexpected response" from fetchServerAction.
 * Returns { success, redirect?, error? }.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    let testUserId: string | null = null;
    const envId = process.env.VIEW_AS_TEST_USER_ID?.trim();
    if (envId) {
      const { data } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', envId)
        .single();
      if (data && data.role !== 'admin' && data.role !== 'super_admin') {
        testUserId = data.id;
      }
    }

    if (!testUserId) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'user')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      testUserId = data?.id ?? null;
    }

    if (!testUserId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No test user found. Create a regular user account, or set VIEW_AS_TEST_USER_ID in env.',
        },
        { status: 400 }
      );
    }

    const store = await cookies();
    store.set(IMPERSONATE_COOKIE, testUserId, COOKIE_OPTS);

    return NextResponse.json({ success: true, redirect: '/dashboard' });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed to start view-as' },
      { status: 500 }
    );
  }
}
