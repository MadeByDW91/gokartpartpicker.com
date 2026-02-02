'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';

export interface ImpersonationStatus {
  active: boolean;
  userId?: string;
  username?: string;
}

/**
 * Only admins can impersonate. Status uses GET /api/impersonation-status;
 * exit uses POST /api/impersonation/stop. API routes avoid "unexpected response"
 * from fetchServerAction when using server actions.
 */
export function useImpersonation() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [status, setStatus] = useState<ImpersonationStatus>({ active: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !isAdmin) {
      setStatus({ active: false });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/impersonation-status', { credentials: 'same-origin' });
      const data = (await res.json()) as { active: boolean; userId?: string; username?: string };
      if (data?.active && data.userId) {
        setStatus({
          active: true,
          userId: data.userId,
          username: data.username,
        });
      } else {
        setStatus({ active: false });
      }
    } catch {
      setStatus({ active: false });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (adminLoading) {
      setLoading(true);
      return;
    }
    if (!user || !isAdmin) {
      setStatus({ active: false });
      setLoading(false);
      return;
    }
    refresh();
  }, [adminLoading, user, isAdmin, refresh]);

  const exit = useCallback(async () => {
    try {
      const res = await fetch('/api/impersonation/stop', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = (await res.json()) as { success?: boolean; redirect?: string; error?: string };
      if (data?.success && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
    } catch {
      // fallback redirect if request fails
    }
    window.location.href = '/admin';
  }, []);

  return { ...status, loading, refresh, exit };
}
