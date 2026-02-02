'use server';

/**
 * Server actions for authentication
 * Phase 2: Rate limiting on resend verification
 */

import { createClient } from '@/lib/supabase/server';
import { ActionResult, success, error, handleError } from '@/lib/api/types';
import { secureError } from '@/lib/secure-logging';
import { checkRateLimitByIp } from '@/lib/rate-limit';

/**
 * Resend verification email
 * Useful when users need a new verification link
 */
export async function resendVerificationEmail(
  email: string
): Promise<ActionResult<boolean>> {
  try {
    const rateLimit = await checkRateLimitByIp('auth-relaxed');
    if (!rateLimit.allowed) {
      return error(rateLimit.error ?? 'Too many requests. Please wait before requesting another email.');
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return error('Valid email address is required');
    }

    const supabase = await createClient();

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || '3001'}`}/auth/callback`,
      },
    });

    if (resendError) {
      secureError('[resendVerificationEmail] Error:', resendError);
      
      // Provide user-friendly error messages
      if (resendError.message.includes('rate limit')) {
        return error('Too many requests. Please wait a few minutes before requesting another email.');
      }
      
      if (resendError.message.includes('already confirmed')) {
        return error('This email has already been verified. You can log in now.');
      }
      
      return error(resendError.message || 'Failed to send verification email');
    }

    return success(true);
  } catch (err) {
    return handleError(err, 'resendVerificationEmail');
  }
}
