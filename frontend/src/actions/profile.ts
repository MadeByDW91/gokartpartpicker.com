'use server';

/**
 * Server actions for user profile management
 */

import { createClient } from '@/lib/supabase/server';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Profile } from '@/types/database';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores').optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).nullable().optional(),
  build_goals: z.array(z.string()).optional(),
  budget_range: z.enum(['under-500', '500-1000', '1000-2000', '2000-5000', '5000-plus']).nullable().optional(),
  primary_use_case: z.enum(['racing', 'recreation', 'kids', 'work', 'competition', 'other']).nullable().optional(),
  interested_categories: z.array(z.string()).optional(),
  newsletter_subscribed: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  public_profile: z.boolean().optional(),
  show_builds_publicly: z.boolean().optional(),
});

/**
 * Get current user's profile
 */
export async function getProfile(): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return error('Must be logged in');
    }

    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('[getProfile] Error:', dbError);
      return error('Failed to fetch profile');
    }

    return success(data as Profile);
  } catch (err) {
    return handleError(err, 'getProfile');
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  input: z.infer<typeof updateProfileSchema>
): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return error('Must be logged in');
    }

    // Validate input
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return error(parsed.error.issues[0]?.message || 'Validation failed');
    }

    // Check username uniqueness if username is being updated
    if (parsed.data.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', parsed.data.username.toLowerCase())
        .neq('id', user.id)
        .single();

      if (existing) {
        return error('Username already taken');
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided
    if (parsed.data.username !== undefined) {
      updateData.username = parsed.data.username.toLowerCase();
    }
    if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
    if (parsed.data.location !== undefined) updateData.location = parsed.data.location;
    if (parsed.data.experience_level !== undefined) updateData.experience_level = parsed.data.experience_level;
    if (parsed.data.build_goals !== undefined) updateData.build_goals = parsed.data.build_goals;
    if (parsed.data.budget_range !== undefined) updateData.budget_range = parsed.data.budget_range;
    if (parsed.data.primary_use_case !== undefined) updateData.primary_use_case = parsed.data.primary_use_case;
    if (parsed.data.interested_categories !== undefined) updateData.interested_categories = parsed.data.interested_categories;
    if (parsed.data.newsletter_subscribed !== undefined) updateData.newsletter_subscribed = parsed.data.newsletter_subscribed;
    if (parsed.data.email_notifications !== undefined) updateData.email_notifications = parsed.data.email_notifications;
    if (parsed.data.public_profile !== undefined) updateData.public_profile = parsed.data.public_profile;
    if (parsed.data.show_builds_publicly !== undefined) updateData.show_builds_publicly = parsed.data.show_builds_publicly;

    const { data, error: dbError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (dbError) {
      console.error('[updateProfile] Error:', dbError);
      return error('Failed to update profile');
    }

    return success(data as Profile);
  } catch (err) {
    return handleError(err, 'updateProfile');
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<ActionResult<{
  totalBuilds: number;
  publicBuilds: number;
  privateBuilds: number;
  totalLikes: number;
  totalViews: number;
}>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return error('Must be logged in');
    }

    // Get build counts
    const { count: totalBuilds } = await supabase
      .from('builds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: publicBuilds } = await supabase
      .from('builds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_public', true);

    const { count: privateBuilds } = await supabase
      .from('builds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_public', false);

    // Get total likes and views from user's builds
    const { data: builds } = await supabase
      .from('builds')
      .select('likes_count, views_count')
      .eq('user_id', user.id);

    const totalLikes = builds?.reduce((sum: number, build: { likes_count?: number }) => sum + (build.likes_count || 0), 0) || 0;
    const totalViews = builds?.reduce((sum: number, build: { views_count?: number }) => sum + (build.views_count || 0), 0) || 0;

    return success({
      totalBuilds: totalBuilds || 0,
      publicBuilds: publicBuilds || 0,
      privateBuilds: privateBuilds || 0,
      totalLikes,
      totalViews,
    });
  } catch (err) {
    return handleError(err, 'getUserStats');
  }
}
