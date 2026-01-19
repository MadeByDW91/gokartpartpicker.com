/**
 * Video Import Script
 * 
 * Helps format and import videos from CSV or JSON data
 * Can be used to prepare video data for bulk import via admin panel
 */

import * as fs from 'fs';
import * as path from 'path';

interface VideoData {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  category: 'unboxing' | 'installation' | 'maintenance' | 'modification' | 'troubleshooting' | 'tutorial' | 'review' | 'tips';
  engine_slug?: string; // Use slug to find engine
  part_slug?: string; // Use slug to find part
  channel_name?: string;
  channel_url?: string;
  published_date?: string; // YYYY-MM-DD format
  language?: string;
  is_featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Validate video URL
 */
function validateVideoUrl(url: string): { valid: boolean; error?: string } {
  const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/;
  const vimeoPattern = /^(https?:\/\/)?(www\.)?vimeo\.com/;
  const directPattern = /^https?:\/\/.+\.(mp4|webm|ogg)/;
  
  if (youtubePattern.test(url) || vimeoPattern.test(url) || directPattern.test(url)) {
    return { valid: true };
  }
  
  return { valid: false, error: 'URL must be from YouTube, Vimeo, or a direct video file' };
}

/**
 * Format duration from MM:SS or seconds to seconds
 */
function parseDuration(input: string | number): number | null {
  if (typeof input === 'number') {
    return input > 0 ? input : null;
  }
  
  if (typeof input === 'string') {
    // MM:SS format
    if (input.includes(':')) {
      const [mins, secs] = input.split(':').map(Number);
      if (!isNaN(mins) && !isNaN(secs)) {
        return mins * 60 + secs;
      }
    }
    // Just seconds
    const seconds = parseInt(input, 10);
    if (!isNaN(seconds) && seconds > 0) {
      return seconds;
    }
  }
  
  return null;
}

/**
 * Process video data and auto-generate thumbnail if YouTube URL
 */
function processVideoData(data: VideoData): VideoData & { errors?: string[] } {
  const errors: string[] = [];
  const processed: VideoData = { ...data };
  
  // Validate URL
  const urlValidation = validateVideoUrl(data.video_url);
  if (!urlValidation.valid) {
    errors.push(urlValidation.error || 'Invalid video URL');
  }
  
  // Auto-extract YouTube thumbnail
  if (!processed.thumbnail_url && data.video_url) {
    const videoId = extractYouTubeVideoId(data.video_url);
    if (videoId) {
      processed.thumbnail_url = getYouTubeThumbnail(videoId);
    }
  }
  
  // Process duration
  if (data.duration_seconds) {
    const duration = parseDuration(data.duration_seconds);
    if (duration) {
      processed.duration_seconds = duration;
    } else {
      errors.push('Invalid duration format (use MM:SS or seconds)');
    }
  }
  
  // Validate category
  const validCategories = ['unboxing', 'installation', 'maintenance', 'modification', 'troubleshooting', 'tutorial', 'review', 'tips'];
  if (!validCategories.includes(data.category)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }
  
  // Validate engine or part slug
  if (!data.engine_slug && !data.part_slug) {
    errors.push('Must provide either engine_slug or part_slug');
  }
  if (data.engine_slug && data.part_slug) {
    errors.push('Cannot provide both engine_slug and part_slug');
  }
  
  // Set defaults
  processed.language = processed.language || 'en';
  processed.is_featured = processed.is_featured ?? false;
  processed.display_order = processed.display_order ?? 0;
  processed.is_active = processed.is_active ?? true;
  
  if (errors.length > 0) {
    return { ...processed, errors };
  }
  
  return processed;
}

/**
 * Read CSV file and convert to video data
 */
function readVideoCSV(filePath: string): VideoData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const videos: VideoData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length !== headers.length) continue;
    
    const video: Partial<VideoData> = {};
    headers.forEach((header, index) => {
      const value = values[index];
      if (!value || value === '') return;
      
      switch (header) {
        case 'title':
          video.title = value;
          break;
        case 'description':
          video.description = value;
          break;
        case 'video_url':
          video.video_url = value;
          break;
        case 'thumbnail_url':
          video.thumbnail_url = value;
          break;
        case 'duration_seconds':
          video.duration_seconds = parseDuration(value);
          break;
        case 'category':
          video.category = value as VideoData['category'];
          break;
        case 'engine_slug':
          video.engine_slug = value;
          break;
        case 'part_slug':
          video.part_slug = value;
          break;
        case 'channel_name':
          video.channel_name = value;
          break;
        case 'channel_url':
          video.channel_url = value;
          break;
        case 'published_date':
          video.published_date = value;
          break;
        case 'language':
          video.language = value;
          break;
        case 'is_featured':
          video.is_featured = value.toLowerCase() === 'true';
          break;
        case 'display_order':
          video.display_order = parseInt(value, 10);
          break;
        case 'is_active':
          video.is_active = value.toLowerCase() !== 'false';
          break;
      }
    });
    
    if (video.title && video.video_url && video.category) {
      videos.push(video as VideoData);
    }
  }
  
  return videos;
}

/**
 * Main function to process video import file
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: ts-node import-videos.ts <input-file.csv|json> [output-file.json]');
    console.log('');
    console.log('This script processes video data and validates it for import.');
    console.log('It will auto-extract YouTube thumbnails and validate URLs.');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace(/\.(csv|json)$/, '-processed.json');
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }
  
  console.log(`Processing ${inputFile}...`);
  
  let videos: VideoData[];
  
  if (inputFile.endsWith('.csv')) {
    videos = readVideoCSV(inputFile);
  } else if (inputFile.endsWith('.json')) {
    const content = fs.readFileSync(inputFile, 'utf-8');
    videos = JSON.parse(content);
  } else {
    console.error('Error: Input file must be .csv or .json');
    process.exit(1);
  }
  
  console.log(`Found ${videos.length} videos`);
  
  const processed = videos.map(processVideoData);
  const valid = processed.filter(v => !v.errors);
  const invalid = processed.filter(v => v.errors);
  
  console.log(`✓ Valid: ${valid.length}`);
  if (invalid.length > 0) {
    console.log(`✗ Invalid: ${invalid.length}`);
    console.log('\nErrors:');
    invalid.forEach((v, i) => {
      console.log(`\n${i + 1}. ${v.title || 'Unknown'}:`);
      v.errors?.forEach(err => console.log(`   - ${err}`));
    });
  }
  
  // Save processed data
  const output = {
    valid,
    invalid: invalid.map(v => {
      const { errors, ...data } = v;
      return { ...data, errors };
    }),
    summary: {
      total: videos.length,
      valid: valid.length,
      invalid: invalid.length,
      processed_at: new Date().toISOString(),
    },
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n✓ Processed data saved to: ${outputFile}`);
  console.log('\nNext steps:');
  console.log('1. Review the processed JSON file');
  console.log('2. Use the bulk import feature in /admin/videos with the valid entries');
  console.log('3. Fix any invalid entries and re-run the script');
}

if (require.main === module) {
  main();
}

export { processVideoData, extractYouTubeVideoId, getYouTubeThumbnail, validateVideoUrl, parseDuration };
