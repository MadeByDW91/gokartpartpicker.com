-- ============================================================================
-- Fix infinite recursion in profiles RLS
-- Created: 2026-02-01
-- Description: "Admins can view all profiles" used SELECT FROM profiles inside
-- the policy, which re-triggered RLS on profiles → infinite recursion. Use
-- public.is_admin() (SECURITY DEFINER) instead so the check does not go through RLS.
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Admins can read all profile rows. Uses is_admin() to avoid RLS recursion.';
