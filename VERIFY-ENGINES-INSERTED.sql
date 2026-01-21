-- ============================================================================
-- Verify Engines Were Inserted - Run this in Supabase SQL Editor
-- ============================================================================

-- Check 1: Total count
SELECT COUNT(*) as total_count FROM engines;

-- Check 2: Active count
SELECT COUNT(*) as active_count FROM engines WHERE is_active = true;

-- Check 3: List all engines
SELECT slug, name, brand, is_active, created_at 
FROM engines 
ORDER BY created_at DESC;

-- Check 4: Test as anon user (what frontend sees)
SET ROLE anon;
SELECT COUNT(*) as anon_can_see FROM engines WHERE is_active = true;
SELECT slug, name FROM engines WHERE is_active = true LIMIT 5;
RESET ROLE;

-- Check 5: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'engines';

-- Check 6: List RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'engines';
