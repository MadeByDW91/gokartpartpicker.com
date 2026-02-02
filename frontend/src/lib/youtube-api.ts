/**
 * YouTube Data API v3 - search helper
 * Used to auto-fill video_url for placeholder entries.
 * Requires YOUTUBE_API_KEY in env. Get one at: Google Cloud Console → APIs & Services → YouTube Data API v3.
 * Quota: 10,000 units/day (default); one search.list = 100 units → ~100 videos/day.
 */

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  channelId: string;
  publishedAt: string;
  videoUrl: string;
}

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

/**
 * Search YouTube and return multiple results with full details.
 * @param query - Search query (e.g. "Predator 212 Hemi Unboxing go kart")
 * @param apiKey - YOUTUBE_API_KEY
 * @param maxResults - Maximum number of results to return (default: 10, max: 50)
 */
export async function youtubeSearch(
  query: string,
  apiKey: string,
  maxResults: number = 10
): Promise<YouTubeSearchResult[]> {
  if (!query?.trim() || !apiKey) return [];

  const results: YouTubeSearchResult[] = [];
  const limit = Math.min(Math.max(1, maxResults), 50); // Clamp between 1 and 50

  const url = `${SEARCH_URL}?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query.trim())}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.warn('[youtubeSearch] API error:', data?.error?.message ?? res.status);
      return [];
    }

    for (const item of data.items || []) {
      const videoId = item.id?.videoId;
      if (!videoId || typeof videoId !== 'string') continue;

      const snippet = item.snippet;
      const thumbnail = snippet.thumbnails?.high?.url || 
                       snippet.thumbnails?.medium?.url || 
                       `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      results.push({
        videoId,
        title: snippet.title || 'Untitled',
        description: snippet.description || '',
        thumbnailUrl: thumbnail,
        channelName: snippet.channelTitle || 'Unknown Channel',
        channelId: snippet.channelId || '',
        publishedAt: snippet.publishedAt || '',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    return results;
  } catch (e) {
    console.warn('[youtubeSearch]', e);
    return [];
  }
}
