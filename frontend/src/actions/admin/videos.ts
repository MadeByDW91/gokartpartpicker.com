'use server';

/**
 * Admin server actions for video management
 * All actions require admin or super_admin role
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { 
  createVideoSchema,
  updateVideoSchema,
  videoFiltersSchema,
  reorderVideosSchema,
  bulkDeleteVideosSchema,
  uuidSchema,
  parseInput,
  type CreateVideoInput,
  type UpdateVideoInput,
  type VideoFiltersInput,
  type ReorderVideosInput
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Video } from '@/types/database';
import { requireAdmin } from '../admin';
import { getYouTubeThumbnailUrl, isEmbeddableVideoUrl } from '@/lib/video-utils';
import { youtubeSearchFirst } from '@/lib/youtube-api';

/**
 * Create a new video
 * Requires admin role
 */
export async function createVideo(
  data: CreateVideoInput
): Promise<ActionResult<Video>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Video>;
    }
    const { userId } = authResult as { userId: string };
    
    // Validate input
    const parsed = parseInput(createVideoSchema, data);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    // Auto-fill thumbnail from YouTube video_url when not provided (uses i.ytimg.com/hqdefault)
    let thumbnailUrl = parsed.data.thumbnail_url;
    if (!thumbnailUrl && parsed.data.video_url) {
      thumbnailUrl = getYouTubeThumbnailUrl(parsed.data.video_url) ?? null;
    }
    
    const insertData: Record<string, unknown> = {
      ...parsed.data,
      thumbnail_url: thumbnailUrl,
      created_by: userId,
    };
    
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert(insertData)
      .select()
      .single();
    
    if (dbError) {
      console.error('[createVideo] Database error:', dbError);
      return error('Failed to create video');
    }
    
    // Revalidate relevant paths
    if (parsed.data.engine_id) {
      revalidatePath('/engines');
      revalidatePath(`/engines/[slug]`, 'page');
      revalidatePath(`/admin/engines/${parsed.data.engine_id}/videos`);
    }
    if (parsed.data.part_id) {
      revalidatePath('/parts');
      revalidatePath(`/parts/[slug]`, 'page');
      revalidatePath(`/admin/parts/${parsed.data.part_id}/videos`);
    }
    revalidatePath('/admin/videos');
    
    return success(video);
  } catch (err) {
    return handleError(err, 'createVideo');
  }
}

/**
 * Update an existing video
 * Requires admin role
 */
export async function updateVideo(
  id: string,
  data: Partial<CreateVideoInput>
): Promise<ActionResult<Video>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Video>;
    }
    
    // Validate ID
    const idParsed = parseInput(uuidSchema, id);
    if (!idParsed.success) {
      return error('Invalid video ID');
    }
    
    // Get existing video to merge with update
    const supabase = await createClient();
    const { data: existing, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return error('Video not found');
    }
    
    // Merge existing data with updates
    const mergedData = { ...existing, ...data };
    
    // Validate merged data
    const parsed = parseInput(updateVideoSchema, { id, ...mergedData });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    // Ensure exactly one link (engine_id or part_id)
    if (parsed.data.engine_id !== undefined || parsed.data.part_id !== undefined) {
      const hasEngine = parsed.data.engine_id !== null && parsed.data.engine_id !== undefined;
      const hasPart = parsed.data.part_id !== null && parsed.data.part_id !== undefined;
      
      if (hasEngine && hasPart) {
        return error('Video must be linked to either an engine or a part, not both');
      }
      if (!hasEngine && !hasPart) {
        return error('Video must be linked to either an engine or a part');
      }
    }
    
    // Auto-fill thumbnail from YouTube video_url when missing (e.g. after fixing PLACEHOLDER)
    let thumbnailUrl = parsed.data.thumbnail_url ?? existing.thumbnail_url;
    if (!thumbnailUrl && parsed.data.video_url) {
      thumbnailUrl = getYouTubeThumbnailUrl(parsed.data.video_url) ?? null;
    }
    
    const updateData: Record<string, unknown> = {
      ...parsed.data,
      thumbnail_url: thumbnailUrl,
    };
    
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (dbError) {
      console.error('[updateVideo] Database error:', dbError);
      return error('Failed to update video');
    }
    
    // Revalidate relevant paths
    if (video.engine_id) {
      revalidatePath('/engines');
      revalidatePath(`/engines/[slug]`, 'page');
      revalidatePath(`/admin/engines/${video.engine_id}/videos`);
    }
    if (video.part_id) {
      revalidatePath('/parts');
      revalidatePath(`/parts/[slug]`, 'page');
      revalidatePath(`/admin/parts/${video.part_id}/videos`);
    }
    revalidatePath('/admin/videos');
    revalidatePath(`/admin/videos/${id}`);
    
    return success(video);
  } catch (err) {
    return handleError(err, 'updateVideo');
  }
}

/**
 * Delete a video
 * Requires admin role
 */
export async function deleteVideo(id: string): Promise<ActionResult<{ deleted: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ deleted: true }>;
    }
    
    // Validate ID
    const idParsed = parseInput(uuidSchema, id);
    if (!idParsed.success) {
      return error('Invalid video ID');
    }
    
    const supabase = await createClient();
    
    // Get video to know which paths to revalidate
    const { data: video } = await supabase
      .from('videos')
      .select('engine_id, part_id')
      .eq('id', id)
      .single();
    
    const { error: dbError } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (dbError) {
      console.error('[deleteVideo] Database error:', dbError);
      return error('Failed to delete video');
    }
    
    // Revalidate relevant paths
    if (video?.engine_id) {
      revalidatePath('/engines');
      revalidatePath(`/engines/[slug]`, 'page');
      revalidatePath(`/admin/engines/${video.engine_id}/videos`);
    }
    if (video?.part_id) {
      revalidatePath('/parts');
      revalidatePath(`/parts/[slug]`, 'page');
      revalidatePath(`/admin/parts/${video.part_id}/videos`);
    }
    revalidatePath('/admin/videos');
    
    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteVideo');
  }
}

/**
 * Bulk delete videos by ID. Use for removing unwanted videos in batch.
 * Requires admin role.
 */
export async function bulkDeleteVideos(
  ids: string[]
): Promise<ActionResult<{ deleted: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ deleted: number }>;
    }

    const parsed = parseInput(bulkDeleteVideosSchema, { ids });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('videos')
      .delete()
      .in('id', parsed.data.ids);

    if (dbError) {
      console.error('[bulkDeleteVideos] Database error:', dbError);
      return error('Failed to delete videos');
    }

    revalidatePath('/admin/videos');
    revalidatePath('/engines');
    revalidatePath('/engines/[slug]', 'page');
    revalidatePath('/parts');
    revalidatePath('/parts/[slug]', 'page');

    return success({ deleted: parsed.data.ids.length });
  } catch (err) {
    return handleError(err, 'bulkDeleteVideos');
  }
}

/**
 * Auto-fill thumbnail_url for all videos that have a YouTube video_url but missing thumbnail.
 * Runs the same logic as the DB trigger in bulk. Use after bulk-import or when fixing PLACEHOLDER URLs.
 * Requires admin role.
 */
export async function refreshVideoThumbnails(): Promise<
  ActionResult<{ updated: number; placeholderUrlCount: number }>
> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ updated: number; placeholderUrlCount: number }>;
    }

    const supabase = await createClient();
    const { data: list, error: fetchErr } = await supabase
      .from('videos')
      .select('id, video_url, thumbnail_url');

    if (fetchErr) {
      console.error('[refreshVideoThumbnails] Fetch error:', fetchErr);
      return error('Failed to fetch videos');
    }

    let updated = 0;
    let placeholderUrlCount = 0;
    for (const v of list ?? []) {
      if (!isEmbeddableVideoUrl(v.video_url)) placeholderUrlCount++;
      if (v.thumbnail_url) continue;
      const thumb = getYouTubeThumbnailUrl(v.video_url);
      if (!thumb) continue;
      const { error: upErr } = await supabase
        .from('videos')
        .update({ thumbnail_url: thumb })
        .eq('id', v.id);
      if (!upErr) updated++;
    }

    revalidatePath('/admin/videos');
    revalidatePath('/engines');
    revalidatePath('/engines/[slug]', 'page');
    revalidatePath('/parts');
    revalidatePath('/parts/[slug]', 'page');

    return success({ updated, placeholderUrlCount });
  } catch (err) {
    return handleError(err, 'refreshVideoThumbnails');
  }
}

/**
 * Auto-fill video_url for placeholder entries using YouTube Data API search.
 * For each video with PLACEHOLDER/EXAMPLE (or null) URL, builds a search from title + engine/part name,
 * takes the first YouTube result, and updates video_url. Thumbnails are then set by the DB trigger.
 * Requires: YOUTUBE_API_KEY in .env.local (Google Cloud → YouTube Data API v3). Quota: ~100/day.
 */
export async function fillVideoUrlsFromYouTube(): Promise<
  ActionResult<{ filled: number; remaining: number; limit: number }>
> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ filled: number; remaining: number; limit: number }>;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey?.trim()) {
      return error(
        'YOUTUBE_API_KEY is not set. Add it to .env.local and enable YouTube Data API v3 in Google Cloud. See scripts/videos/README.md.'
      );
    }

    const supabase = await createClient();
    const LIMIT = 50; // ~50 * 100 = 5000 units; safe within 10k/day

    const { data: videos, error: fetchErr } = await supabase
      .from('videos')
      .select('id, title, engine_id, part_id, video_url')
      .or('video_url.is.null,video_url.ilike.%PLACEHOLDER%,video_url.ilike.%EXAMPLE%')
      .limit(LIMIT);

    if (fetchErr) {
      console.error('[fillVideoUrlsFromYouTube] Fetch error:', fetchErr);
      return error('Failed to fetch videos');
    }

    const list = videos ?? [];
    if (list.length === 0) {
      revalidatePath('/admin/videos');
      revalidatePath('/engines');
      revalidatePath('/parts');
      return success({ filled: 0, remaining: 0, limit: LIMIT });
    }

    const engineIds = [...new Set(list.map((v: Video) => v.engine_id).filter(Boolean))] as string[];
    const partIds = [...new Set(list.map((v: Video) => v.part_id).filter(Boolean))] as string[];

    const [enginesRes, partsRes] = await Promise.all([
      engineIds.length > 0
        ? supabase.from('engines').select('id, name').in('id', engineIds)
        : { data: [] as { id: string; name: string }[] },
      partIds.length > 0
        ? supabase.from('parts').select('id, name').in('id', partIds)
        : { data: [] as { id: string; name: string }[] },
    ]);

    const engineMap = new Map((enginesRes.data ?? []).map((e: { id: string; name: string }) => [e.id, e.name]));
    const partMap = new Map((partsRes.data ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));

    let filled = 0;
    for (const v of list) {
      const engineName = v.engine_id ? engineMap.get(v.engine_id) : null;
      const partName = v.part_id ? partMap.get(v.part_id) : null;
      let query = [engineName, partName, v.title].filter(Boolean).join(' ').trim();
      if (v.engine_id && query) query += ' go kart';

      if (!query) continue;

      const videoId = await youtubeSearchFirst(query, apiKey);
      if (!videoId) continue;

      const { error: upErr } = await supabase
        .from('videos')
        .update({ video_url: `https://www.youtube.com/watch?v=${videoId}` })
        .eq('id', v.id);

      if (!upErr) filled++;
    }

    const { count, error: countErr } = await supabase
      .from('videos')
      .select('id', { count: 'exact', head: true })
      .or('video_url.is.null,video_url.ilike.%PLACEHOLDER%,video_url.ilike.%EXAMPLE%');

    const remaining = countErr ? Math.max(0, (list.length > 0 ? 1 : 0) - filled) : (count ?? 0);

    revalidatePath('/admin/videos');
    revalidatePath('/engines');
    revalidatePath('/parts');

    return success({ filled, remaining: countErr ? 0 : remaining, limit: LIMIT });
  } catch (err) {
    return handleError(err, 'fillVideoUrlsFromYouTube');
  }
}

/**
 * Get all videos for admin management
 * Requires admin role
 */
export async function getAdminVideos(
  filters?: Partial<VideoFiltersInput>
): Promise<ActionResult<Video[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Video[]>;
    }
    
    // Validate filters
    const parsed = parseInput(videoFiltersSchema, filters ?? {});
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const {
      engine_id,
      part_id,
      category,
      is_featured,
      is_active,
      search,
      sort,
      order,
      limit,
    } = parsed.data;
    
    const supabase = await createClient();
    
    let query = supabase.from('videos').select('*');
    
    // Apply filters
    if (engine_id) {
      query = query.eq('engine_id', engine_id);
    }
    if (part_id) {
      query = query.eq('part_id', part_id);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (is_featured !== undefined) {
      query = query.eq('is_featured', is_featured);
    }
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });
    if (sort !== 'display_order') {
      query = query.order('display_order', { ascending: true });
    }
    
    // Apply limit
    query = query.limit(limit);
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getAdminVideos] Database error:', dbError);
      return error('Failed to fetch videos');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getAdminVideos');
  }
}

/**
 * Bulk import videos from CSV/JSON
 * Requires admin role
 */
export async function bulkImportVideos(
  videos: CreateVideoInput[]
): Promise<ActionResult<{ imported: number; errors: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ imported: number; errors: number }>;
    }
    const { userId } = authResult as { userId: string };
    
    const supabase = await createClient();
    let imported = 0;
    let errors = 0;
    
    for (const videoData of videos) {
      try {
        // Validate each video
        const parsed = parseInput(createVideoSchema, videoData);
        if (!parsed.success) {
          errors++;
          continue;
        }
        
        // Auto-extract thumbnail if needed
        let thumbnailUrl = parsed.data.thumbnail_url;
        if (!thumbnailUrl && parsed.data.video_url) {
          const extracted = getYouTubeThumbnailUrl(parsed.data.video_url);
          if (extracted) {
            thumbnailUrl = extracted;
          }
        }
        
        const insertData: Record<string, unknown> = {
          ...parsed.data,
          thumbnail_url: thumbnailUrl,
          created_by: userId,
        };
        
        const { error: dbError } = await supabase
          .from('videos')
          .insert(insertData);
        
        if (dbError) {
          console.error('[bulkImportVideos] Error importing video:', dbError);
          errors++;
        } else {
          imported++;
        }
      } catch (err) {
        console.error('[bulkImportVideos] Error processing video:', err);
        errors++;
      }
    }
    
    // Revalidate paths
    revalidatePath('/admin/videos');
    revalidatePath('/engines');
    revalidatePath('/parts');
    
    return success({ imported, errors });
  } catch (err) {
    return handleError(err, 'bulkImportVideos');
  }
}

/**
 * Reorder videos within a category
 * Requires admin role
 */
export async function reorderVideos(
  videoIds: string[],
  engineId?: string,
  partId?: string
): Promise<ActionResult<Video[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Video[]>;
    }
    
    // Validate input
    const parsed = parseInput(reorderVideosSchema, { videoIds, engineId, partId });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    // Update display_order for each video
    const updates = parsed.data.videoIds.map((id, index) =>
      supabase
        .from('videos')
        .update({ display_order: index })
        .eq('id', id)
    );
    
    await Promise.all(updates);
    
    // Fetch updated videos
    let query = supabase.from('videos').select('*').in('id', parsed.data.videoIds);
    
    if (parsed.data.engineId) {
      query = query.eq('engine_id', parsed.data.engineId);
    }
    if (parsed.data.partId) {
      query = query.eq('part_id', parsed.data.partId);
    }
    
    const { data, error: dbError } = await query.order('display_order', { ascending: true });
    
    if (dbError) {
      console.error('[reorderVideos] Database error:', dbError);
      return error('Failed to reorder videos');
    }
    
    // Revalidate paths
    if (parsed.data.engineId) {
      revalidatePath('/engines');
      revalidatePath(`/engines/[slug]`, 'page');
      revalidatePath(`/admin/engines/${parsed.data.engineId}/videos`);
    }
    if (parsed.data.partId) {
      revalidatePath('/parts');
      revalidatePath(`/parts/[slug]`, 'page');
      revalidatePath(`/admin/parts/${parsed.data.partId}/videos`);
    }
    revalidatePath('/admin/videos');
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'reorderVideos');
  }
}
