# Video Import Scripts

Tools for importing and managing video content for engines and parts.

## Auto-fill video URLs from YouTube (no manual linking)

Placeholder `video_url` values (e.g. `PLACEHOLDER`, `EXAMPLE_*`) can be replaced automatically using **YouTube Data API v3** search. No need to paste each link by hand.

### 1. Get a YouTube API key

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Library** → enable **YouTube Data API v3**.
2. **APIs & Services** → **Credentials** → **Create credentials** → **API key**.
3. Add to `.env.local` in the frontend:
   ```
   YOUTUBE_API_KEY=your-api-key
   ```

**Quota:** 10,000 units/day (default). One search = 100 units → **~100 videos per day**. For 135+ videos, run **Auto-fill URLs from YouTube** on two consecutive days (or request a quota increase).

### 2. Admin: one-click fill

1. Go to **Admin → Videos**.
2. Click **"Auto-fill URLs from YouTube"**.
3. Up to 50 placeholders are filled per run. If more remain, run again the next day (quota) or use the script.

Thumbnails are set automatically by the DB trigger when `video_url` is updated.

### 3. Script (CLI, optional)

For bulk runs or automation:

```bash
# From project root; ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY are set
npx tsx scripts/videos/populate-from-youtube-api.ts

# Dry run (no DB changes)
npx tsx scripts/videos/populate-from-youtube-api.ts --dry-run

# Custom batch size (default 50)
npx tsx scripts/videos/populate-from-youtube-api.ts --limit=100
```

If `@supabase/supabase-js` is not in the root, run from the `frontend` directory:

```bash
cd frontend && npx tsx ../scripts/videos/populate-from-youtube-api.ts
```

---

## Quick Start

### Option 1: Admin Panel (Recommended)

1. Go to `/admin/videos/new`
2. Fill out the video form
3. Select the engine or part
4. Paste the YouTube/Vimeo URL
5. Thumbnail will auto-extract from YouTube

### Option 2: Bulk Import via CSV

1. Create a CSV file using `video-import-template.csv` as a template
2. Fill in video data (YouTube URLs will auto-generate thumbnails)
3. Run the import script:
   ```bash
   cd scripts/videos
   npx tsx import-videos.ts your-videos.csv
   ```
4. Review the processed output
5. Use the bulk import feature in `/admin/videos` with the valid entries

### Option 3: SQL Seed File

1. Edit `supabase/migrations/20260116000013_seed_videos.sql`
2. Replace placeholder URLs with real YouTube/Vimeo URLs
3. Run the migration in Supabase

## Video Collection Strategy

### Top Priority Engines (20+ videos each)

1. **Predator 212 Hemi** - Most popular engine
2. **Predator 224** - Great for torque applications
3. **Predator 420** - Mid-size power
4. **Honda GX200** - Premium reliability
5. **Predator Ghost 212** - Racing oriented

### Video Categories to Cover

For each engine, collect videos in these categories:

- **Unboxing** (2-3 videos) - First impressions, what's in the box
- **Installation** (3-5 videos) - How to mount and set up
- **Maintenance** (3-5 videos) - Oil changes, air filter, general upkeep
- **Modification** (3-5 videos) - Performance upgrades, Stage 1/2/3 mods
- **Troubleshooting** (2-3 videos) - Common issues and fixes
- **Tutorial** (2-3 videos) - How-to guides, tips and tricks
- **Review** (1-2 videos) - Comprehensive reviews and comparisons

### Where to Find Videos

#### YouTube Search Queries

```
"{Engine Name} unboxing"
"{Engine Name} installation"
"{Engine Name} oil change"
"{Engine Name} modifications"
"{Engine Name} stage 1"
"{Engine Name} troubleshooting"
"{Engine Name} review"
"{Engine Name} vs {Other Engine}"
```

#### Popular Channels

- **GoKart Builds** - Installation and build guides
- **Small Engine Repair** - Maintenance and troubleshooting
- **Racing Performance** - Modifications and performance
- **Harbor Freight** - Official Predator content
- **Honda Small Engines** - Official Honda content
- **Local go-kart builders** - Real-world experience

#### Example Searches

- "Predator 212 Hemi unboxing"
- "Predator 212 installation go-kart"
- "Predator 212 oil change tutorial"
- "Predator 212 stage 1 modifications"
- "Predator 212 won't start troubleshooting"
- "Predator 212 vs Honda GX200 comparison"

## CSV Template

The `video-import-template.csv` file includes all required and optional fields:

### Required Fields

- `title` - Video title
- `video_url` - YouTube, Vimeo, or direct video URL
- `category` - One of: unboxing, installation, maintenance, modification, troubleshooting, tutorial, review, tips
- Either `engine_slug` OR `part_slug` (not both)

### Optional Fields

- `description` - Video description
- `thumbnail_url` - Auto-extracted from YouTube if not provided
- `duration_seconds` - Duration in seconds (or MM:SS format)
- `channel_name` - Creator/channel name
- `channel_url` - Channel URL
- `published_date` - YYYY-MM-DD format
- `language` - Defaults to 'en'
- `is_featured` - true/false (default: false)
- `display_order` - Sort order (default: 0)
- `is_active` - true/false (default: true)

### Example CSV Row

```csv
"Predator 212 Hemi Unboxing","Complete unboxing showing what comes in the box","https://www.youtube.com/watch?v=abc123","",480,unboxing,predator-212-hemi,,GoKart Builds,https://www.youtube.com/@gokartbuilds,2024-01-15,true,0,true
```

## 25 Videos per Engine (Seed)

The migration `20260116000019_seed_videos_25_per_engine.sql` seeds **25 engine-specific topics** per engine (250 total). Topics are in `docs/video-topics-25-per-engine.md`. To regenerate the SQL:

```bash
node scripts/videos/generate-25-seed.js
```

Then run the migration in Supabase. Use **Admin → Auto-fill URLs from YouTube** or `populate-from-youtube-api.ts` to replace `PLACEHOLDER` `video_url`s.

## Add 10 More Videos per Engine (+100)

The migration `20260116000020_add_10_videos_per_engine.sql` **adds** 10 more engine-specific topics per engine (100 total). It does **not** delete existing videos. Run **after** the 25-per-engine seed. To regenerate the SQL:

```bash
node scripts/videos/generate-10-more-videos.js
```

New topics cover: spark plug/ignition, fuel line/tank, shaft adapters (224/301/420), Stage 2/cam, recoil repair, low oil shutdown, chain/sprockets, electric start conversion, dyno tests, cold start tips, and budget build guides. Replace `PLACEHOLDER` via Admin or `populate-from-youtube-api.ts`.

## Import Script Usage

```bash
# Process CSV file
npx tsx import-videos.ts videos.csv

# Process JSON file
npx tsx import-videos.ts videos.json

# Specify output file
npx tsx import-videos.ts videos.csv processed-videos.json
```

### What the Script Does

1. ✅ Validates video URLs (YouTube, Vimeo, or direct files)
2. ✅ Auto-extracts YouTube thumbnails
3. ✅ Validates categories
4. ✅ Validates engine/part slugs
5. ✅ Converts duration formats
6. ✅ Reports errors for invalid entries
7. ✅ Outputs JSON ready for bulk import

## Adding Videos Manually

### Via Admin Panel

1. Navigate to `/admin/videos/new`
2. Fill out the form:
   - **Title**: Clear, descriptive title
   - **Video URL**: Paste YouTube/Vimeo URL
   - **Category**: Select appropriate category
   - **Link to**: Choose Engine or Part
   - **Channel**: Add channel name and URL
3. Click "Create Video"
4. Thumbnail will auto-extract if YouTube URL

### Via Engine/Part Pages

1. Go to `/admin/engines/[id]/videos` or `/admin/parts/[id]/videos`
2. Click "Add Video"
3. Form will be pre-filled with engine/part ID
4. Fill in remaining details
5. Save

## Tips for Video Collection

1. **Quality over Quantity**: Prioritize well-produced, educational videos
2. **Mix of Skill Levels**: Include both beginner and advanced content
3. **Featured Videos**: Mark 2-3 best videos per engine as "featured"
4. **Display Order**: Set display_order to control sorting (0 = first)
5. **Active Status**: Keep all videos active unless they become outdated
6. **Regular Updates**: Add new videos as they become available
7. **Community Feedback**: Consider user-submitted video suggestions

## Video URL Formats Supported

### YouTube
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

### Vimeo
- `https://vimeo.com/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`

### Direct Video Files
- `https://example.com/video.mp4`
- `https://example.com/video.webm`
- `https://example.com/video.ogg`

## Troubleshooting

### "Invalid video URL" error
- Ensure URL is from YouTube, Vimeo, or direct video file
- Check URL format matches supported patterns

### Thumbnail not extracting
- Only works for YouTube URLs
- Manual thumbnail URL can be provided
- YouTube format: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`

### "Must provide engine_slug or part_slug" error
- Ensure either engine_slug or part_slug is provided (not both)
- Verify slug matches an existing engine/part in database

### Bulk import errors
- Review processed JSON file for detailed errors
- Fix invalid entries and re-run script
- Import only valid entries via admin panel

## Next Steps

1. Start with top 5 engines (212 Hemi, 224, 420, GX200, Ghost)
2. Collect 20+ videos per engine across all categories
3. Mark 2-3 best videos as "featured" per engine
4. Expand to other engines once top 5 are complete
5. Add part videos once engine videos are in place

## Support

For questions or issues:
- Check admin panel at `/admin/videos`
- Review video documentation in `docs/prompts/A9-video-content.md`
- Use import script to validate data before importing
