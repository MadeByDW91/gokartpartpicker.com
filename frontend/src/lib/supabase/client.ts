import { createBrowserClient } from '@supabase/ssr';

// Track network failures to potentially disable auto-refresh
let networkFailureCount = 0;
const MAX_NETWORK_FAILURES = 5;
let lastFailureTime = 0;
const FAILURE_RESET_INTERVAL = 60000; // Reset after 1 minute

// Track if error handler has been registered
let errorHandlerRegistered = false;

/**
 * Check if error is a Supabase network error
 */
function isSupabaseNetworkError(error: unknown): boolean {
  if (!error) return false;
  
  const errorObj = typeof error === 'object' ? error as Record<string, unknown> : null;
  if (!errorObj) return false;
  
  const message = String(errorObj.message || '');
  const name = String(errorObj.name || '');
  const stack = String(errorObj.stack || '');
  
  // Check for "Failed to fetch" which is the main indicator
  const hasFailedFetch = message.includes('Failed to fetch') || stack.includes('Failed to fetch');
  
  // Check if it's related to Supabase auth
  const isSupabaseAuth = 
    stack.includes('@supabase/auth-js') ||
    stack.includes('supabase/auth-js') ||
    stack.includes('auth-js/dist') ||
    stack.includes('_refreshAccessToken') ||
    stack.includes('_callRefreshToken') ||
    stack.includes('_recoverAndRefresh') ||
    stack.includes('_handleRequest') ||
    stack.includes('_request') ||
    name.includes('AuthRetryableFetchError');
  
  // It's a Supabase network error if:
  // 1. It's a "Failed to fetch" AND related to Supabase auth
  // 2. OR it's explicitly an AuthRetryableFetchError
  if (hasFailedFetch && isSupabaseAuth) {
    return true;
  }
  
  if (name.includes('AuthRetryableFetchError')) {
    return true;
  }
  
  // Also catch generic network errors that might be Supabase-related
  if ((name === 'TypeError' || name === 'NetworkError') && 
      (message === 'Failed to fetch' || stack.includes('fetch'))) {
    // Only consider it Supabase if stack contains auth-related patterns
    if (isSupabaseAuth || stack.includes('supabase')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Handle Supabase network errors gracefully
 * Note: Assumes error has already been validated as a Supabase network error
 */
function handleSupabaseError(error: unknown, context: string): void {
  const now = Date.now();
  
  // Reset counter if enough time has passed
  if (now - lastFailureTime > FAILURE_RESET_INTERVAL) {
    networkFailureCount = 0;
  }
  
  networkFailureCount++;
  lastFailureTime = now;
  
  // Only log if it's not excessive (to avoid spam)
  if (networkFailureCount <= MAX_NETWORK_FAILURES) {
    console.warn(`[Supabase] Network error in ${context}:`, {
      message: typeof error === 'object' && 'message' in error 
        ? (error as { message?: unknown }).message 
        : String(error),
      failureCount: networkFailureCount,
      hint: networkFailureCount >= MAX_NETWORK_FAILURES 
        ? 'Network issues detected. Auto-refresh may be disabled temporarily.' 
        : undefined
    });
  }
}

/**
 * Create Supabase client for browser/client components
 * Returns null if credentials are not configured
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('[Supabase Client] Missing credentials:', {
      hasUrl: !!url,
      hasKey: !!key,
    });
    // Return null instead of mock to fail fast
    return null as any;
  }
  
  try {
    const client = createBrowserClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
    
    // Add global error handler for unhandled promise rejections (only once)
    if (typeof window !== 'undefined' && !errorHandlerRegistered) {
      errorHandlerRegistered = true;
      
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason;
        
        // Check if it's a Supabase network error
        if (isSupabaseNetworkError(error)) {
          handleSupabaseError(error, 'unhandledRejection');
          // Prevent the error from being logged to console
          event.preventDefault();
          // Return early - don't log to console
          return;
        }
        
        // Additional check: If it's already identified as a Supabase error, handle it
        // (This is a fallback in case isSupabaseNetworkError didn't catch it)
        if (error && typeof error === 'object') {
          const stack = String('stack' in error ? error.stack : '');
          const name = String('name' in error ? (error as { name?: unknown }).name : '');
          const message = String('message' in error ? (error as { message?: unknown }).message : '');
          
          // Check for AuthRetryableFetchError specifically
          if (name === 'AuthRetryableFetchError' || name.includes('AuthRetryable')) {
            handleSupabaseError(error, 'auth retryable');
            event.preventDefault();
            return;
          }
          
          // Check for Supabase auth patterns even if not caught by main function
          if (message === 'Failed to fetch' && 
              (stack.includes('@supabase') || 
               stack.includes('auth-js') ||
               stack.includes('_refreshAccessToken') ||
               stack.includes('_callRefreshToken'))) {
            handleSupabaseError(error, 'token refresh (fallback)');
            event.preventDefault();
            return;
          }
        }
      };
      
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }
    
    return client;
  } catch (error) {
    console.error('[Supabase Client] Failed to create client:', error);
    // Return null to fail fast instead of silent mock
    return null as any;
  }
}
