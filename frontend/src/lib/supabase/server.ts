import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create Supabase client for server components
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // In production, throw an error instead of returning a mock
    // This will cause server actions to fail gracefully with proper error messages
    if (process.env.NODE_ENV === 'production') {
      console.error('[Supabase Server] Missing environment variables:', {
        hasUrl: !!url,
        hasKey: !!key,
        nodeEnv: process.env.NODE_ENV,
      });
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }
    
    // In development, return a mock client that properly handles queries
    const mockQuery = {
      eq: () => mockQuery,
      neq: () => mockQuery,
      gt: () => mockQuery,
      gte: () => mockQuery,
      lt: () => mockQuery,
      lte: () => mockQuery,
      like: () => mockQuery,
      ilike: () => mockQuery,
      is: () => mockQuery,
      in: () => mockQuery,
      contains: () => mockQuery,
      order: () => mockQuery,
      limit: () => mockQuery,
      single: async () => ({ data: null, error: { message: 'Supabase not configured', code: 'PGRST116' } }),
      maybeSingle: async () => ({ data: null, error: { message: 'Supabase not configured', code: 'PGRST116' } }),
    };
    
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        exchangeCodeForSession: async () => ({ error: null }),
      },
      from: () => ({
        select: () => mockQuery,
        insert: () => ({ select: () => mockQuery }),
        update: () => ({ eq: () => mockQuery }),
        delete: () => ({ eq: () => mockQuery }),
      }),
      rpc: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    } as ReturnType<typeof createServerClient>;
  }
  
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
