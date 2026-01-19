'use server';

/**
 * Admin forum server actions
 * All actions require admin or super_admin role
 */

import { createClient } from '@/lib/supabase/server';
import {
  type ActionResult,
  success,
  error,
  handleError,
} from '@/lib/api/types';
import type { ForumCategory, ForumTopic, ForumPost } from '@/types/database';

// ============================================================================
// Auth Helpers
// ============================================================================

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Admin access required');
  }

  return { user, role: profile.role as 'admin' | 'super_admin' };
}

// ============================================================================
// Forum Dashboard Metrics
// ============================================================================

export interface ForumMetrics {
  totalTopics: number;
  totalPosts: number;
  totalCategories: number;
  activeUsers24h: number;
  topicsCreated24h: number;
  postsCreated24h: number;
  flaggedContentCount: number;
  pinnedTopics: number;
  lockedTopics: number;
}

export async function getForumMetrics(): Promise<ActionResult<ForumMetrics>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // Get total counts
    const { count: totalTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false);

    const { count: totalPosts } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact', head: true });

    const { count: totalCategories } = await supabase
      .from('forum_categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get 24h activity
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: topicsCreated24h } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false)
      .gte('created_at', twentyFourHoursAgo);

    const { count: postsCreated24h } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo);

    // Get active users (users who created topics or posts in last 24h)
    const { data: activeTopics } = await supabase
      .from('forum_topics')
      .select('user_id')
      .eq('is_archived', false)
      .gte('created_at', twentyFourHoursAgo);

    const { data: activePosts } = await supabase
      .from('forum_posts')
      .select('user_id')
      .gte('created_at', twentyFourHoursAgo);

    const activeUserIds = new Set([
      ...(activeTopics?.map((t: { user_id: string }) => t.user_id) || []),
      ...(activePosts?.map((p: { user_id: string }) => p.user_id) || []),
    ]);

    // Get pinned/locked counts
    const { count: pinnedTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('is_pinned', true)
      .eq('is_archived', false);

    const { count: lockedTopics } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('is_locked', true)
      .eq('is_archived', false);

    // Flagged content (placeholder - implement flagging system later)
    const flaggedContentCount = 0;

    return success({
      totalTopics: totalTopics || 0,
      totalPosts: totalPosts || 0,
      totalCategories: totalCategories || 0,
      activeUsers24h: activeUserIds.size,
      topicsCreated24h: topicsCreated24h || 0,
      postsCreated24h: postsCreated24h || 0,
      flaggedContentCount,
      pinnedTopics: pinnedTopics || 0,
      lockedTopics: lockedTopics || 0,
    });
  } catch (err) {
    return handleError(err, 'getForumMetrics');
  }
}

// ============================================================================
// Topic Management
// ============================================================================

export interface ForumTopicsFilters {
  category_id?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  is_archived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'most_replies' | 'most_views';
}

export async function getAdminForumTopics(
  filters?: ForumTopicsFilters
): Promise<ActionResult<ForumTopic[]>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const {
      category_id,
      is_pinned,
      is_locked,
      is_archived = false,
      search,
      page = 1,
      limit = 50,
      sort = 'newest',
    } = filters || {};

    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        user:profiles!forum_topics_user_id_fkey(id, username, avatar_url),
        category:forum_categories!forum_topics_category_id_fkey(id, slug, name)
      `)
      .eq('is_archived', is_archived);

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (is_pinned !== undefined) {
      query = query.eq('is_pinned', is_pinned);
    }

    if (is_locked !== undefined) {
      query = query.eq('is_locked', is_locked);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: true });
        break;
      case 'most_replies':
        query = query.order('is_pinned', { ascending: false }).order('replies_count', { ascending: false });
        break;
      case 'most_views':
        query = query.order('is_pinned', { ascending: false }).order('views_count', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error: dbError } = await query;

    if (dbError) {
      console.error('[getAdminForumTopics] Database error:', dbError);
      return error('Failed to fetch topics');
    }

    return success(data || []);
  } catch (err) {
    return handleError(err, 'getAdminForumTopics');
  }
}

export async function deleteForumTopic(topicId: string): Promise<ActionResult<boolean>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);

    if (dbError) {
      console.error('[deleteForumTopic] Database error:', dbError);
      return error('Failed to delete topic');
    }

    return success(true);
  } catch (err) {
    return handleError(err, 'deleteForumTopic');
  }
}

export async function archiveForumTopic(topicId: string): Promise<ActionResult<boolean>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('forum_topics')
      .update({ is_archived: true })
      .eq('id', topicId);

    if (dbError) {
      console.error('[archiveForumTopic] Database error:', dbError);
      return error('Failed to archive topic');
    }

    return success(true);
  } catch (err) {
    return handleError(err, 'archiveForumTopic');
  }
}

export async function moveForumTopic(
  topicId: string,
  categoryId: string
): Promise<ActionResult<boolean>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('forum_topics')
      .update({ category_id: categoryId })
      .eq('id', topicId);

    if (dbError) {
      console.error('[moveForumTopic] Database error:', dbError);
      return error('Failed to move topic');
    }

    return success(true);
  } catch (err) {
    return handleError(err, 'moveForumTopic');
  }
}

// ============================================================================
// Post Management
// ============================================================================

export interface ForumPostsFilters {
  topic_id?: string;
  user_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
}

export async function getAdminForumPosts(
  filters?: ForumPostsFilters
): Promise<ActionResult<ForumPost[]>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const {
      topic_id,
      user_id,
      search,
      page = 1,
      limit = 50,
      sort = 'newest',
    } = filters || {};

    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        user:profiles!forum_posts_user_id_fkey(id, username, avatar_url),
        topic:forum_topics!forum_posts_topic_id_fkey(id, title, slug, category:forum_categories!forum_topics_category_id_fkey(slug, name))
      `);

    if (topic_id) {
      query = query.eq('topic_id', topic_id);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    // Apply sorting
    query = query.order('created_at', { ascending: sort === 'oldest' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error: dbError } = await query;

    if (dbError) {
      console.error('[getAdminForumPosts] Database error:', dbError);
      return error('Failed to fetch posts');
    }

    return success(data || []);
  } catch (err) {
    return handleError(err, 'getAdminForumPosts');
  }
}

export async function deleteForumPost(postId: string): Promise<ActionResult<boolean>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (dbError) {
      console.error('[deleteForumPost] Database error:', dbError);
      return error('Failed to delete post');
    }

    return success(true);
  } catch (err) {
    return handleError(err, 'deleteForumPost');
  }
}

// ============================================================================
// Category Management
// ============================================================================

export async function getAdminForumCategories(): Promise<ActionResult<ForumCategory[]>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (dbError) {
      console.error('[getAdminForumCategories] Database error:', dbError);
      return error('Failed to fetch categories');
    }

    return success(data || []);
  } catch (err) {
    return handleError(err, 'getAdminForumCategories');
  }
}

export interface CreateCategoryInput {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
  requires_auth?: boolean;
  parent_id?: string;
}

export async function createForumCategory(
  input: CreateCategoryInput
): Promise<ActionResult<ForumCategory>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('forum_categories')
      .insert(input)
      .select()
      .single();

    if (dbError) {
      console.error('[createForumCategory] Database error:', dbError);
      return error('Failed to create category');
    }

    return success(data);
  } catch (err) {
    return handleError(err, 'createForumCategory');
  }
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
  requires_auth?: boolean;
  parent_id?: string;
}

export async function updateForumCategory(
  categoryId: string,
  input: UpdateCategoryInput
): Promise<ActionResult<ForumCategory>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('forum_categories')
      .update(input)
      .eq('id', categoryId)
      .select()
      .single();

    if (dbError) {
      console.error('[updateForumCategory] Database error:', dbError);
      return error('Failed to update category');
    }

    return success(data);
  } catch (err) {
    return handleError(err, 'updateForumCategory');
  }
}

export async function deleteForumCategory(categoryId: string): Promise<ActionResult<boolean>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // Check if category has topics
    const { count } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('is_archived', false);

    if ((count || 0) > 0) {
      return error(`Cannot delete category with ${count} active topics. Please move or archive topics first.`);
    }

    const { error: dbError } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', categoryId);

    if (dbError) {
      console.error('[deleteForumCategory] Database error:', dbError);
      return error('Failed to delete category');
    }

    return success(true);
  } catch (err) {
    return handleError(err, 'deleteForumCategory');
  }
}
