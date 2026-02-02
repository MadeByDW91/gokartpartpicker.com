-- ============================================================================
-- Seed Initial Merchants for Price Comparison
-- Created: 2026-01-24
-- Description: Add 3 core merchants (Amazon, eBay, Harbor Freight)
-- Owner: A1 (Database)
-- ============================================================================

INSERT INTO merchants (name, slug, logo_url, is_active) VALUES
  (
    'Amazon',
    'amazon',
    'https://logo.clearbit.com/amazon.com',
    true
  ),
  (
    'eBay',
    'ebay',
    'https://logo.clearbit.com/ebay.com',
    true
  ),
  (
    'Harbor Freight',
    'harbor-freight',
    'https://logo.clearbit.com/harborfreight.com',
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

COMMENT ON TABLE merchants IS 'Initial seed: Amazon, eBay, Harbor Freight for price comparison MVP';
