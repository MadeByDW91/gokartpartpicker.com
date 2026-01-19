/**
 * YouTube Data API v3 - search helper
 * Used to auto-fill video_url for placeholder entries.
 * Requires YOUTUBE_API_KEY in env. Get one at: Google Cloud Console → APIs & Services → YouTube Data API v3.
 * Quota: 10,000 units/day (default); one search.list = 100 units → ~100 videos/day.
 */

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Search YouTube and return the first video ID, or null.
 * @param query - Search query (e.g. "Predator 212 Hemi Unboxing go kart")
 * @param apiKey - YOUTUBE_API_KEY
 */
export async function youtubeSearchFirst(
  query: string,
  apiKey: string
): Promise<string | null> {
  if (!query?.trim() || !apiKey) return null;

  const url = `${SEARCH_URL}?part=id&type=video&maxResults=1&q=${encodeURIComponent(query.trim())}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      // 403 quota exceeded, invalid key, etc.
      console.warn('[youtubeSearchFirst] API error:', data?.error?.message ?? res.status);
      return null;
    }

    const id = data?.items?.[0]?.id?.videoId;
    return typeof id === 'string' ? id : null;
  } catch (e) {
    console.warn('[youtubeSearchFirst]', e);
    return null;
  }
}
