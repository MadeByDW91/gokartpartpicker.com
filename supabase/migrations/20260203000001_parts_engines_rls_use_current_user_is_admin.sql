-- ============================================================================
-- Parts & engines RLS: use current_user_is_admin() so admin inserts succeed
-- Created: 2026-02-03
-- Description: "new row violates row-level security policy for table parts"
-- happened because parts/engines policies use is_admin(), which reads profiles
-- and can be blocked by profiles RLS. Use current_user_is_admin() (bypasses
-- RLS when reading profiles) so admin inserts/updates work.
-- ============================================================================

-- PARTS: admin insert/update/select
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

-- ENGINES: admin insert/update/select (for consistency)
DROP POLICY IF EXISTS "Active engines are publicly readable" ON engines;
CREATE POLICY "Active engines are publicly readable"
  ON engines FOR SELECT
  USING (is_active = TRUE OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can insert engines" ON engines;
CREATE POLICY "Admins can insert engines"
  ON engines FOR INSERT
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update engines" ON engines;
CREATE POLICY "Admins can update engines"
  ON engines FOR UPDATE
  USING (public.current_user_is_admin());
