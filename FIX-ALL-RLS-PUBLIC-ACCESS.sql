-- ============================================================================
-- Fix All RLS Policies for Public Access - Run this to fix all tables
-- ============================================================================
-- This fixes the same issue across all tables that should be publicly readable

-- ============================================================================
-- PART_CATEGORIES
-- ============================================================================
DROP POLICY IF EXISTS "Active categories are publicly readable" ON part_categories;
CREATE POLICY "Active categories are publicly readable"
  ON part_categories FOR SELECT
  TO public, anon, authenticated
  USING (is_active = TRUE OR is_admin());
GRANT SELECT ON part_categories TO anon;
GRANT SELECT ON part_categories TO authenticated;
GRANT SELECT ON part_categories TO public;

-- ============================================================================
-- COMPATIBILITY_RULES
-- ============================================================================
DROP POLICY IF EXISTS "Active rules are publicly readable" ON compatibility_rules;
CREATE POLICY "Active rules are publicly readable"
  ON compatibility_rules FOR SELECT
  TO public, anon, authenticated
  USING (is_active = TRUE OR is_admin());
GRANT SELECT ON compatibility_rules TO anon;
GRANT SELECT ON compatibility_rules TO authenticated;
GRANT SELECT ON compatibility_rules TO public;

-- ============================================================================
-- ENGINE_PART_COMPATIBILITY
-- ============================================================================
DROP POLICY IF EXISTS "Compatibility data is publicly readable" ON engine_part_compatibility;
CREATE POLICY "Compatibility data is publicly readable"
  ON engine_part_compatibility FOR SELECT
  TO public, anon, authenticated
  USING (is_active = TRUE OR is_admin());
GRANT SELECT ON engine_part_compatibility TO anon;
GRANT SELECT ON engine_part_compatibility TO authenticated;
GRANT SELECT ON engine_part_compatibility TO public;

-- ============================================================================
-- CONTENT
-- ============================================================================
DROP POLICY IF EXISTS "Published content is publicly readable" ON content;
CREATE POLICY "Published content is publicly readable"
  ON content FOR SELECT
  TO public, anon, authenticated
  USING (is_published = TRUE OR is_admin());
GRANT SELECT ON content TO anon;
GRANT SELECT ON content TO authenticated;
GRANT SELECT ON content TO public;

-- ============================================================================
-- BUILD_TEMPLATES (if exists)
-- ============================================================================
-- Check if build_templates table exists and has RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'build_templates') THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Public templates are readable" ON build_templates;
    DROP POLICY IF EXISTS "Active templates are publicly readable" ON build_templates;
    
    -- Create new policy with explicit roles
    CREATE POLICY "Active templates are publicly readable"
      ON build_templates FOR SELECT
      TO public, anon, authenticated
      USING ((is_public = TRUE AND is_active = TRUE AND approval_status = 'approved') OR is_admin());
    
    -- Grant permissions
    GRANT SELECT ON build_templates TO anon;
    GRANT SELECT ON build_templates TO authenticated;
    GRANT SELECT ON build_templates TO public;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test that anon can see data from all tables
SET ROLE anon;
SELECT 'part_categories' as table_name, COUNT(*) as count FROM part_categories WHERE is_active = true
UNION ALL
SELECT 'compatibility_rules', COUNT(*) FROM compatibility_rules WHERE is_active = true
UNION ALL
SELECT 'engine_part_compatibility', COUNT(*) FROM engine_part_compatibility WHERE is_active = true
UNION ALL
SELECT 'content', COUNT(*) FROM content WHERE is_published = true;
RESET ROLE;
