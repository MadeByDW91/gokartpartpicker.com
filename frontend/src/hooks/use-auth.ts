'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  
  useEffect(() => {
    // If Supabase is not configured, stop loading immediately
    if (!supabase) {
      console.warn('[useAuth] Supabase client is not available');
      setLoading(false);
      setUser(null);
      setSession(null);
      return;
    }
    
    // Safety timeout: if session check takes too long, stop loading
    const timeoutId = setTimeout(() => {
      console.warn('[useAuth] Session check timeout - stopping loading');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Don't fail completely on network errors - just clear session
          if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
            console.warn('Network error getting session, clearing local session');
            setSession(null);
            setUser(null);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        setSession(null);
        setUser(null);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const authChangeResult = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          // Ignore token refresh errors - they're handled internally
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        },
        (error: unknown) => {
          // Handle auth errors gracefully
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = (error as { message?: string }).message;
            if (errorMessage?.includes('Failed to fetch') || errorMessage?.includes('Network')) {
              console.warn('Network error in auth state change:', error);
              // Don't clear session on network errors - might be temporary
            } else {
              console.error('Auth state change error:', error);
            }
          } else {
            console.error('Auth state change error:', error);
          }
          setLoading(false);
        }
      );
      subscription = authChangeResult.data?.subscription || null;
    } catch (error) {
      console.warn('[useAuth] Failed to set up auth state listener:', error);
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication is not available. Please check your configuration.');
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    
    if (error) throw error;
    router.push('/dashboard');
  };
  
  const signUp = async (
    email: string,
    password: string,
    username: string,
    captchaToken?: string
  ) => {
    if (!supabase) {
      throw new Error('Authentication is not available. Please check your configuration.');
    }
    setLoading(true);
    try {
      // Validate username format client-side first
      const usernameLower = username.toLowerCase().trim();
      if (!/^[a-z0-9_]+$/.test(usernameLower)) {
        throw new Error('Username can only contain lowercase letters, numbers, and underscores');
      }
      if (usernameLower.length < 3 || usernameLower.length > 30) {
        throw new Error('Username must be between 3 and 30 characters');
      }

      const signUpOptions: { data: { username: string }; captchaToken?: string } = {
        data: { username: usernameLower },
      };
      if (captchaToken) signUpOptions.captchaToken = captchaToken;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions,
      });
      
      if (error) {
        setLoading(false);
        // Provide more user-friendly error messages
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists');
        } else if (error.message.includes('password')) {
          throw new Error('Password does not meet requirements');
        } else if (error.message.includes('email')) {
          throw new Error('Invalid email address');
        }
        throw new Error(error.message || 'Failed to create account');
      }
      
      // Profile is automatically created by database trigger (handle_new_user)
      // The trigger reads username from raw_user_meta_data->>'username'
      // No manual insert needed - trigger handles it with SECURITY DEFINER
      
      setLoading(false);
      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };
  
  const signOut = async () => {
    if (!supabase) {
      router.push('/');
      return;
    }
    await supabase.auth.signOut();
    router.push('/');
  };
  
  const signInWithMagicLink = async (email: string) => {
    if (!supabase) {
      throw new Error('Authentication is not available. Please check your configuration.');
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
  };
  
  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithMagicLink,
    isAuthenticated: !!user,
  };
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);
  
  return { user, loading };
}
