'use server';

/**
 * Server actions for authentication
 */

import { createClient } from '@/lib/supabase/server';
import { ActionResult, success, error, handleError } from '@/lib/api/types';

/**
 * Resend verification email
 * Useful when users need a new verification link
 */
export async function resendVerificationEmail(
  email: string
): Promise<ActionResult<boolean>> {
  try {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return error('Valid email address is required');
    }

    const supabase = await createClient();

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/callback`,
      },
    });

    if (resendError) {
      console.error('[resendVerificationEmail] Error:', resendError);
      
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
