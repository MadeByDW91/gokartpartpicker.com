# How to Add Videos to the Database

## Quick Start

1. **Choose an engine** to add videos for (start with one at a time)
2. **Edit the script**: `scripts/addEngineVideos.ts`
3. **Add YouTube video IDs** to the video templates
4. **Run the script**: `npx tsx scripts/addEngineVideos.ts <engine-slug>`

## Step-by-Step Instructions

### Step 1: Choose an Engine

Available engines:
- `predator-212-hemi` - Predator 212 Hemi
- `predator-212-non-hemi` - Predator 212 Non-Hemi
- `predator-212-ghost` - Predator 212 Ghost
- `predator-420` - Predator 420
- `predator-670` - Predator 670

**Start with**: `predator-212-hemi` (most popular)

### Step 2: Find YouTube Videos

1. Go to YouTube and search for videos matching each title
2. Example searches:
   - "Predator 212 Hemi installation guide"
   - "Predator 212 Hemi governor removal"
   - "Predator 212 Hemi billet flywheel install"
3. Copy the video ID from the URL:
   - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Video ID: `dQw4w9WgXcQ` (the part after `v=`)

### Step 3: Edit the Script

1. Open `scripts/addEngineVideos.ts`
2. Find the video template you want to add
3. Replace the empty `youtubeId: ''` with the real YouTube ID
4. Example:
   ```typescript
   { 
     title: `Predator 212 Hemi - Complete Installation Guide`, 
     category: 'INSTALL' as const, 
     tags: ['installation', 'setup', 'beginner'], 
     upgradeIds: null,
     youtubeId: 'dQw4w9WgXcQ', // ← Add real YouTube ID here
   },
   ```

### Step 4: Run the Script

```bash
npx tsx scripts/addEngineVideos.ts predator-212-hemi
```

The script will:
- ✅ Verify each video is accessible
- ✅ Check if video already exists
- ✅ Add valid videos to the database
- ✅ Show progress and results

### Step 5: Verify Results

1. Check the website: `http://localhost:3000/videos`
2. Filter by engine to see your videos
3. Verify thumbnails are showing correctly

## Tips

- **Add videos gradually**: Start with 5-10 videos, test, then add more
- **Verify thumbnails**: Make sure YouTube IDs are correct (thumbnails should load)
- **Use real videos**: Only add videos that actually exist and are accessible
- **One engine at a time**: Complete one engine before moving to the next

## Video Categories

- **INSTALL** (10 videos): Installation guides
- **TUNING** (8 videos): Tuning and adjustment guides
- **TEARDOWN** (6 videos): Disassembly and rebuild guides
- **SAFETY** (3 videos): Safety tips and procedures
- **Maintenance** (3 videos): Oil changes, spark plugs, etc.

Total: 30 videos per engine

## Troubleshooting

**Video not found?**
- Double-check the YouTube ID
- Make sure the video is public and accessible
- Try opening the video URL in a browser

**Thumbnail not showing?**
- The script verifies videos before adding
- If verification passes but thumbnail doesn't show, check the YouTube ID format

**Script errors?**
- Make sure you're in the project root directory
- Check that the database is running
- Verify the engine slug is correct

