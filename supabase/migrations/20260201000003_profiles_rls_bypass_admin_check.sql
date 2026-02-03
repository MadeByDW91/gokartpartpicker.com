-- Fix profiles RLS recursion: admin check that bypasses RLS
-- Created: 2026-02-01
-- Use current_user_is_admin() so reading profiles does not re-trigger RLS.

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result boolean;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) INTO result;
  SET LOCAL row_security = on;
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.current_user_is_admin() IS 'Check if current user is admin. Bypasses RLS on profiles to avoid infinite recursion in policies.';

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.current_user_is_admin());

COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Admins can read all profile rows. Uses current_user_is_admin() to avoid RLS recursion.';

DROP POLICY IF EXISTS "Admins can read all electric motors" ON electric_motors;
DROP POLICY IF EXISTS "Admins can insert electric motors" ON electric_motors;
DROP POLICY IF EXISTS "Admins can update electric motors" ON electric_motors;
DROP POLICY IF EXISTS "Admins can delete electric motors" ON electric_motors;

CREATE POLICY "Admins can read all electric motors"
  ON electric_motors FOR SELECT
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can insert electric motors"
  ON electric_motors FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can update electric motors"
  ON electric_motors FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete electric motors"
  ON electric_motors FOR DELETE
  USING (public.current_user_is_admin());

COMMENT ON POLICY "Admins can read all electric motors" ON electric_motors IS 'Admins can view all motors including inactive ones. Uses current_user_is_admin() to avoid RLS recursion.';
COMMENT ON POLICY "Admins can insert electric motors" ON electric_motors IS 'Only admins can create new motors';
COMMENT ON POLICY "Admins can update electric motors" ON electric_motors IS 'Only admins can modify motors';
COMMENT ON POLICY "Admins can delete electric motors" ON electric_motors IS 'Only admins can delete motors';
