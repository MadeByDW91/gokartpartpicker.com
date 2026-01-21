-- ============================================================================
-- Fix RLS Policy for Engines - Run this to allow anon users to see engines
-- ============================================================================

-- Step 1: Drop the existing policy
DROP POLICY IF EXISTS "Active engines are publicly readable" ON engines;

-- Step 2: Recreate the policy with explicit role grants
CREATE POLICY "Active engines are publicly readable"
  ON engines FOR SELECT
  TO public, anon, authenticated
  USING (is_active = TRUE OR is_admin());

-- Step 3: Verify the policy was created
SELECT 
  policyname,
  cmd,
  roles,
  qual as using_clause
FROM pg_policies 
WHERE tablename = 'engines' AND cmd = 'SELECT';

-- Step 4: Test that anon can now see engines
SET ROLE anon;
SELECT COUNT(*) as anon_can_see_count FROM engines WHERE is_active = true;
SELECT slug, name, brand FROM engines WHERE is_active = true LIMIT 5;
RESET ROLE;

-- Step 5: Grant explicit SELECT permission (if needed)
GRANT SELECT ON engines TO anon;
GRANT SELECT ON engines TO authenticated;
GRANT SELECT ON engines TO public;
