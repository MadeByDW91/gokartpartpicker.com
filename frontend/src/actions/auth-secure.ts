'use server';

/**
 * Secure authentication server actions
 * Phase 1 Security: Account lockout, login attempt tracking
 * Phase 2: Rate limiting to prevent brute force
 */

import { createClient } from '@/lib/supabase/server';
import { ActionResult, success, error } from '@/lib/api/types';
import { checkAccountLockout, logLoginAttempt } from './auth-login';
import { checkRateLimitByIp } from '@/lib/rate-limit';

/**
 * Check if the current user is an admin (admin or super_admin).
 * Used for post-login redirect: admins go to /admin first.
 */
export async function getIsAdmin(): Promise<ActionResult<{ isAdmin: boolean }>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return success({ isAdmin: false });
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const isAdmin =
      !!profile &&
      (profile.role === 'admin' || profile.role === 'super_admin');
    return success({ isAdmin });
  } catch {
    return success({ isAdmin: false });
  }
}

/**
 * Secure login with account lockout protection.
 * Pass captchaToken when Supabase Attack Protection (hCaptcha) is enabled.
 */
export async function secureSignIn(
  email: string,
  password: string,
  captchaToken?: string
): Promise<ActionResult<{ requiresEmailVerification: boolean }>> {
  try {
    const rateLimit = await checkRateLimitByIp('auth-strict');
    if (!rateLimit.allowed) {
      return error(rateLimit.error ?? 'Too many login attempts. Please try again later.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Phase 1 Security: Check if account is locked
    const lockoutCheck = await checkAccountLockout(normalizedEmail);
    if (lockoutCheck.locked) {
      await logLoginAttempt(normalizedEmail, false, 'Account locked - too many failed attempts');
      return error(
        `Account temporarily locked due to too many failed login attempts. Please try again in ${Math.ceil((lockoutCheck.retryAfter || 900) / 60)} minutes.`
      );
    }

    const supabase = await createClient();
    const signInOptions = captchaToken ? { captchaToken } : undefined;
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
      options: signInOptions,
    });

    if (signInError) {
      // Log failed attempt
      await logLoginAttempt(normalizedEmail, false, signInError.message);
      
      // Provide user-friendly error messages
      if (signInError.message.includes('Invalid login credentials')) {
        return error('Invalid email or password');
      }
      if (signInError.message.includes('Email not confirmed')) {
        await logLoginAttempt(normalizedEmail, true); // Don't count as failure if email not verified
        return success({ requiresEmailVerification: true });
      }
      
      return error(signInError.message || 'Login failed');
    }

    // Log successful attempt
    if (data.user) {
      await logLoginAttempt(normalizedEmail, true);
    }

    // Check if email verification is required
    if (data.user && !data.user.email_confirmed_at) {
      return success({ requiresEmailVerification: true });
    }

    return success({ requiresEmailVerification: false });
  } catch (err) {
    const normalizedEmail = email.toLowerCase().trim();
    await logLoginAttempt(normalizedEmail, false, err instanceof Error ? err.message : 'Unknown error');
    return error(err instanceof Error ? err.message : 'Login failed');
  }
}
