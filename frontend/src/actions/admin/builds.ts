'use server';

/**
 * Build Moderation server actions
 * Handle build review, approval, and management
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { uuidSchema, parseInput } from '@/lib/validation/schemas';
import type { Build } from '@/types/database';

/**
 * Get all builds for moderation (admin view)
 */
export async function getAdminBuilds(): Promise<ActionResult<Build[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data: builds, error: buildsError } = await supabase
      .from('builds')
      .select(`
        *,
        profile:profiles!builds_user_id_fkey(id, username, email)
      `)
      .order('created_at', { ascending: false });

    if (buildsError) {
      return error('Failed to fetch builds');
    }

    return success((builds as any[]) || []);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch builds');
  }
}

/**
 * Update build visibility (approve/hide)
 */
export async function updateBuildVisibility(
  buildId: string,
  isPublic: boolean
): Promise<ActionResult<Build>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate ID
    const parsed = parseInput(uuidSchema, buildId);
    if (!parsed.success) {
      return error('Invalid build ID');
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('builds')
      .update({
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', buildId)
      .select()
      .single();

    if (dbError || !data) {
      return error('Failed to update build visibility');
    }

    revalidatePath('/admin/builds');
    revalidatePath('/builds');
    revalidatePath(`/builds/${buildId}`);

    return success(data as Build);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to update build');
  }
}

/**
 * Delete a build (admin only)
 */
export async function deleteBuild(
  buildId: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate ID
    const parsed = parseInput(uuidSchema, buildId);
    if (!parsed.success) {
      return error('Invalid build ID');
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('builds')
      .delete()
      .eq('id', buildId);

    if (dbError) {
      return error('Failed to delete build');
    }

    revalidatePath('/admin/builds');
    revalidatePath('/builds');

    return success({ deleted: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to delete build');
  }
}

/**
 * Get build analytics
 */
export async function getBuildAnalytics(): Promise<ActionResult<{
  totalBuilds: number;
  publicBuilds: number;
  totalLikes: number;
  totalViews: number;
  mostPopularBuilds: Array<{ id: string; name: string; likes: number; views: number }>;
}>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data: builds, error: buildsError } = await supabase
      .from('builds')
      .select('id, name, likes_count, views_count, is_public')
      .order('likes_count', { ascending: false });

    if (buildsError) {
      return error('Failed to fetch builds');
    }

    const totalBuilds = builds?.length || 0;
    const publicBuilds = builds?.filter((b: any) => b.is_public).length || 0;
    const totalLikes = builds?.reduce((sum: number, b: any) => sum + (b.likes_count || 0), 0) || 0;
    const totalViews = builds?.reduce((sum: number, b: any) => sum + (b.views_count || 0), 0) || 0;

    const mostPopularBuilds = (builds || [])
      .map((b: any) => ({
        id: b.id,
        name: b.name,
        likes: b.likes_count || 0,
        views: b.views_count || 0,
      }))
      .sort((a: { id: string; name: string; likes: number; views: number }, b: { id: string; name: string; likes: number; views: number }) => (b.likes + b.views) - (a.likes + a.views))
      .slice(0, 10);

    return success({
      totalBuilds,
      publicBuilds,
      totalLikes,
      totalViews,
      mostPopularBuilds,
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch analytics');
  }
}
