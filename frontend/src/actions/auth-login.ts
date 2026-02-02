'use server';

/**
 * Login attempt tracking and account lockout
 * Phase 1 Security: Track login attempts and enforce account lockout
 */

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { secureError } from '@/lib/secure-logging';

/**
 * Get client IP address from request headers
 */
async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || h.get('x-real-ip');
  if (ip && ip.length > 0 && ip.length < 50) return ip;
  return '0.0.0.0';
}

/**
 * Check if account is locked due to too many failed login attempts
 */
export async function checkAccountLockout(email: string): Promise<{ locked: boolean; retryAfter?: number }> {
  try {
    const supabase = await createClient();
    
    // Call the database function to check lockout
    const { data, error } = await supabase.rpc('check_account_lockout', {
      p_email: email.toLowerCase().trim(),
    });

    if (error) {
      secureError('[checkAccountLockout] RPC error:', error);
      // Fail open - don't block login if check fails
      return { locked: false };
    }

    if (data === true) {
      // Account is locked - calculate retry time (15 minutes from now)
      return { 
        locked: true, 
        retryAfter: 15 * 60 // 15 minutes in seconds
      };
    }

    return { locked: false };
  } catch (err) {
    secureError('[checkAccountLockout] Error:', err);
    // Fail open
    return { locked: false };
  }
}

/**
 * Log a login attempt
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  failureReason?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const ip = await getClientIp();
    const h = await headers();
    const userAgent = h.get('user-agent') || null;

    // Insert login attempt (using service role would be better, but anon with RLS policy works)
    // Note: The RLS policy allows system inserts, but we're using anon key
    // In production, consider using a service role for this or a database trigger
    const { error } = await supabase
      .from('login_attempts')
      .insert({
        email: email.toLowerCase().trim(),
        ip_address: ip !== '0.0.0.0' ? ip : null,
        user_agent: userAgent,
        success,
        failure_reason: failureReason || null,
      });

    if (error) {
      // Don't throw - logging failures shouldn't break login
      secureError('[logLoginAttempt] Failed to log attempt:', error);
    }
  } catch (err) {
    // Don't throw - logging is non-critical
    secureError('[logLoginAttempt] Error:', err);
  }
}
