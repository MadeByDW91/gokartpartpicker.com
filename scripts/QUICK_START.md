# Quick Start: Adding Videos

Since I can't directly browse YouTube, here are **3 easy ways** to add videos:

## Option 1: Interactive Script (Easiest) ⭐

Run this and it will prompt you for each video:

```bash
npx tsx scripts/addVideosInteractive.ts
```

It will:
- Ask for engine slug
- Ask for YouTube video ID
- Verify the video automatically
- Ask for title, category, tags
- Add it to the database

**Example:**
1. Run: `npx tsx scripts/addVideosInteractive.ts`
2. Enter: `predator-212-hemi`
3. Enter YouTube ID: `dQw4w9WgXcQ` (from URL: youtube.com/watch?v=dQw4w9WgXcQ)
4. Enter title: `Predator 212 Hemi - Complete Installation Guide`
5. Enter category: `INSTALL`
6. Enter tags: `installation, setup, beginner`
7. Repeat for more videos or type "done"

## Option 2: Edit JSON File

1. Open `scripts/video-data.json`
2. Find the engine section (e.g., `predator-212-hemi`)
3. Add YouTube IDs to the `youtubeId` fields
4. Run: `npx tsx scripts/addEngineVideos.ts predator-212-hemi`

## Option 3: Edit TypeScript File

1. Open `scripts/addEngineVideos.ts`
2. Find the video templates
3. Replace `youtubeId: ''` with real YouTube IDs
4. Run: `npx tsx scripts/addEngineVideos.ts predator-212-hemi`

## Finding YouTube Video IDs

1. Go to YouTube
2. Search for: "Predator 212 Hemi installation"
3. Click on a video
4. Copy the ID from URL: `youtube.com/watch?v=VIDEO_ID_HERE`
5. Paste it into the script

## Recommended: Start with 5-10 videos

Don't try to add all 30 at once. Start with 5-10 videos, test them, then add more.

**Quick test:**
```bash
# Add just a few videos interactively
npx tsx scripts/addVideosInteractive.ts
```

Then check: http://localhost:3000/videos

