/**
 * Populate video_url for placeholder entries using YouTube Data API v3 search.
 * Run from project root (or frontend) with env: NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY.
 * Loads .env.local from cwd or frontend/.env.local when run from root.
 *
 *   npx tsx scripts/videos/populate-from-youtube-api.ts [--dry-run] [--limit=50] [--engine=predator-212-hemi]
 *
 * Quota: 10,000 units/day (default); one search = 100 → ~100 videos/day.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

for (const p of [join(process.cwd(), '.env.local'), join(process.cwd(), 'frontend', '.env.local')]) {
  if (existsSync(p)) {
    readFileSync(p, 'utf8')
      .split('\n')
      .forEach((l) => {
        const m = l.match(/^([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
      });
    break;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

const YT_ID_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const PLACEHOLDER = /^(PLACEHOLDER|EXAMPLE)/i;

function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(YT_ID_REGEX);
  const id = m?.[1];
  if (!id || PLACEHOLDER.test(id)) return null;
  return id;
}

async function youtubeSearchFirst(query: string): Promise<string | null> {
  if (!query?.trim() || !YOUTUBE_API_KEY) return null;
  const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&q=${encodeURIComponent(query.trim())}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || `HTTP ${res.status}`;
      console.warn(`    [YouTube API] ${msg}`);
      return null;
    }
    const id = data?.items?.[0]?.id?.videoId;
    return typeof id === 'string' ? id : null;
  } catch (e) {
    console.warn('    [YouTube API]', e);
    return null;
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1] || '50', 10) : 50;
  const engineSlug = process.argv.find((a) => a.startsWith('--engine='))?.split('=')[1]?.trim();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!YOUTUBE_API_KEY) {
    console.error('Missing YOUTUBE_API_KEY. Get one from Google Cloud → YouTube Data API v3.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let engineId: string | null = null;
  if (engineSlug) {
    const { data: eng, error: eErr } = await supabase.from('engines').select('id').eq('slug', engineSlug).single();
    if (eErr || !eng) {
      console.error(`Engine slug '${engineSlug}' not found.`);
      process.exit(1);
    }
    engineId = eng.id;
  }

  let query = supabase
    .from('videos')
    .select('id, title, engine_id, part_id, video_url')
    .or('video_url.is.null,video_url.ilike.%PLACEHOLDER%,video_url.ilike.%EXAMPLE%')
    .order('id', { ascending: true })
    .limit(limit);

  if (engineId) query = query.eq('engine_id', engineId);
  const { data: videos, error: fetchErr } = await query;

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    process.exit(1);
  }

  const list = videos ?? [];
  console.log(`Found ${list.length} video(s) with placeholder URLs. Limit: ${limit}. Dry run: ${dryRun}.${engineSlug ? ` Engine: ${engineSlug}` : ''}\n`);

  if (list.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  const engineIds = [...new Set(list.map((v) => v.engine_id).filter(Boolean))] as string[];
  const partIds = [...new Set(list.map((v) => v.part_id).filter(Boolean))] as string[];

  const [enginesRes, partsRes] = await Promise.all([
    engineIds.length ? supabase.from('engines').select('id, name').in('id', engineIds) : { data: [] },
    partIds.length ? supabase.from('parts').select('id, name').in('id', partIds) : { data: [] },
  ]);

  const engineMap = new Map((enginesRes.data ?? []).map((e: { id: string; name: string }) => [e.id, e.name]));
  const partMap = new Map((partsRes.data ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));

  const { data: allVideos } = await supabase.from('videos').select('video_url');
  const usedYouTubeIds = new Set<string>();
  for (const row of allVideos ?? []) {
    const id = getYouTubeVideoId(row.video_url);
    if (id) usedYouTubeIds.add(id);
  }

  let filled = 0;
  let skippedDup = 0;
  for (const v of list) {
    const engineName = v.engine_id ? engineMap.get(v.engine_id) : null;
    const partName = v.part_id ? partMap.get(v.part_id) : null;
    let q = [engineName, partName, v.title].filter(Boolean).join(' ').trim();
    if (v.engine_id && q) q += ' go kart';
    if (!q) continue;

    let videoId = await youtubeSearchFirst(q);
    if (!videoId) {
      const fallback = (engineName || partName) ? `${engineName || partName} go kart` : '';
      if (fallback) videoId = await youtubeSearchFirst(fallback);
    }
    if (!videoId && (engineName || partName)) {
      videoId = await youtubeSearchFirst(engineName || partName || '');
    }
    if (!videoId) {
      console.log(`  [skip] ${v.title} — no search result`);
      continue;
    }

    if (usedYouTubeIds.has(videoId)) {
      console.log(`  [skip] ${v.title} — duplicate (already on site)`);
      skippedDup++;
      continue;
    }
    usedYouTubeIds.add(videoId);

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (dryRun) {
      console.log(`  [would update] ${v.title} → ${url}`);
      filled++;
      continue;
    }

    const { error: upErr } = await supabase.from('videos').update({ video_url: url }).eq('id', v.id);
    if (upErr) {
      usedYouTubeIds.delete(videoId);
      console.log(`  [error] ${v.title}: ${upErr.message}`);
    } else {
      console.log(`  [ok] ${v.title} → ${url}`);
      filled++;
    }
  }

  console.log(`\nFilled ${filled} URL(s).${skippedDup > 0 ? ` Skipped ${skippedDup} duplicate(s).` : ''} Run again for more (quota: ~${limit}/day).`);
}

main();
