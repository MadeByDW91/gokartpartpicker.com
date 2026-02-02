import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { IMPERSONATE_COOKIE } from '@/lib/impersonation';

/**
 * GET /api/impersonation-status
 * Returns { active, userId?, username? } for the impersonation banner.
 * Uses a normal API route instead of a server action to avoid "unexpected response"
 * from fetchServerAction when the client polls on load.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ active: false });
    }

    const store = await cookies();
    const impersonateId = store.get(IMPERSONATE_COOKIE)?.value?.trim();
    if (!impersonateId) {
      return NextResponse.json({ active: false });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ active: false });
    }

    const { data: target } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', impersonateId)
      .single();

    if (!target) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      userId: target.id,
      username: target.username ?? undefined,
    });
  } catch {
    return NextResponse.json({ active: false });
  }
}
