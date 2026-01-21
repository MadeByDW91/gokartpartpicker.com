-- ============================================================================
-- Fix RLS Policy for Parts - Run this to allow anon users to see parts
-- ============================================================================

-- Step 1: Drop the existing policy
DROP POLICY IF EXISTS "Active parts are publicly readable" ON parts;

-- Step 2: Recreate the policy with explicit role grants
CREATE POLICY "Active parts are publicly readable"
  ON parts FOR SELECT
  TO public, anon, authenticated
  USING (is_active = TRUE OR is_admin());

-- Step 3: Verify the policy was created
SELECT 
  policyname,
  cmd,
  roles,
  qual as using_clause
FROM pg_policies 
WHERE tablename = 'parts' AND cmd = 'SELECT';

-- Step 4: Test that anon can now see parts
SET ROLE anon;
SELECT COUNT(*) as anon_can_see_count FROM parts WHERE is_active = true;
SELECT slug, name, brand, category FROM parts WHERE is_active = true LIMIT 5;
RESET ROLE;

-- Step 5: Grant explicit SELECT permission (if needed)
GRANT SELECT ON parts TO anon;
GRANT SELECT ON parts TO authenticated;
GRANT SELECT ON parts TO public;
