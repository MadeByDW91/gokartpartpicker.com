# Auto-Add Videos for Parts - Setup Guide

## Overview
The system can automatically search YouTube and add relevant videos with thumbnails when you create or edit parts.

## Setup Required

### 1. Get YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Add API Key to Environment Variables

**For Local Development:**
Add to `frontend/.env.local`:
```
YOUTUBE_API_KEY=your_api_key_here
```

**For Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `YOUTUBE_API_KEY`
   - **Value:** Your YouTube API key
   - **Environment:** Production, Preview, Development (select all)

## How to Use

### Option 1: Auto-Add When Creating New Part
1. Go to **Admin** → **Parts** → **Add New Part**
2. Fill in part details (name, brand, category, etc.)
3. Check the box: **"Auto-add videos (searches YouTube for relevant videos)"**
4. Click **Save**
5. The system will automatically:
   - Search YouTube for videos matching the part name, brand, and category
   - Extract thumbnails from YouTube
   - Create video records linked to your part
   - Display up to 5 videos

### Option 2: Auto-Add for Existing Part
1. Go to **Admin** → **Parts** → Click **Edit** on any part
2. Scroll to the **"Auto-Add Videos"** section
3. Click **"Auto-Add Videos"** button
4. The system will search and add videos automatically
5. You'll see a success message showing how many videos were added

## What Gets Added

For each video found, the system automatically:
- ✅ Extracts YouTube video URL
- ✅ Gets thumbnail image (high quality)
- ✅ Sets video title from YouTube
- ✅ Sets video description
- ✅ Links video to your part
- ✅ Sets appropriate category (installation, tutorial, review, etc.)
- ✅ Marks first video as "featured"
- ✅ Sets channel name and URL

## Example

When you create a part like:
- **Name:** NIBBI 24mm Carburetor Kit (Black)
- **Brand:** NIBBI
- **Category:** Carburetor

The system searches for:
- "NIBBI 24mm Carburetor Kit (Black) go kart"
- "NIBBI NIBBI 24mm Carburetor Kit (Black) go kart"
- "Carburetor NIBBI 24mm Carburetor Kit (Black) go kart"
- "how to install NIBBI 24mm Carburetor Kit (Black) go kart"

And automatically adds the top matching videos!

## YouTube API Quota

- **Default quota:** 10,000 units/day
- **One search:** 100 units
- **Approximate limit:** ~100 video searches per day
- The system limits to 3 search queries per part to conserve quota

## Troubleshooting

### "YouTube API key not configured"
- Make sure `YOUTUBE_API_KEY` is set in your environment variables
- Restart your development server after adding the key
- For Vercel, redeploy after adding the environment variable

### "YouTube API quota exceeded"
- You've hit your daily quota limit
- Wait 24 hours or request a quota increase in Google Cloud Console
- The system will show this error and skip video addition

### "No videos found"
- The part name/brand might be too specific
- Try using more common terms
- You can manually add videos via the admin panel

## Manual Video Addition

If auto-add doesn't find videos or you want to add specific videos:
1. Go to **Admin** → **Videos**
2. Click **Add New Video**
3. Paste YouTube URL
4. System will auto-extract thumbnail
5. Link to your part

## Notes

- Videos are automatically set to `is_active = true`
- First video found is marked as `is_featured = true`
- Videos are ordered by relevance
- You can edit/delete videos later in the admin panel
- Thumbnails are automatically extracted from YouTube
