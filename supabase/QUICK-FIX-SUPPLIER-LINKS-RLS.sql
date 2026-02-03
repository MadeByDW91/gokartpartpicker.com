-- ============================================================================
-- All-in-one: Create part_supplier_links table (if missing) + correct RLS
-- Run in Supabase SQL Editor. Safe to run multiple times.
-- ============================================================================

-- 1) Ensure current_user_is_admin() exists (needed for RLS)
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

-- 2) Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS part_supplier_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  supplier_name VARCHAR(100) NOT NULL,
  supplier_url TEXT NOT NULL,
  price DECIMAL(10,2),
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  availability_status VARCHAR(20) DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'out_of_stock', 'unknown')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_part_supplier_links_part ON part_supplier_links(part_id);
CREATE INDEX IF NOT EXISTS idx_part_supplier_links_active ON part_supplier_links(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_part_supplier_links_order ON part_supplier_links(part_id, display_order);

-- 3) Enable RLS and drop old policy if it exists (from an older migration)
ALTER TABLE part_supplier_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Part supplier links are editable by admins" ON part_supplier_links;

-- 4) SELECT: everyone can read
DROP POLICY IF EXISTS "Part supplier links are viewable by everyone" ON part_supplier_links;
CREATE POLICY "Part supplier links are viewable by everyone"
  ON part_supplier_links FOR SELECT
  USING (true);

-- 5) INSERT / UPDATE / DELETE: admins only (uses current_user_is_admin so it works with profiles RLS)
CREATE POLICY "Admins can insert part supplier links"
  ON part_supplier_links FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can update part supplier links"
  ON part_supplier_links FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete part supplier links"
  ON part_supplier_links FOR DELETE
  USING (public.current_user_is_admin());
