-- ============================================================================
-- Part supplier links RLS: use current_user_is_admin() so admin inserts succeed
-- The original policy read from profiles (EXISTS SELECT FROM profiles WHERE ...)
-- and can be blocked by profiles RLS. Use current_user_is_admin() (bypasses
-- RLS when checking admin) so admins can create/update supplier links.
-- ============================================================================

-- Drop the policy that reads profiles directly
DROP POLICY IF EXISTS "Part supplier links are editable by admins" ON part_supplier_links;

-- INSERT: admins only
CREATE POLICY "Admins can insert part supplier links"
  ON part_supplier_links FOR INSERT
  WITH CHECK (public.current_user_is_admin());

-- UPDATE: admins only
CREATE POLICY "Admins can update part supplier links"
  ON part_supplier_links FOR UPDATE
  USING (public.current_user_is_admin());

-- DELETE: admins only
CREATE POLICY "Admins can delete part supplier links"
  ON part_supplier_links FOR DELETE
  USING (public.current_user_is_admin());
