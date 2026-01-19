'use server';

/**
 * User Management server actions
 * Handle user list, detail, and role management
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, requireSuperAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { uuidSchema, parseInput } from '@/lib/validation/schemas';
import type { AdminProfile } from '@/types/admin';

interface UserWithBuilds extends AdminProfile {
  buildsCount: number;
  lastBuildDate: string | null;
}

/**
 * Get all users with build counts
 */
export async function getUsers(): Promise<ActionResult<UserWithBuilds[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      return error('Failed to fetch users');
    }

    if (!profiles || profiles.length === 0) {
      return success([]);
    }

    // Get build counts for each user
    const userIds = profiles.map((p: any) => p.id);
    const { data: builds } = await supabase
      .from('builds')
      .select('user_id, created_at')
      .in('user_id', userIds);

    // Group builds by user
    const buildsByUser = new Map<string, { count: number; lastDate: string | null }>();
    
    if (builds) {
      for (const build of builds) {
        const userId = build.user_id;
        const existing = buildsByUser.get(userId) || { count: 0, lastDate: null };
        existing.count += 1;
        
        if (!existing.lastDate || build.created_at > existing.lastDate) {
          existing.lastDate = build.created_at;
        }
        
        buildsByUser.set(userId, existing);
      }
    }

    // Combine profiles with build counts
    const usersWithBuilds: UserWithBuilds[] = profiles.map((profile: any) => {
      const buildData = buildsByUser.get(profile.id) || { count: 0, lastDate: null };
      return {
        ...profile,
        buildsCount: buildData.count,
        lastBuildDate: buildData.lastDate,
      };
    });

    return success(usersWithBuilds);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch users');
  }
}

/**
 * Get single user with full details
 */
export async function getUser(userId: string): Promise<ActionResult<UserWithBuilds & { builds: any[] }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate ID
    const parsed = parseInput(uuidSchema, userId);
    if (!parsed.success) {
      return error('Invalid user ID');
    }

    const supabase = await createClient();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return error('User not found');
    }

    // Get user's builds
    const { data: builds } = await supabase
      .from('builds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const buildCount = builds?.length || 0;
    const lastBuildDate = builds && builds.length > 0 ? builds[0].created_at : null;

    const userData = {
      ...profile,
      buildsCount: buildCount,
      lastBuildDate,
      builds: builds || [],
    };

    return success(userData);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch user');
  }
}

/**
 * Update user role (super_admin only)
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin' | 'super_admin'
): Promise<ActionResult<AdminProfile>> {
  try {
    const authResult = await requireSuperAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate inputs
    const idParsed = parseInput(uuidSchema, userId);
    if (!idParsed.success) {
      return error('Invalid user ID');
    }

    const supabase = await createClient();

    // Update role
    const { data, error: dbError } = await supabase
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (dbError || !data) {
      return error('Failed to update user role');
    }

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);

    return success(data as AdminProfile);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to update role');
  }
}
