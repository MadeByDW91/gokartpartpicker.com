-- ============================================================================
-- Quick fix: Allow admin to insert/update parts (run in Supabase SQL Editor)
-- Use this if you get: new row violates row-level security policy for table "parts"
-- Safe to run multiple times.
-- ============================================================================

-- Ensure current_user_is_admin() exists (bypasses RLS when reading profiles)
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

-- PARTS: use current_user_is_admin() so admin inserts succeed
DROP POLICY IF EXISTS "Active parts are publicly readable" ON parts;
CREATE POLICY "Active parts are publicly readable"
  ON parts FOR SELECT
  USING (is_active = TRUE OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can insert parts" ON parts;
CREATE POLICY "Admins can insert parts"
  ON parts FOR INSERT
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update parts" ON parts;
CREATE POLICY "Admins can update parts"
  ON parts FOR UPDATE
  USING (public.current_user_is_admin());
