'use server';

/**
 * Server actions for video operations
 * Public actions - no auth required
 */

import { createClient } from '@/lib/supabase/server';
import { 
  getEngineVideosSchema,
  getPartVideosSchema,
  getFeaturedVideosSchema,
  parseInput,
  type GetEngineVideosInput,
  type GetPartVideosInput,
  type GetFeaturedVideosInput
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Video } from '@/types/database';
import { getYouTubeThumbnailUrl, isEmbeddableVideoUrl } from '@/lib/video-utils';

function enrichThumbnails(list: Video[]): Video[] {
  return list.map((v) => ({
    ...v,
    thumbnail_url: v.thumbnail_url ?? getYouTubeThumbnailUrl(v.video_url) ?? null,
  }));
}

/**
 * Filter out videos with placeholder URLs or missing embeddable URLs.
 * Only show videos that can actually be played on the live site.
 */
function filterPlaceholderVideos(list: Video[]): Video[] {
  return list.filter((v) => {
    // Must have a video_url
    if (!v.video_url) return false;
    // Must be embeddable (not a placeholder)
    return isEmbeddableVideoUrl(v.video_url);
  });
}

/**
 * Get videos for an engine
 * Public action - no auth required
 */
export async function getEngineVideos(
  engineId: string,
  category?: string
): Promise<ActionResult<Video[]>> {
  try {
    const parsed = parseInput(getEngineVideosSchema, { engineId, category });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    let query = supabase
      .from('videos')
      .select('*')
      .eq('engine_id', engineId)
      .eq('is_active', true);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    query = query
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getEngineVideos] Database error:', dbError);
      return error('Failed to fetch engine videos');
    }
    
    const videos = data ?? [];
    const enriched = enrichThumbnails(videos);
    const filtered = filterPlaceholderVideos(enriched);
    
    return success(filtered);
  } catch (err) {
    return handleError(err, 'getEngineVideos');
  }
}

/**
 * Get videos for a part
 * Public action - no auth required
 */
export async function getPartVideos(
  partId: string,
  category?: string
): Promise<ActionResult<Video[]>> {
  try {
    const parsed = parseInput(getPartVideosSchema, { partId, category });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    let query = supabase
      .from('videos')
      .select('*')
      .eq('part_id', partId)
      .eq('is_active', true);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    query = query
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getPartVideos] Database error:', dbError);
      return error('Failed to fetch part videos');
    }
    
    return success(enrichThumbnails(data ?? []));
  } catch (err) {
    return handleError(err, 'getPartVideos');
  }
}

/**
 * Get featured videos for an engine
 * Public action - no auth required
 */
export async function getFeaturedEngineVideos(
  engineId: string,
  limit: number = 5
): Promise<ActionResult<Video[]>> {
  try {
    const parsed = parseInput(getFeaturedVideosSchema, { engineId, limit });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('engine_id', engineId)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (dbError) {
      console.error('[getFeaturedEngineVideos] Database error:', dbError);
      return error('Failed to fetch featured engine videos');
    }
    
    const videos = data ?? [];
    const enriched = enrichThumbnails(videos);
    const filtered = filterPlaceholderVideos(enriched);
    
    return success(filtered);
  } catch (err) {
    return handleError(err, 'getFeaturedEngineVideos');
  }
}

/**
 * Get featured videos for a part
 * Public action - no auth required
 */
export async function getFeaturedPartVideos(
  partId: string,
  limit: number = 5
): Promise<ActionResult<Video[]>> {
  try {
    const parsed = parseInput(getFeaturedVideosSchema, { partId, limit });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('part_id', partId)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (dbError) {
      console.error('[getFeaturedPartVideos] Database error:', dbError);
      return error('Failed to fetch featured part videos');
    }
    
    const videos = data ?? [];
    const enriched = enrichThumbnails(videos);
    const filtered = filterPlaceholderVideos(enriched);
    
    return success(filtered);
  } catch (err) {
    return handleError(err, 'getFeaturedPartVideos');
  }
}

/**
 * Get all active videos with optional filters
 * Public action - no auth required
 */
export async function getAllVideos(filters?: {
  category?: string;
  engine_id?: string;
  part_id?: string;
  is_featured?: boolean;
  limit?: number;
}): Promise<ActionResult<Video[]>> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('videos')
      .select(`
        *,
        engine:engines(*),
        part:parts(*)
      `)
      .eq('is_active', true);
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.engine_id) {
      query = query.eq('engine_id', filters.engine_id);
    }
    if (filters?.part_id) {
      query = query.eq('part_id', filters.part_id);
    }
    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    
    query = query
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getAllVideos] Database error:', dbError);
      return error('Failed to fetch videos');
    }
    
    const videos = data ?? [];
    const enriched = enrichThumbnails(videos);
    const filtered = filterPlaceholderVideos(enriched);
    
    return success(filtered);
  } catch (err) {
    return handleError(err, 'getAllVideos');
  }
}
