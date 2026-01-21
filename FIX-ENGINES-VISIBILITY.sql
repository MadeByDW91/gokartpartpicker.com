-- ============================================================================
-- Fix Engines Visibility - Run this if engines exist but don't show on frontend
-- ============================================================================

-- Step 1: Verify engines exist and are active
SELECT COUNT(*) as total, 
       COUNT(*) FILTER (WHERE is_active = true) as active 
FROM engines;

-- Step 2: Check RLS policy exists and is correct
SELECT policyname, cmd, qual, roles
FROM pg_policies 
WHERE tablename = 'engines' AND cmd = 'SELECT';

-- Step 3: Test what anon role can see (this is what frontend uses)
SET ROLE anon;
SELECT COUNT(*) as anon_can_see FROM engines WHERE is_active = true;
RESET ROLE;

-- Step 4: If anon can't see engines, recreate the policy
-- (Only run this if Step 3 returns 0)
/*
DROP POLICY IF EXISTS "Active engines are publicly readable" ON engines;
CREATE POLICY "Active engines are publicly readable"
  ON engines FOR SELECT
  TO public, anon, authenticated
  USING (is_active = TRUE OR is_admin());
*/

-- Step 5: Verify after policy fix
SET ROLE anon;
SELECT COUNT(*) as anon_can_see_after_fix FROM engines WHERE is_active = true;
SELECT slug, name FROM engines WHERE is_active = true LIMIT 3;
RESET ROLE;
