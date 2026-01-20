'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminProfile, UserRole } from '@/types/admin';

interface UseAdminResult {
  profile: AdminProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: UserRole | null;
}

/**
 * Hook to get admin profile and role
 */
export function useAdmin(): UseAdminResult {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // If Supabase is not configured, stop loading immediately
    if (!supabase) {
      console.warn('[useAdmin] Supabase client is not available');
      setLoading(false);
      setProfile(null);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching profile:', {
            error: profileError,
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
            userId: user.id,
            userEmail: user.email
          });
          setProfile(null);
        } else {
          const roleCheck = profileData?.role === 'admin' || profileData?.role === 'super_admin';
          console.log('✅ Profile loaded:', { 
            userId: user.id,
            username: profileData?.username, 
            email: profileData?.email,
            role: profileData?.role,
            roleType: typeof profileData?.role,
            isAdmin: roleCheck,
            fullProfile: profileData
          });
          
          if (!roleCheck && profileData?.role) {
            console.warn('⚠️ User role is not admin:', {
              currentRole: profileData.role,
              expectedRoles: ['admin', 'super_admin'],
              roleMatches: {
                isAdmin: profileData.role === 'admin',
                isSuperAdmin: profileData.role === 'super_admin',
                isUser: profileData.role === 'user'
              }
            });
          }
          
          setProfile(profileData as AdminProfile | null);
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  const role = profile?.role ?? null;
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return {
    profile,
    loading,
    isAdmin,
    isSuperAdmin,
    role,
  };
}

/**
 * Hook to require admin access - redirects non-admins
 */
export function useRequireAdmin(redirectTo = '/') {
  const { profile, loading, isAdmin, isSuperAdmin, role } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push(redirectTo);
    }
  }, [loading, isAdmin, router, redirectTo]);

  return { profile, loading, isAdmin, isSuperAdmin, role };
}

/**
 * Hook to require super admin access
 */
export function useRequireSuperAdmin(redirectTo = '/admin') {
  const { profile, loading, isAdmin, isSuperAdmin, role } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isSuperAdmin) {
      router.push(redirectTo);
    }
  }, [loading, isSuperAdmin, router, redirectTo]);

  return { profile, loading, isAdmin, isSuperAdmin, role };
}
