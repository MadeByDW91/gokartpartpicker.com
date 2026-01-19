# Step 1: Predator 212 Hemi Videos

Videos for the **Predator 212 Hemi** engine are set up so you can run the seed and, if you like, add more via the admin or CSV.

## What’s included

### 3 videos with real YouTube URLs (ready to use)

| # | Category      | Title                                                                 | Video ID      |
|---|---------------|-----------------------------------------------------------------------|---------------|
| 1 | **review**    | New Predator 212 Ghost Engine Disassembly, Identification and Review  | `a2K26VuxDCU` |
| 2 | **modification** | Predator 212 Budget High Performance Build \| DIY Go Karts         | `kLAkwti_0zc` |
| 3 | **maintenance**  | Predator 212 Oil and Engine Orientation Tips                      | `RTHDeAMrjO4` |

### 3 placeholder videos (replace before or after seed)

These use `PLACEHOLDER1` in the seed SQL. They will appear in the DB and in the UI, but the player will show “Video unavailable” until you set real URLs.

| # | Category         | Suggested YouTube search                          |
|---|------------------|---------------------------------------------------|
| 4 | **installation** | `Predator 212 go kart install` or `torque converter Predator 212` |
| 5 | **tutorial**     | `Predator 212 break in` or `Predator 212 first start`             |
| 6 | **troubleshooting** | `Predator 212 won't start` or `Predator 212 carburetor adjustment` |

---

## Option A: Run the SQL seed (recommended)

1. **Apply the migration** (if you manage DB with Supabase CLI):
   ```bash
   supabase db push
   ```
   Or in the **Supabase Dashboard → SQL Editor**, run:
   - `supabase/migrations/20260116000012_add_videos.sql` (if not already run)
   - `supabase/migrations/20260116000013_seed_videos.sql`

2. **Fix the 3 placeholders** (optional but recommended):
   - In Supabase: `UPDATE videos SET video_url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID' WHERE video_url LIKE '%PLACEHOLDER1%' AND title LIKE '%Install%';`  
     (and similar for the other two), **or**
   - In the app: go to **Admin → Content → Videos**, find each of the 3 placeholder videos, Edit, and paste the correct `https://www.youtube.com/watch?v=XXXX` URL.

---

## Option B: Add via admin (no migration)

1. Go to **Admin → Content → Videos → Add Video**.
2. For each of the 6 videos (or any subset):
   - **Title** / **Description**: copy from the table or from `predator-212-hemi-videos.csv`.
   - **Video URL**:  
     - For the 3 verified: use the URLs from the table above.  
     - For the 3 placeholders: search YouTube with the suggested queries, pick a video, and paste `https://www.youtube.com/watch?v=XXXX`.
   - **Category**: `review`, `modification`, `maintenance`, `installation`, `tutorial`, or `troubleshooting` as in the table.
   - **Link to**: **Engine** → **Predator 212 Hemi**.
   - **Channel** (optional): from the CSV or whatever fits the video.
3. Save. Thumbnails will be pulled from YouTube when the URL is valid.

---

## Option C: Bulk import from CSV

The file `predator-212-hemi-videos.csv` has all 6 rows. The 3 “REPLACE_WITH_VIDEO_ID” rows must be updated with real `watch?v=XXXX` URLs before import.

1. **Edit the CSV**
   - Replace `REPLACE_WITH_VIDEO_ID` in the `video_url` column with the real ID from a YouTube URL, e.g. `https://www.youtube.com/watch?v=abc123` → use `abc123` in `.../watch?v=abc123`.  
   - Or replace the whole `video_url` with the full `https://www.youtube.com/watch?v=XXXX` if your import tool expects that.

2. **Run the import script** (if you use it):
   ```bash
   npx tsx scripts/videos/import-videos.ts scripts/videos/predator-212-hemi-videos.csv
   ```
   Then use the script’s output with your bulk-import or admin workflow (see `scripts/videos/README.md`).

3. **Bulk import in admin**  
   If your admin supports CSV or JSON import for videos, use the processed file from the script (or a manually corrected CSV). Ensure `engine_slug` is `predator-212-hemi`; your import may need to resolve that to `engine_id`.

---

## Replaceing the 3 placeholders in SQL (after seed)

If you already ran the seed and want to fix the 3 placeholders in the database:

```sql
-- 1) Installation — replace VIDEO_ID with the real 11‑char id from YouTube
UPDATE videos
SET video_url = 'https://www.youtube.com/watch?v=VIDEO_ID'
WHERE engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi')
  AND category = 'installation'
  AND video_url LIKE '%PLACEHOLDER1%';

-- 2) Tutorial (break‑in)
UPDATE videos
SET video_url = 'https://www.youtube.com/watch?v=VIDEO_ID'
WHERE engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi')
  AND category = 'tutorial'
  AND video_url LIKE '%PLACEHOLDER1%';

-- 3) Troubleshooting
UPDATE videos
SET video_url = 'https://www.youtube.com/watch?v=VIDEO_ID'
WHERE engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi')
  AND category = 'troubleshooting'
  AND video_url LIKE '%PLACEHOLDER1%';
```

---

## Suggested next searches for more videos

Use these on YouTube to grow the list:

- `Predator 212 Hemi unboxing`
- `Predator 212 go kart install`
- `Predator 212 torque converter install`
- `Predator 212 oil change`
- `Predator 212 stage 1 kit`
- `Predator 212 carburetor jetting`
- `Predator 212 governor remove`
- `Predator 212 vs Honda GX200`

---

## Files touched in Step 1

- `supabase/migrations/20260116000013_seed_videos.sql` – 6 Predator 212 Hemi videos (3 real, 3 placeholders).
- `scripts/videos/predator-212-hemi-videos.csv` – same set for CSV/bulk import.
- `scripts/videos/STEP1-PREDATOR-212-HEMI.md` – this guide.

After Step 1, you can repeat the same pattern for **Predator 224**, **Predator 420**, **Honda GX200**, and **Predator Ghost 212**.
