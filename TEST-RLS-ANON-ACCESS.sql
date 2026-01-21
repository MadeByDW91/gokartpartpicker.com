-- ============================================================================
-- Test RLS Anon Access - Run this to see what frontend can access
-- ============================================================================

-- Test 1: Check what anon role can see
SET ROLE anon;
SELECT COUNT(*) as anon_can_see_count FROM engines WHERE is_active = true;
SELECT slug, name, brand FROM engines WHERE is_active = true LIMIT 5;
RESET ROLE;

-- Test 2: Check the actual RLS policy
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'engines' AND cmd = 'SELECT';

-- Test 3: Verify the policy allows anon to see active engines
-- The policy should have: USING (is_active = TRUE OR is_admin())
-- If is_admin() is required, anon won't be able to see anything

-- Test 4: Try a direct query as anon
SET ROLE anon;
SELECT * FROM engines WHERE is_active = true LIMIT 1;
RESET ROLE;
