const YT_ID_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const PLACEHOLDER_PATTERN = /^(PLACEHOLDER|EXAMPLE)/i;

/**
 * Derive YouTube thumbnail URL from video_url when thumbnail_url is missing.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID.
 * Uses i.ytimg.com (YouTube's CDN). mqdefault (320x180) is more reliable than
 * hqdefault for older/short videos. Returns null for placeholders or non-YouTube.
 */
export function getYouTubeThumbnailUrl(
  videoUrl: string | null | undefined
): string | null {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const m = videoUrl.match(YT_ID_REGEX);
  const id = m?.[1];
  if (!id || PLACEHOLDER_PATTERN.test(id)) return null;
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

/**
 * Whether the video_url can be embedded (is not a placeholder).
 * YouTube URLs with PLACEHOLDER, PLACEHOLDER1, EXAMPLE_* etc. show "Video unavailable";
 * treat those as not embeddable and show a friendly message instead.
 */
export function isEmbeddableVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const m = url.match(YT_ID_REGEX);
  if (m && PLACEHOLDER_PATTERN.test(m[1])) return false;
  return true;
}
