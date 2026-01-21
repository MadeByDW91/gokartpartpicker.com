-- ============================================================================
-- Verify Parts Data - Run this to check parts status
-- ============================================================================

-- Check 1: Total count
SELECT COUNT(*) as total_parts FROM parts;

-- Check 2: Active count
SELECT COUNT(*) as active_parts FROM parts WHERE is_active = true;

-- Check 3: List all parts
SELECT slug, name, brand, category, is_active 
FROM parts 
ORDER BY created_at DESC;

-- Check 4: Test as anon user (what frontend sees)
SET ROLE anon;
SELECT COUNT(*) as anon_can_see FROM parts WHERE is_active = true;
SELECT slug, name, brand FROM parts WHERE is_active = true LIMIT 5;
RESET ROLE;

-- Check 5: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'parts';

-- Check 6: List RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'parts';
