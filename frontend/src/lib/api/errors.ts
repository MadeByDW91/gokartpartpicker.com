/**
 * User-friendly error message utilities
 * Translates technical errors into messages users can understand.
 * Logging uses secure-logging so we never leak PII or stack traces to logs.
 */

import type { PostgrestError } from '@supabase/supabase-js';
import { secureError } from '@/lib/secure-logging';

/**
 * Map Supabase error codes to user-friendly messages
 */
const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  PGRST116: 'The item you\'re looking for doesn\'t exist. It may have been removed.',
  '23505': 'This item already exists. Please use a different name or identifier.',
  '23503': 'Cannot delete this item because it\'s being used elsewhere.',
  '42P01': 'Unable to access the requested data. Please try again.',
  '42703': 'There was a problem with your request. Please try again.',
};

/**
 * Get user-friendly error message from a Supabase error
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
  // Handle Supabase PostgrestError
  if (error && typeof error === 'object' && 'code' in error) {
    const postgresError = error as PostgrestError;
    
    // Check for known error codes
    if (postgresError.code && postgresError.code in SUPABASE_ERROR_MESSAGES) {
      return SUPABASE_ERROR_MESSAGES[postgresError.code];
    }
    
    // Handle common error codes from PostgREST
    if (postgresError.code === 'PGRST116') {
      return context 
        ? `${context} not found. It may have been removed.`
        : 'The item you\'re looking for doesn\'t exist. It may have been removed.';
    }
    
    // Handle HTTP-like error codes
    if (postgresError.message) {
      // Check for common patterns in error messages
      if (postgresError.message.includes('permission') || postgresError.message.includes('policy')) {
        return 'You don\'t have permission to perform this action.';
      }
      
      if (postgresError.message.includes('JWT') || postgresError.message.includes('auth')) {
        return 'Your session has expired. Please log in again.';
      }
      
      // In development, show more detail
      if (process.env.NODE_ENV === 'development') {
        return postgresError.message;
      }
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    // Timeout errors
    if (message.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    
    // Auth errors
    if (message.includes('unauthorized') || message.includes('not authenticated')) {
      return 'You must be logged in to perform this action.';
    }
    
    if (message.includes('forbidden') || message.includes('permission')) {
      return 'You don\'t have permission to perform this action.';
    }
    
    // Not found errors
    if (message.includes('not found')) {
      return context 
        ? `${context} not found. It may have been removed.`
        : 'The requested item was not found.';
    }
    
    // Validation errors (keep as-is, they're usually user-friendly)
    if (message.includes('validation') || message.includes('invalid')) {
      return error.message;
    }
    
    // In development, show the original message
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
  }
  
  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Enhanced error handler that provides user-friendly messages
 */
export function handleErrorWithContext<T>(
  err: unknown,
  context: string,
  resourceName?: string
): { success: false; error: string; fieldErrors?: Record<string, string[]> } {
  // Log with PII/stack redaction so we never leak to Vercel logs
  secureError(`[${context}] Error`, {
    message: err instanceof Error ? err.message : String(err),
    context,
    resourceName,
    timestamp: new Date().toISOString(),
  });

  const userMessage = getUserFriendlyError(err, resourceName);

  return {
    success: false,
    error: userMessage,
  };
}
