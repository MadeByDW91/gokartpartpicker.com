'use server';

/**
 * Auto Video Linker Server Actions
 * Automatically finds and links relevant videos to parts based on name, brand, and category
 */

import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { createVideo } from './videos';
import type { PartCategory } from '@/types/database';

interface VideoSearchResult {
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  channelName: string | null;
  channelUrl: string | null;
  durationSeconds: number | null;
  publishedDate: string | null;
  category: 'installation' | 'tutorial' | 'review' | 'unboxing' | 'maintenance' | 'modification' | 'tips';
  relevanceScore: number;
}

interface EngineCompatibilitySuggestion {
  engineId: string;
  engineName: string;
  engineSlug: string;
  compatibilityReason: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Search YouTube for videos related to a part
 * Uses part name, brand, and category to build search queries
 */
export async function searchVideosForPart(
  partId: string,
  partName: string,
  partBrand: string | null,
  partCategory: PartCategory
): Promise<ActionResult<VideoSearchResult[]>> {
  try {
    await requireAdmin();

    // Build search queries based on part information
    const searchQueries = buildSearchQueries(partName, partBrand, partCategory);
    
    // For now, return suggestions based on common patterns
    // In production, you would integrate with YouTube Data API v3
    const suggestions: VideoSearchResult[] = [];

    // Generate video suggestions based on category and name
    for (const query of searchQueries) {
      // This is a placeholder - in production, call YouTube API
      // For now, we'll create structured suggestions that admin can review
      const category = detectVideoCategory(query, partCategory);
      
      suggestions.push({
        title: `${partName} ${category === 'installation' ? 'Installation Guide' : category === 'review' ? 'Review' : 'Tutorial'}`,
        videoUrl: '', // Will be filled by admin or YouTube API
        thumbnailUrl: null,
        channelName: null,
        channelUrl: null,
        durationSeconds: null,
        publishedDate: null,
        category,
        relevanceScore: 0.8, // Default relevance
      });
    }

    // Limit to top 5-10 most relevant
    return success(suggestions.slice(0, 10));
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to search videos');
  }
}

/**
 * Build search queries from part information
 */
function buildSearchQueries(
  partName: string,
  partBrand: string | null,
  partCategory: PartCategory
): string[] {
  const queries: string[] = [];
  const categoryLabel = getCategoryLabel(partCategory);

  // Query 1: Full part name
  queries.push(`${partName} go kart`);

  // Query 2: Brand + part name
  if (partBrand) {
    queries.push(`${partBrand} ${partName} go kart`);
  }

  // Query 3: Category + part name
  queries.push(`${categoryLabel} ${partName} go kart`);

  // Query 4: Installation specific
  queries.push(`how to install ${partName} go kart`);

  // Query 5: Brand + category
  if (partBrand) {
    queries.push(`${partBrand} ${categoryLabel} go kart installation`);
  }

  return queries;
}

/**
 * Detect video category from search query and part category
 */
function detectVideoCategory(
  query: string,
  partCategory: PartCategory
): VideoSearchResult['category'] {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('install') || lowerQuery.includes('setup')) {
    return 'installation';
  }
  if (lowerQuery.includes('review') || lowerQuery.includes('test')) {
    return 'review';
  }
  if (lowerQuery.includes('unbox') || lowerQuery.includes('unboxing')) {
    return 'unboxing';
  }
  if (lowerQuery.includes('maintain') || lowerQuery.includes('service')) {
    return 'maintenance';
  }
  if (lowerQuery.includes('mod') || lowerQuery.includes('upgrade')) {
    return 'modification';
  }
  if (lowerQuery.includes('tip') || lowerQuery.includes('trick')) {
    return 'tips';
  }

  // Default based on part category
  if (partCategory === 'clutch' || partCategory === 'torque_converter') {
    return 'installation';
  }

  return 'tutorial';
}

/**
 * Get category label for search queries
 */
function getCategoryLabel(category: PartCategory): string {
  const labels: Record<PartCategory, string> = {
    clutch: 'clutch',
    torque_converter: 'torque converter',
    chain: 'chain',
    sprocket: 'sprocket',
    axle: 'axle',
    wheel: 'wheel',
    tire: 'tire',
    tire_front: 'front tire',
    tire_rear: 'rear tire',
    brake: 'brake',
    throttle: 'throttle',
    pedals: 'pedals',
    exhaust: 'exhaust',
    air_filter: 'air filter',
    carburetor: 'carburetor',
    ignition: 'ignition',
    camshaft: 'camshaft',
    valve_spring: 'valve spring',
    flywheel: 'flywheel',
    connecting_rod: 'connecting rod',
    piston: 'piston',
    crankshaft: 'crankshaft',
    oil_system: 'oil system',
    header: 'header',
    fuel_system: 'fuel system',
    gasket: 'gasket',
    frame: 'frame',
    hardware: 'hardware',
    other: 'other',
    // EV-specific categories
    battery: 'battery',
    motor_controller: 'motor controller',
    bms: 'BMS',
    charger: 'charger',
    throttle_controller: 'throttle controller',
    voltage_converter: 'voltage converter',
    battery_mount: 'battery mount',
    wiring_harness: 'wiring harness',
    fuse_kill_switch: 'fuse kill switch',
  };
  return labels[category] || category;
}

/**
 * Auto-link videos to a part after creation
 * Creates video records with suggested videos that admin can review
 */
export async function autoLinkVideosToPart(
  partId: string,
  partName: string,
  partBrand: string | null,
  partCategory: PartCategory,
  videoUrls: string[] // Admin-provided or API-fetched video URLs
): Promise<ActionResult<{ linked: number; failed: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    let linked = 0;
    let failed = 0;

    // Link each video URL to the part
    for (const videoUrl of videoUrls) {
      if (!videoUrl || !videoUrl.trim()) continue;

      // Extract video info from URL (YouTube, Vimeo, etc.)
      const videoInfo = extractVideoInfo(videoUrl);

      const result = await createVideo({
        title: videoInfo.title || `${partName} Video`,
        description: `Video for ${partName}${partBrand ? ` by ${partBrand}` : ''}`,
        video_url: videoUrl,
        thumbnail_url: videoInfo.thumbnailUrl,
        duration_seconds: videoInfo.durationSeconds,
        category: 'tutorial', // Default, can be updated
        language: 'en',
        part_id: partId,
        engine_id: null,
        channel_name: videoInfo.channelName,
        channel_url: videoInfo.channelUrl,
        published_date: videoInfo.publishedDate ? new Date(videoInfo.publishedDate) : null,
        is_active: true,
        is_featured: false,
        display_order: linked,
      });

      if (result.success) {
        linked++;
      } else {
        failed++;
      }
    }

    return success({ linked, failed });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to link videos');
  }
}

/**
 * Extract video information from URL
 */
function extractVideoInfo(videoUrl: string): {
  title: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  channelName: string | null;
  channelUrl: string | null;
  publishedDate: string | null;
} {
  // YouTube URL patterns
  const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      title: null, // Would need YouTube API to fetch
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      durationSeconds: null, // Would need YouTube API
      channelName: null, // Would need YouTube API
      channelUrl: null, // Would need YouTube API
      publishedDate: null, // Would need YouTube API
    };
  }

  // Vimeo URL pattern
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      title: null,
      thumbnailUrl: null,
      durationSeconds: null,
      channelName: null,
      channelUrl: null,
      publishedDate: null,
    };
  }

  return {
    title: null,
    thumbnailUrl: null,
    durationSeconds: null,
    channelName: null,
    channelUrl: null,
    publishedDate: null,
  };
}

/**
 * Auto-search and add videos for a part using YouTube API
 * Searches YouTube for relevant videos and automatically creates video records
 */
export async function autoSearchAndAddVideosForPart(
  partId: string,
  partName: string,
  partBrand: string | null,
  partCategory: PartCategory,
  maxVideos: number = 5
): Promise<ActionResult<{ added: number; searched: number; errors: string[] }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Check if YouTube API key is configured
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      return error('YouTube API key not configured. Set YOUTUBE_API_KEY in environment variables.');
    }

    // Build search queries
    const searchQueries = buildSearchQueries(partName, partBrand, partCategory);
    
    const added: string[] = [];
    const errors: string[] = [];
    let searched = 0;

    // Search for videos using YouTube API
    for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to avoid quota issues
      if (added.length >= maxVideos) break;

      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${Math.min(3, maxVideos - added.length)}&q=${encodeURIComponent(query)}&key=${youtubeApiKey}`;
        
        const response = await fetch(searchUrl);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 403) {
            errors.push(`YouTube API quota exceeded or invalid key`);
            break;
          }
          errors.push(`YouTube API error: ${errorData.error?.message || response.statusText}`);
          continue;
        }

        const data = await response.json();
        searched += data.items?.length || 0;

        // Process each video result
        for (const item of data.items || []) {
          if (added.length >= maxVideos) break;

          const videoId = item.id?.videoId;
          if (!videoId) continue;

          const snippet = item.snippet;
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const thumbnailUrl = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          
          // Detect video category
          const videoCategory = detectVideoCategory(query, partCategory);

          // Create video record
          const createResult = await createVideo({
            title: snippet.title || `${partName} Video`,
            description: snippet.description || `Video for ${partName}${partBrand ? ` by ${partBrand}` : ''}`,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            duration_seconds: null, // Would need video details API call
            category: videoCategory,
            language: snippet.defaultLanguage || 'en',
            part_id: partId,
            engine_id: null,
            channel_name: snippet.channelTitle || null,
            channel_url: snippet.channelId ? `https://www.youtube.com/channel/${snippet.channelId}` : null,
            published_date: snippet.publishedAt ? new Date(snippet.publishedAt) : null,
            is_active: true,
            is_featured: added.length === 0, // First video is featured
            display_order: added.length,
          });

          if (createResult.success) {
            added.push(videoUrl);
          } else {
            errors.push(`Failed to create video: ${createResult.error}`);
          }
        }
      } catch (err) {
        errors.push(`Error searching YouTube: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return success({ 
      added: added.length, 
      searched,
      errors: errors.slice(0, 5) // Limit error messages
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to auto-add videos');
  }
}

/**
 * Suggest engine compatibility for a part based on specifications
 */
export async function suggestEngineCompatibility(
  partId: string,
  partCategory: PartCategory,
  partSpecifications: Record<string, any>
): Promise<ActionResult<EngineCompatibilitySuggestion[]>> {
  try {
    await requireAdmin();

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Get all active engines
    const { data: engines, error: enginesError } = await supabase
      .from('engines')
      .select('id, name, slug, shaft_diameter, displacement_cc, brand')
      .eq('is_active', true);

    if (enginesError || !engines) {
      return error('Failed to fetch engines');
    }

    const suggestions: EngineCompatibilitySuggestion[] = [];

    // Compatibility logic based on part category
    if (partCategory === 'clutch' || partCategory === 'torque_converter') {
      // Match by shaft diameter (bore_diameter or bore_in)
      const boreDiameter = partSpecifications?.bore_diameter || partSpecifications?.bore_in;
      
      if (boreDiameter && typeof boreDiameter === 'number') {
        for (const engine of engines) {
          if (engine.shaft_diameter && typeof engine.shaft_diameter === 'number') {
            const diff = Math.abs(engine.shaft_diameter - boreDiameter);
            if (diff < 0.01) {
              suggestions.push({
                engineId: engine.id,
                engineName: engine.name,
                engineSlug: engine.slug,
                compatibilityReason: `Shaft diameter matches: ${boreDiameter}"`,
                confidence: 'high',
              });
            } else if (diff < 0.05) {
              suggestions.push({
                engineId: engine.id,
                engineName: engine.name,
                engineSlug: engine.slug,
                compatibilityReason: `Shaft diameter close: ${engine.shaft_diameter}" vs ${boreDiameter}"`,
                confidence: 'medium',
              });
            }
          }
        }
      }
    } else if (partCategory === 'chain') {
      // Match by chain size
      const chainSize = partSpecifications?.chain_size || partSpecifications?.size;
      
      if (chainSize) {
        // Most go-kart engines use #35 or #40 chain
        // This is a simplified check - you could add chain_size to engine specs
        for (const engine of engines) {
          suggestions.push({
            engineId: engine.id,
            engineName: engine.name,
            engineSlug: engine.slug,
            compatibilityReason: `Compatible with ${chainSize} chain (common for go-karts)`,
            confidence: 'medium',
          });
        }
      }
    } else if (partCategory === 'sprocket') {
      // Match by chain size and potentially tooth count
      const chainSize = partSpecifications?.chain_size || partSpecifications?.size;
      
      if (chainSize) {
        for (const engine of engines) {
          suggestions.push({
            engineId: engine.id,
            engineName: engine.name,
            engineSlug: engine.slug,
            compatibilityReason: `Compatible with ${chainSize} chain sprockets`,
            confidence: 'medium',
          });
        }
      }
    } else {
      // Universal parts or parts that fit most engines
      for (const engine of engines) {
        suggestions.push({
          engineId: engine.id,
          engineName: engine.name,
          engineSlug: engine.slug,
          compatibilityReason: 'Universal compatibility (verify fitment)',
          confidence: 'low',
        });
      }
    }

    // Sort by confidence (high first)
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    suggestions.sort((a, b) => confidenceOrder[b.confidence] - confidenceOrder[a.confidence]);

    // Limit to top 10 suggestions
    return success(suggestions.slice(0, 10));
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to suggest compatibility');
  }
}
