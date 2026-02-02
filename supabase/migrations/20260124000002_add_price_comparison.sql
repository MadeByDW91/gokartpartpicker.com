-- ============================================================================
-- Price Comparison Feature - Merchants and Product Prices
-- Created: 2026-01-24
-- Description: Add tables for multi-merchant price comparison (simplified MVP)
-- Owner: A1 (Database) + A16 (Build Error Fixer)
-- ============================================================================

-- ============================================================================
-- MERCHANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_active ON merchants(is_active) WHERE is_active = true;

COMMENT ON TABLE merchants IS 'Merchants that sell go-kart parts (Amazon, eBay, Harbor Freight, etc.)';
COMMENT ON COLUMN merchants.name IS 'Display name of merchant (e.g., "Amazon", "eBay")';
COMMENT ON COLUMN merchants.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN merchants.logo_url IS 'URL to merchant logo image';

-- ============================================================================
-- PRODUCT PRICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Essential pricing fields
  price DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (price + shipping_cost) STORED,
  
  -- Availability
  availability_status VARCHAR(20) DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'out_of_stock')),
  
  -- Links
  product_url TEXT NOT NULL,
  affiliate_url TEXT, -- Optional affiliate link
  
  -- Metadata
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one price per part per merchant
  UNIQUE(part_id, merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_product_prices_part ON product_prices(part_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_merchant ON product_prices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_total ON product_prices(total_price);
CREATE INDEX IF NOT EXISTS idx_product_prices_availability ON product_prices(availability_status);

COMMENT ON TABLE product_prices IS 'Multi-merchant prices for parts (simplified MVP - parts only)';
COMMENT ON COLUMN product_prices.part_id IS 'Reference to the part';
COMMENT ON COLUMN product_prices.merchant_id IS 'Reference to the merchant';
COMMENT ON COLUMN product_prices.price IS 'Base price from merchant';
COMMENT ON COLUMN product_prices.shipping_cost IS 'Shipping cost (0 for free shipping)';
COMMENT ON COLUMN product_prices.total_price IS 'Calculated total (price + shipping)';
COMMENT ON COLUMN product_prices.availability_status IS 'Stock status: in_stock or out_of_stock';
COMMENT ON COLUMN product_prices.product_url IS 'Direct link to product page on merchant site';
COMMENT ON COLUMN product_prices.affiliate_url IS 'Optional affiliate link (if applicable)';

-- ============================================================================
-- UPDATE TRIGGER FOR last_updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_product_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_prices_updated_at
  BEFORE UPDATE ON product_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_product_prices_updated_at();

-- ============================================================================
-- RLS POLICIES (Public read, Admin write)
-- ============================================================================

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;

-- Merchants: Public read, Admin write
CREATE POLICY "Merchants are viewable by everyone"
  ON merchants FOR SELECT
  USING (true);

CREATE POLICY "Merchants are editable by admins"
  ON merchants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Product Prices: Public read, Admin write
CREATE POLICY "Product prices are viewable by everyone"
  ON product_prices FOR SELECT
  USING (true);

CREATE POLICY "Product prices are editable by admins"
  ON product_prices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
