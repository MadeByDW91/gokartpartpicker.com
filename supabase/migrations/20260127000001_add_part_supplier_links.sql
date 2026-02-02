-- ============================================================================
-- Part Supplier Links - Multiple Supplier Links for Price Comparison
-- Created: 2026-01-27
-- Description: Allow parts to have multiple supplier links for price comparison
-- Owner: A5 (Admin)
-- ============================================================================

-- ============================================================================
-- PART_SUPPLIER_LINKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS part_supplier_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  
  -- Supplier information
  supplier_name VARCHAR(100) NOT NULL, -- e.g., "Amazon", "eBay", "Harbor Freight"
  supplier_url TEXT NOT NULL, -- Direct link to product page
  
  -- Optional pricing (for price comparison)
  price DECIMAL(10,2), -- Price from this supplier
  shipping_cost DECIMAL(10,2) DEFAULT 0, -- Shipping cost
  availability_status VARCHAR(20) DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'out_of_stock', 'unknown')),
  
  -- Display order (lower = shown first in price comparison)
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  notes TEXT, -- Optional notes about this supplier link
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_part_supplier_links_part ON part_supplier_links(part_id);
CREATE INDEX IF NOT EXISTS idx_part_supplier_links_active ON part_supplier_links(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_part_supplier_links_order ON part_supplier_links(part_id, display_order);

COMMENT ON TABLE part_supplier_links IS 'Multiple supplier links for parts, used for price comparison when there are multiple sellers';
COMMENT ON COLUMN part_supplier_links.supplier_name IS 'Name of the supplier/merchant (e.g., "Amazon", "eBay", "Harbor Freight")';
COMMENT ON COLUMN part_supplier_links.supplier_url IS 'Direct link to the product page on the supplier site';
COMMENT ON COLUMN part_supplier_links.price IS 'Optional price from this supplier (for price comparison)';
COMMENT ON COLUMN part_supplier_links.display_order IS 'Order for display in price comparison (lower = shown first)';
COMMENT ON COLUMN part_supplier_links.availability_status IS 'Stock status: in_stock, out_of_stock, or unknown';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE TRIGGER update_part_supplier_links_updated_at
  BEFORE UPDATE ON part_supplier_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT TRIGGER
-- ============================================================================

CREATE TRIGGER part_supplier_links_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON part_supplier_links
  FOR EACH ROW
  EXECUTE FUNCTION audit_catalog_changes();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE part_supplier_links ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Part supplier links are viewable by everyone"
  ON part_supplier_links FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Part supplier links are editable by admins"
  ON part_supplier_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
