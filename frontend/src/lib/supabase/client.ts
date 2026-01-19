import { createBrowserClient } from '@supabase/ssr';

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
    
    // Add global error handler for network errors
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.message?.includes('Failed to fetch') && event.reason?.message?.includes('supabase')) {
          console.warn('Supabase network error caught:', event.reason);
          // Don't crash the app - just log the error
          event.preventDefault();
        }
      });
    }
    
    return client;
  } catch (error) {
    console.error('[Supabase Client] Failed to create client:', error);
    // Return null to fail fast instead of silent mock
    return null as any;
  }
}
