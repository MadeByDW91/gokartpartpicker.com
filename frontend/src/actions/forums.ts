'use server';

/**
 * Server actions for forum operations
 * Security-first implementation with validation, rate limiting, and spam detection
 */

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ForumCategory, ForumPost, ForumTopic } from '@/types/database';
import {
  createForumTopicSchema,
  updateForumTopicSchema,
  getForumTopicsSchema,
  createForumPostSchema,
  updateForumPostSchema,
  getForumPostsSchema,
  pinTopicSchema,
  lockTopicSchema,
  banUserSchema,
  parseInput,
  type CreateForumTopicInput,
  type UpdateForumTopicInput,
  type GetForumTopicsInput,
  type CreateForumPostInput,
  type UpdateForumPostInput,
  type GetForumPostsInput,
  type PinTopicInput,
  type LockTopicInput,
  type BanUserInput,
} from '@/lib/validation/forums';
import {
  type ActionResult,
  success,
  error,
  handleError,
} from '@/lib/api/types';
import { sanitizeContent, detectSpam } from '@/lib/sanitization';
import { getProfileDisplayMap } from '@/actions/profile';

// ============================================================================
// Helpers
// ============================================================================

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || h.get('x-real-ip');
  if (ip && ip.length > 0 && ip.length < 50) return ip;
  return '127.0.0.1';
}

// ============================================================================
// Auth Helpers
// ============================================================================

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  return user;
}

async function getCurrentUserWithRole() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    role: profile.role as 'user' | 'admin' | 'super_admin' | 'moderator',
  };
}

// ============================================================================
// Rate Limiting
// ============================================================================

async function checkRateLimit(
  userId: string | null,
  ipAddress: string,
  actionType: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_ip_address: ipAddress,
    p_action_type: actionType,
    p_max_attempts: maxAttempts,
    p_window_seconds: windowSeconds,
  });

  if (dbError) {
    console.error('[checkRateLimit] Error:', dbError);
    // Fail open for now, but log the error
    return { allowed: true };
  }

  if (!data) {
    return { allowed: false, retryAfter: windowSeconds };
  }

  return { allowed: data };
}

// ============================================================================
// Forum Categories
// ============================================================================

/**
 * Get all active forum categories
 * Public action - no auth required
 */
export async function getForumCategories(): Promise<
  ActionResult<
    Array<{
      id: string;
      slug: string;
      name: string;
      description: string | null;
      parent_id: string | null;
      icon: string | null;
      color: string | null;
      sort_order: number;
      is_active: boolean;
      requires_auth: boolean;
      created_at: string;
      updated_at: string;
      topic_count?: number;
      post_count?: number;
    }>
  >
> {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientErr) {
      console.warn('[getForumCategories] Supabase client failed:', clientErr);
      return success([]);
    }

    if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('[getForumCategories] Supabase not configured');
      return success([]);
    }

    const { data, error: dbError } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (dbError) {
      // Check if table doesn't exist (common error codes: 42P01, PGRST116)
      const errorCode = dbError.code || dbError.message || '';
      const errorString = typeof errorCode === 'string' ? errorCode : String(errorCode);
      
      if (errorString.includes('42P01') || errorString.includes('relation') || errorString.includes('does not exist') || errorString.includes('PGRST')) {
        console.warn('[getForumCategories] Forum tables not found. Migration may not have been run.');
        // Return empty array instead of error - allows page to load
        return success([]);
      }
      
      console.error('[getForumCategories] Database error:', dbError);
      return error('Failed to fetch forum categories');
    }

    // If no data, return empty array
    if (!data || data.length === 0) {
      return success([]);
    }

    // Use optimized database function to get counts in a single query (fixes N+1 issue)
    const { data: categoriesWithCounts, error: functionError } = await supabase
      .rpc('get_forum_categories_with_counts');

    if (functionError) {
      // Fallback to original method if function doesn't exist (for backwards compatibility)
      // Check if it's a "function doesn't exist" error
      const errorMessage = functionError.message || String(functionError);
      if (errorMessage.includes('does not exist') || errorMessage.includes('function') || errorMessage.includes('42883')) {
        console.warn('[getForumCategories] Function not available, using fallback. Run migration 20260117000002_optimize_forum_category_counts.sql');
      } else {
        console.warn('[getForumCategories] RPC error, using fallback:', functionError);
      }
      
      // Use the data we already fetched
      const categoriesWithCountsFallback = await Promise.all(
        data.map(async (category: ForumCategory) => {
          const { count: topicCount } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_archived', false);

          const { data: topics } = await supabase
            .from('forum_topics')
            .select('replies_count')
            .eq('category_id', category.id)
            .eq('is_archived', false);

          const postCount = topics?.reduce((sum: number, topic: { replies_count: number | null }) => sum + (topic.replies_count || 0), 0) || 0;

          return {
            ...category,
            topic_count: topicCount || 0,
            post_count: postCount,
          };
        })
      );
      
      return success(categoriesWithCountsFallback);
    }

    // If function returned data, use it
    if (categoriesWithCounts && categoriesWithCounts.length > 0) {
      return success(categoriesWithCounts);
    }

    // Final fallback: return categories without counts
    return success(data.map((cat: ForumCategory) => ({
      ...cat,
      topic_count: 0,
      post_count: 0,
    })));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('relation') || errorMessage.includes('does not exist') || errorMessage.includes('42P01')) {
      console.warn('[getForumCategories] Forum tables not found. Migration may not have been run.');
      return success([]);
    }
    console.error('[getForumCategories] Unexpected error:', err);
    return success([]);
  }
}

/**
 * Get a single forum category by slug
 * Public action - no auth required
 */
export async function getForumCategory(
  slug: string
): Promise<
  ActionResult<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    parent_id: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    is_active: boolean;
    requires_auth: boolean;
    created_at: string;
    updated_at: string;
  }>
> {
  try {
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (dbError) {
      console.error('[getForumCategory] Database error:', dbError);
      return error('Category not found');
    }

    if (!data) {
      return error('Category not found');
    }

    return success(data);
  } catch (err) {
    return handleError(err, 'getForumCategory');
  }
}

// ============================================================================
// Forum Topics
// ============================================================================

/**
 * Get forum topics with filters
 * Public action - no auth required
 */
export async function getForumTopics(
  filters?: Partial<GetForumTopicsInput>
): Promise<
  ActionResult<
    Array<{
      id: string;
      category_id: string;
      user_id: string;
      title: string;
      slug: string;
      content: string;
      is_pinned: boolean;
      is_locked: boolean;
      is_archived: boolean;
      views_count: number;
      replies_count: number;
      last_reply_at: string | null;
      last_reply_by: string | null;
      created_at: string;
      updated_at: string;
    }>
  >
> {
  try {
    const parsed = parseInput(getForumTopicsSchema, filters ?? {});
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const { category_id, page, limit, sort, filter } = parsed.data;
    const supabase = await createClient();

    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        category:forum_categories!forum_topics_category_id_fkey(id, slug, name)
      `)
      .eq('is_archived', false);

    if (category_id) {
      query = query.eq('category_id', category_id);
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

    const { data: topics, error: dbError } = await query;

    if (dbError) {
      console.error('[getForumTopics] Database error:', dbError);
      return error('Failed to fetch forum topics');
    }

    if (!topics?.length) return success([]);

    const userIds = [...new Set((topics as ForumTopic[]).map((t) => t.user_id).filter(Boolean))] as string[];
    const userMap = await getProfileDisplayMap(userIds);
    const data = (topics as ForumTopic[]).map((t) => ({
      ...t,
      user: t.user_id ? userMap[t.user_id] ?? null : null,
    }));

    return success(data);
  } catch (err) {
    return handleError(err, 'getForumTopics');
  }
}

/**
 * Get a single forum topic by slug
 * Public action - no auth required
 */
export async function getForumTopic(
  categorySlug: string,
  topicSlug: string
): Promise<
  ActionResult<{
    id: string;
    category_id: string;
    user_id: string;
    title: string;
    slug: string;
    content: string;
    is_pinned: boolean;
    is_locked: boolean;
    is_archived: boolean;
    views_count: number;
    replies_count: number;
    last_reply_at: string | null;
    last_reply_by: string | null;
    created_at: string;
    updated_at: string;
    user?: { id: string; username: string | null; avatar_url: string | null };
    category?: { id: string; slug: string; name: string; description: string | null };
  }>
> {
  try {
    const supabase = await createClient();

    // First get the category
    const { data: category, error: categoryError } = await supabase
      .from('forum_categories')
      .select('id')
      .eq('slug', categorySlug)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      return error('Category not found');
    }

    // Then get the topic with category (user from profile_display to avoid leaking email)
    const { data: topicRow, error: dbError } = await supabase
      .from('forum_topics')
      .select(`
        *,
        category:forum_categories!forum_topics_category_id_fkey(id, slug, name, description)
      `)
      .eq('category_id', category.id)
      .eq('slug', topicSlug)
      .eq('is_archived', false)
      .single();

    if (dbError) {
      console.error('[getForumTopic] Database error:', dbError);
      return error('Topic not found');
    }

    if (!topicRow) {
      return error('Topic not found');
    }

    const userMap = await getProfileDisplayMap([(topicRow as { user_id: string }).user_id]);
    const user = (topicRow as { user_id: string }).user_id
      ? userMap[(topicRow as { user_id: string }).user_id] ?? null
      : null;
    const data = { ...topicRow, user, category: (topicRow as { category?: unknown }).category };

    // Increment view count (non-blocking)
    supabase
      .from('forum_topics')
      .update({ views_count: (topicRow as { views_count: number }).views_count + 1 })
      .eq('id', (topicRow as { id: string }).id)
      .then(() => {})
      .catch(console.error);

    return success(data);
  } catch (err) {
    return handleError(err, 'getForumTopic');
  }
}

/**
 * Create a new forum topic
 * Requires authentication, email verification, rate limiting, spam detection
 */
export async function createForumTopic(
  input: CreateForumTopicInput
): Promise<
  ActionResult<{
    id: string;
    category_id: string;
    user_id: string;
    title: string;
    slug: string;
    content: string;
    is_pinned: boolean;
    is_locked: boolean;
    is_archived: boolean;
    views_count: number;
    replies_count: number;
    last_reply_at: string | null;
    last_reply_by: string | null;
    created_at: string;
    updated_at: string;
  }>
> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return error('Authentication required');
    }

    // Check email verification
    if (!user.email_confirmed_at) {
      return error('Email verification required');
    }

    // Validate input
    const parsed = parseInput(createForumTopicSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    // Check rate limit (5 topics per hour)
    const clientIp = await getClientIp();
    const rateLimit = await checkRateLimit(user.id, clientIp, 'create_topic', 5, 3600);
    if (!rateLimit.allowed) {
      return error(`Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.`);
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(parsed.data.content);

    // Check for spam
    const spamCheck = detectSpam(sanitizedContent);
    if (spamCheck.isSpam) {
      return error(`Content rejected: ${spamCheck.reason}`);
    }

    const supabase = await createClient();

    // Create topic
    const { data, error: dbError } = await supabase
      .from('forum_topics')
      .insert({
        category_id: parsed.data.category_id,
        user_id: user.id,
        title: parsed.data.title.trim(),
        slug: parsed.data.slug,
        content: sanitizedContent,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[createForumTopic] Database error:', dbError);
      return error('Failed to create topic');
    }

    // Revalidate paths
    revalidatePath('/forums');
    revalidatePath(`/forums/${parsed.data.category_id}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'createForumTopic');
  }
}

/**
 * Update a forum topic
 * Requires authentication, ownership, time limit
 */
export async function updateForumTopic(
  topicId: string,
  input: UpdateForumTopicInput
): Promise<
  ActionResult<{
    id: string;
    category_id: string;
    user_id: string;
    title: string;
    slug: string;
    content: string;
    is_pinned: boolean;
    is_locked: boolean;
    is_archived: boolean;
    views_count: number;
    replies_count: number;
    last_reply_at: string | null;
    last_reply_by: string | null;
    created_at: string;
    updated_at: string;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('Authentication required');
    }

    const parsed = parseInput(updateForumTopicSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();

    // Get topic to verify ownership
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (!topic) {
      return error('Topic not found');
    }

    if (topic.user_id !== user.id) {
      return error('Not authorized to edit this topic');
    }

    // Check time limit (1 hour)
    const createdAt = new Date(topic.created_at);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (createdAt < oneHourAgo) {
      return error('Edit window has expired');
    }

    // Prepare update
    const updateData: Record<string, unknown> = {};
    if (parsed.data.title) {
      updateData.title = parsed.data.title.trim();
    }
    if (parsed.data.content) {
      updateData.content = sanitizeContent(parsed.data.content);
    }

    const { data, error: dbError } = await supabase
      .from('forum_topics')
      .update(updateData)
      .eq('id', topicId)
      .select()
      .single();

    if (dbError) {
      console.error('[updateForumTopic] Database error:', dbError);
      return error('Failed to update topic');
    }

    revalidatePath('/forums');
    revalidatePath(`/forums/${topic.category_id}/${topic.slug}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'updateForumTopic');
  }
}

// ============================================================================
// Forum Posts
// ============================================================================

/**
 * Get forum posts for a topic
 * Public action - no auth required
 */
export async function getForumPosts(
  filters: GetForumPostsInput
): Promise<
  ActionResult<
    Array<{
      id: string;
      topic_id: string;
      user_id: string;
      content: string;
      is_edited: boolean;
      edited_at: string | null;
      likes_count: number;
      is_solution: boolean;
      parent_post_id: string | null;
      created_at: string;
      updated_at: string;
    }>
  >
> {
  try {
    const parsed = parseInput(getForumPostsSchema, filters);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const { topic_id, page, limit, sort } = parsed.data;
    const supabase = await createClient();

    let query = supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', topic_id);

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'most_liked':
        query = query.order('likes_count', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: posts, error: dbError } = await query;

    if (dbError) {
      console.error('[getForumPosts] Database error:', dbError);
      return error('Failed to fetch forum posts');
    }

    if (!posts?.length) return success([]);

    const userIds = [...new Set((posts as ForumPost[]).map((p) => p.user_id).filter(Boolean))] as string[];
    const userMap = await getProfileDisplayMap(userIds);
    const data = (posts as ForumPost[]).map((p) => ({
      ...p,
      user: p.user_id ? userMap[p.user_id] ?? null : null,
    }));

    return success(data);
  } catch (err) {
    return handleError(err, 'getForumPosts');
  }
}

/**
 * Create a new forum post
 * Requires authentication, email verification, rate limiting, spam detection
 */
export async function createForumPost(
  input: CreateForumPostInput
): Promise<
  ActionResult<{
    id: string;
    topic_id: string;
    user_id: string;
    content: string;
    is_edited: boolean;
    edited_at: string | null;
    likes_count: number;
    is_solution: boolean;
    parent_post_id: string | null;
    created_at: string;
    updated_at: string;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('Authentication required');
    }

    if (!user.email_confirmed_at) {
      return error('Email verification required');
    }

    const parsed = parseInput(createForumPostSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    // Check rate limit (10 posts per 5 minutes)
    const clientIp = await getClientIp();
    const rateLimit = await checkRateLimit(user.id, clientIp, 'create_post', 10, 300);
    if (!rateLimit.allowed) {
      return error(`Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.`);
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(parsed.data.content);

    // Check for spam
    const spamCheck = detectSpam(sanitizedContent);
    if (spamCheck.isSpam) {
      return error(`Content rejected: ${spamCheck.reason}`);
    }

    const supabase = await createClient();

    // Verify topic exists and is not locked
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('id, is_locked, is_archived')
      .eq('id', parsed.data.topic_id)
      .single();

    if (!topic) {
      return error('Topic not found');
    }

    if (topic.is_locked) {
      return error('Topic is locked');
    }

    if (topic.is_archived) {
      return error('Topic is archived');
    }

    // Create post
    const { data, error: dbError } = await supabase
      .from('forum_posts')
      .insert({
        topic_id: parsed.data.topic_id,
        user_id: user.id,
        content: sanitizedContent,
        parent_post_id: parsed.data.parent_post_id || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[createForumPost] Database error:', dbError);
      return error('Failed to create post');
    }

    // Revalidate paths
    revalidatePath('/forums');
    revalidatePath(`/forums/${parsed.data.topic_id}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'createForumPost');
  }
}

/**
 * Update a forum post
 * Requires authentication, ownership, time limit
 */
export async function updateForumPost(
  postId: string,
  input: UpdateForumPostInput
): Promise<
  ActionResult<{
    id: string;
    topic_id: string;
    user_id: string;
    content: string;
    is_edited: boolean;
    edited_at: string | null;
    likes_count: number;
    is_solution: boolean;
    parent_post_id: string | null;
    created_at: string;
    updated_at: string;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('Authentication required');
    }

    const parsed = parseInput(updateForumPostSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();

    // Get post to verify ownership
    const { data: post } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!post) {
      return error('Post not found');
    }

    if (post.user_id !== user.id) {
      return error('Not authorized to edit this post');
    }

    // Check time limit (15 minutes)
    const createdAt = new Date(post.created_at);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (createdAt < fifteenMinutesAgo) {
      return error('Edit window has expired');
    }

    // Update post
    const { data, error: dbError } = await supabase
      .from('forum_posts')
      .update({
        content: sanitizeContent(parsed.data.content),
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (dbError) {
      console.error('[updateForumPost] Database error:', dbError);
      return error('Failed to update post');
    }

    revalidatePath('/forums');
    revalidatePath(`/forums/${post.topic_id}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'updateForumPost');
  }
}

// ============================================================================
// Moderation Actions (Admin/Moderator Only)
// ============================================================================

/**
 * Pin or unpin a topic
 * Requires admin or moderator role
 */
export async function pinTopic(input: PinTopicInput): Promise<ActionResult<boolean>> {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'moderator')) {
      return error('Admin or moderator access required');
    }

    const parsed = parseInput(pinTopicSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('forum_topics')
      .update({ is_pinned: parsed.data.is_pinned })
      .eq('id', parsed.data.topic_id);

    if (dbError) {
      console.error('[pinTopic] Database error:', dbError);
      return error('Failed to pin topic');
    }

    revalidatePath('/forums');
    return success(true);
  } catch (err) {
    return handleError(err, 'pinTopic');
  }
}

/**
 * Lock or unlock a topic
 * Requires admin or moderator role
 */
export async function lockTopic(input: LockTopicInput): Promise<ActionResult<boolean>> {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'moderator')) {
      return error('Admin or moderator access required');
    }

    const parsed = parseInput(lockTopicSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('forum_topics')
      .update({ is_locked: parsed.data.is_locked })
      .eq('id', parsed.data.topic_id);

    if (dbError) {
      console.error('[lockTopic] Database error:', dbError);
      return error('Failed to lock topic');
    }

    revalidatePath('/forums');
    return success(true);
  } catch (err) {
    return handleError(err, 'lockTopic');
  }
}
