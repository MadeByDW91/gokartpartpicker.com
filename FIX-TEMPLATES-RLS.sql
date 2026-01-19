-- ============================================================================
-- Fix Templates RLS Policies
-- This ensures templates are accessible to everyone (including anonymous users)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON build_templates;
DROP POLICY IF EXISTS "Admins can view all templates" ON build_templates;

-- Recreate the public policy - this should work for anonymous users
CREATE POLICY "Public templates are viewable by everyone"
  ON build_templates
  FOR SELECT
  USING (is_public = true AND is_active = true);

-- Admins can view all templates (including inactive/private)
CREATE POLICY "Admins can view all templates"
  ON build_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'build_templates'
ORDER BY policyname;

-- Test query (should work for anonymous users)
-- This simulates what the server action does
SELECT 
  id,
  name,
  goal,
  is_public,
  is_active,
  created_at
FROM build_templates
WHERE is_public = true AND is_active = true
ORDER BY created_at DESC
LIMIT 10;
