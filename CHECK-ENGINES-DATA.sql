-- ============================================================================
-- Check Engine Data - Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Check total count (including inactive)
SELECT 
  COUNT(*) as total_engines,
  COUNT(*) FILTER (WHERE is_active = true) as active_engines,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_engines
FROM engines;

-- 2. List all engines with their active status
SELECT 
  slug,
  name,
  brand,
  is_active,
  created_at
FROM engines
ORDER BY created_at DESC;

-- 3. Test RLS - Check what anon role can see
SET ROLE anon;
SELECT COUNT(*) as anon_can_see FROM engines WHERE is_active = true;
RESET ROLE;

-- 4. Check if RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'engines';

-- 5. Check if there are any constraints blocking
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'engines'::regclass;
