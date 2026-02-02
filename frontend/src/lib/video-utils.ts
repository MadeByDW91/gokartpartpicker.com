// watch, embed, shorts, youtu.be
const YT_ID_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const PLACEHOLDER_PATTERN = /^(PLACEHOLDER|EXAMPLE)/i;

/**
 * Extract YouTube video ID from a URL, or null if not a valid YouTube URL.
 * Used for deduplication (one video per YouTube ID on the site).
 */
export function getYouTubeVideoId(
  videoUrl: string | null | undefined
): string | null {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const m = videoUrl.match(YT_ID_REGEX);
  const id = m?.[1];
  if (!id || PLACEHOLDER_PATTERN.test(id)) return null;
  return id;
}

/**
 * Derive YouTube thumbnail URL from video_url when thumbnail_url is missing.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID.
 * Uses i.ytimg.com (YouTube's CDN). hqdefault (480x360) first; VideoCard falls back to
 * mqdefault then default on load error. Returns null for placeholders or non-YouTube.
 */
export function getYouTubeThumbnailUrl(
  videoUrl: string | null | undefined
): string | null {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const m = videoUrl.match(YT_ID_REGEX);
  const id = m?.[1];
  if (!id || PLACEHOLDER_PATTERN.test(id)) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Whether the video_url can be embedded (is not a placeholder and is a valid YouTube/Vimeo URL).
 * YouTube URLs with PLACEHOLDER, PLACEHOLDER1, EXAMPLE_* etc. show "Video unavailable";
 * treat those as not embeddable and show a friendly message instead.
 * Also validates that the URL is actually a YouTube or Vimeo URL format.
 */
export function isEmbeddableVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for placeholder pattern in the URL itself (e.g., "PLACEHOLDER", "EXAMPLE_123")
  if (PLACEHOLDER_PATTERN.test(url)) return false;
  
  // Check for YouTube URLs with placeholder IDs
  const m = url.match(YT_ID_REGEX);
  if (m && PLACEHOLDER_PATTERN.test(m[1])) return false;
  
  // Must be a valid YouTube or Vimeo URL format
  const isYouTube = /youtube\.com|youtu\.be/i.test(url);
  const isVimeo = /vimeo\.com/i.test(url);
  const isDirectVideo = /\.(mp4|webm|ogg)$/i.test(url);
  
  // Only return true if it's a valid video URL format
  return isYouTube || isVimeo || isDirectVideo;
}
