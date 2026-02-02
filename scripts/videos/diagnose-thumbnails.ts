/**
 * Diagnose why video thumbnails aren't showing.
 * Checks: placeholder URLs, thumbnail_url in DB, derivation logic.
 * Run: npx tsx scripts/videos/diagnose-thumbnails.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test thumbnail derivation
const YT_ID_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const PLACEHOLDER_PATTERN = /^(PLACEHOLDER|EXAMPLE)/i;

function getYouTubeThumbnailUrl(videoUrl: string | null | undefined): string | null {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const m = videoUrl.match(YT_ID_REGEX);
  const id = m?.[1];
  if (!id || PLACEHOLDER_PATTERN.test(id)) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

async function main() {
  console.log('🔍 Diagnosing video thumbnails...\n');

  const { data: videos, error } = await supabase
    .from('videos')
    .select('id, title, video_url, thumbnail_url, engine_id, part_id')
    .eq('is_active', true)
    .limit(100);

  if (error) {
    console.error('❌ Error fetching videos:', error);
    process.exit(1);
  }

  const list = videos ?? [];
  console.log(`📊 Total active videos: ${list.length}\n`);

  let hasThumbnailInDb = 0;
  let hasPlaceholderUrl = 0;
  let hasRealUrl = 0;
  let canDeriveThumb = 0;
  let wouldShowThumb = 0;
  const samples: Array<{ title: string; video_url: string; thumbnail_url: string | null; canDerive: boolean; wouldShow: boolean }> = [];

  for (const v of list) {
    const isPlaceholder = v.video_url?.includes('PLACEHOLDER') || v.video_url?.includes('EXAMPLE') || !v.video_url;
    const derived = getYouTubeThumbnailUrl(v.video_url);
    const finalThumb = v.thumbnail_url || derived;
    const wouldShow = !!finalThumb;

    if (v.thumbnail_url) hasThumbnailInDb++;
    if (isPlaceholder) hasPlaceholderUrl++;
    if (!isPlaceholder && v.video_url) hasRealUrl++;
    if (derived) canDeriveThumb++;
    if (wouldShow) wouldShowThumb++;

    if (samples.length < 5) {
      samples.push({
        title: v.title,
        video_url: v.video_url || '(null)',
        thumbnail_url: v.thumbnail_url || '(null)',
        canDerive: !!derived,
        wouldShow,
      });
    }
  }

  console.log('📈 Summary:');
  console.log(`  ✅ Has thumbnail_url in DB: ${hasThumbnailInDb} (${((hasThumbnailInDb / list.length) * 100).toFixed(1)}%)`);
  console.log(`  🔗 Has real YouTube URL (not placeholder): ${hasRealUrl} (${((hasRealUrl / list.length) * 100).toFixed(1)}%)`);
  console.log(`  ⚠️  Has placeholder URL: ${hasPlaceholderUrl} (${((hasPlaceholderUrl / list.length) * 100).toFixed(1)}%)`);
  console.log(`  🎨 Can derive thumbnail from video_url: ${canDeriveThumb} (${((canDeriveThumb / list.length) * 100).toFixed(1)}%)`);
  console.log(`  👁️  Would show thumbnail (DB or derived): ${wouldShowThumb} (${((wouldShowThumb / list.length) * 100).toFixed(1)}%)\n`);

  console.log('📝 Sample videos:');
  samples.forEach((s, i) => {
    console.log(`\n  ${i + 1}. "${s.title}"`);
    console.log(`     video_url: ${s.video_url.substring(0, 60)}${s.video_url.length > 60 ? '...' : ''}`);
    console.log(`     thumbnail_url: ${s.thumbnail_url}`);
    console.log(`     Can derive: ${s.canDerive ? '✅' : '❌'}`);
    console.log(`     Would show: ${s.wouldShow ? '✅' : '❌'}`);
  });

  console.log('\n💡 Recommendations:');
  if (hasPlaceholderUrl > 0) {
    console.log(`  ⚠️  ${hasPlaceholderUrl} videos have placeholder URLs. Run "Auto-fill URLs from YouTube" in Admin → Videos.`);
  }
  if (hasRealUrl > 0 && hasThumbnailInDb < hasRealUrl) {
    console.log(`  🔧 ${hasRealUrl - hasThumbnailInDb} videos have real URLs but no thumbnail_url. Run "Auto-fill thumbnails" in Admin → Videos.`);
  }
  if (wouldShowThumb === 0 && list.length > 0) {
    console.log(`  🚨 CRITICAL: No videos would show thumbnails. All have placeholder URLs or non-YouTube URLs.`);
  }
  if (wouldShowThumb > 0 && wouldShowThumb < list.length) {
    console.log(`  ✅ ${wouldShowThumb} videos should show thumbnails. If they don't, check browser console for img load errors.`);
  }
}

main();
