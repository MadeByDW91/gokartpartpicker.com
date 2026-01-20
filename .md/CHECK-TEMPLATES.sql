-- ============================================================================
-- Check Templates and RLS Status
-- Run this in Supabase SQL Editor to diagnose template loading issues
-- ============================================================================

-- Check if templates exist
SELECT 
  id,
  name,
  goal,
  is_public,
  is_active,
  engine_id,
  created_at
FROM build_templates
ORDER BY created_at DESC;

-- Count templates by goal
SELECT 
  goal,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE is_public = true AND is_active = true) as public_active_count
FROM build_templates
GROUP BY goal;

-- Check RLS policies on build_templates
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'build_templates';

-- Test if public templates are accessible (simulating anonymous user)
-- This should return rows if RLS is working correctly
SET ROLE anon;
SELECT 
  id,
  name,
  goal,
  is_public,
  is_active
FROM build_templates
WHERE is_public = true AND is_active = true
LIMIT 5;
RESET ROLE;
