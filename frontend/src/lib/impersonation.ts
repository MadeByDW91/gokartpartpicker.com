/**
 * Impersonation (View as user) helpers
 * Server-only: use cookies() and createClient. Import only from server code.
 * Admins can view the site as a specific user for testing and development.
 * Respects RLS: we use the admin's session; effective user only changes which
 * user's data we fetch for display (view-only).
 */

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const IMPERSONATE_COOKIE = 'gkp_impersonate';

export interface ImpersonationContext {
  realUser: { id: string } | null;
  effectiveUserId: string | null;
  isImpersonating: boolean;
}

/**
 * Get effective user for data fetching.
 * When an admin has set impersonation, returns the impersonated user's ID.
 * Otherwise returns the real user's ID. Real user is always the actual session.
 */
export async function getImpersonationContext(): Promise<ImpersonationContext> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { realUser: null, effectiveUserId: null, isImpersonating: false };
  }

  const cookieStore = await cookies();
  const impersonateId = cookieStore.get(IMPERSONATE_COOKIE)?.value?.trim();

  if (!impersonateId) {
    return {
      realUser: { id: user.id },
      effectiveUserId: user.id,
      isImpersonating: false,
    };
  }

  // Validate UUID-ish
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(impersonateId)) {
    return {
      realUser: { id: user.id },
      effectiveUserId: user.id,
      isImpersonating: false,
    };
  }

  // Only allow impersonation for admins
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!isAdmin) {
    return {
      realUser: { id: user.id },
      effectiveUserId: user.id,
      isImpersonating: false,
    };
  }

  return {
    realUser: { id: user.id },
    effectiveUserId: impersonateId,
    isImpersonating: true,
  };
}
