-- ============================================================================
-- Check Build Templates (run in Supabase SQL Editor)
-- Use this if /templates shows "No Templates Found" or templates don't load.
-- ============================================================================

-- 1) Table and row count
SELECT 'build_templates' AS rel, COUNT(*) AS rows
FROM build_templates;

-- 2) If the above errors with "relation build_templates does not exist":
--    Run in order: 20260116000011_add_build_templates.sql,
--    20260116000013_user_templates_approval.sql,
--    20260117000003_seed_build_templates.sql

-- 3) Sample of visible templates (is_public, is_active; approval_status if column exists)
SELECT id, name, goal, is_public, is_active
FROM build_templates
WHERE is_public = true AND is_active = true
ORDER BY created_at DESC
LIMIT 5;

-- 4) If you have an approval_status column and some rows are not 'approved', set them:
-- (Only run if the column exists and you want to make existing templates visible.)
/*
UPDATE build_templates
SET approval_status = 'approved'
WHERE approval_status IS NULL OR approval_status != 'approved';
*/

-- 5) Engines must exist for the template seed to insert rows. Check:
SELECT COUNT(*) AS engine_count FROM engines;
