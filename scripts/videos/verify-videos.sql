-- ============================================================================
-- Verify videos exist and are linked to Predator 212 Hemi
-- Run this in Supabase SQL Editor to diagnose "no videos showing"
-- ============================================================================

-- 1) Check that the engine exists and get its ID
SELECT id, slug, name FROM engines WHERE slug = 'predator-212-hemi';

-- 2) Count videos linked to that engine (use the id from step 1 if needed)
SELECT COUNT(*) AS video_count
FROM videos v
JOIN engines e ON e.id = v.engine_id
WHERE e.slug = 'predator-212-hemi' AND v.is_active = true;

-- 3) List those videos
SELECT v.id, v.title, v.category, v.is_featured, v.is_active
FROM videos v
JOIN engines e ON e.id = v.engine_id
WHERE e.slug = 'predator-212-hemi'
ORDER BY v.is_featured DESC, v.display_order, v.created_at;

-- If video_count is 0: run the seed migration 20260116000013_seed_videos.sql
-- in Supabase SQL Editor (copy the full file contents and run).
