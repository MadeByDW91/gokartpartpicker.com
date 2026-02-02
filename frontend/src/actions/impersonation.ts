'use server';

/**
 * Impersonation (View as user) server actions
 * Admins can view the site as a test user without signing out.
 * Return success({ redirect }) instead of redirect() to avoid "unexpected response"
 * from fetchServerAction when client invokes these actions.
 */

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from './admin';
import { IMPERSONATE_COOKIE } from '@/lib/impersonation';
import type { ActionResult } from '@/lib/api/types';
import { success, error } from '@/lib/api/types';
import { z } from 'zod';
import { uuidSchema, parseInput } from '@/lib/validation/schemas';

const userIdSchema = z.object({ id: uuidSchema });

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8, // 8 hours
};

/**
 * Start viewing as a user. Admin only. Target must not be admin/super_admin.
 */
export async function startImpersonation(userId: string): Promise<ActionResult<{ redirect: string }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ redirect: string }>;
    }

    const parsed = parseInput(userIdSchema, { id: userId });
    if (!parsed.success) {
      return error('Invalid user ID');
    }

    const supabase = await createClient();

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, role, username')
      .eq('id', parsed.data.id)
      .single();

    if (!targetProfile) {
      return error('User not found');
    }

    if (targetProfile.role === 'admin' || targetProfile.role === 'super_admin') {
      return error('Cannot view as another admin. Choose a regular user.');
    }

    const store = await cookies();
    store.set(IMPERSONATE_COOKIE, parsed.data.id, COOKIE_OPTS);

    return success({ redirect: '/dashboard' });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to start view-as');
  }
}

/**
 * Start viewing as the designated "normal user" (test user).
 * Use VIEW_AS_TEST_USER_ID env, or the first non-admin user.
 * One-click from dashboard — no user picker.
 */
export async function startImpersonationAsTestUser(): Promise<ActionResult<{ redirect: string }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ redirect: string }>;
    }

    const supabase = await createClient();
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
      return error(
        'No test user found. Create a regular user account, or set VIEW_AS_TEST_USER_ID in env.'
      );
    }

    const store = await cookies();
    store.set(IMPERSONATE_COOKIE, testUserId, COOKIE_OPTS);

    return success({ redirect: '/dashboard' });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to start view-as');
  }
}

/**
 * Stop viewing as user and clear impersonation cookie.
 * Returns success({ redirect: '/admin' }) so client can redirect; avoids
 * "unexpected response" from fetchServerAction when using redirect().
 */
export async function stopImpersonation(): Promise<
  ActionResult<{ redirect: string }>
> {
  try {
    const store = await cookies();
    store.delete(IMPERSONATE_COOKIE);
    return success({ redirect: '/admin' });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to exit view-as');
  }
}

/**
 * Get current impersonation status for the banner.
 * Returns { active, userId, username } when viewing as another user.
 */
export async function getImpersonationStatus(): Promise<
  ActionResult<{ active: boolean; userId?: string; username?: string }>
> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return success({ active: false });
    }

    const store = await cookies();
    const impersonateId = store.get(IMPERSONATE_COOKIE)?.value?.trim();
    if (!impersonateId) {
      return success({ active: false });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!isAdmin) {
      return success({ active: false });
    }

    const { data: target } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', impersonateId)
      .single();

    if (!target) {
      return success({ active: false });
    }

    return success({
      active: true,
      userId: target.id,
      username: target.username ?? undefined,
    });
  } catch (err) {
    return success({ active: false });
  }
}
