-- ============================================================================
-- Update Engine Prices from Harbor Freight
-- Created: 2026-01-16
-- Description: Update all Predator engine prices and affiliate URLs from Harbor Freight
-- Note: Prices as of 2026-01-16. These should be updated periodically.
-- Per PRICING-POLICY.md: Direct links (NOT affiliate links)
-- ============================================================================

-- Predator 79cc (3 HP) - Item 69733
UPDATE engines 
SET 
  price = 119.99,
  affiliate_url = 'https://www.harborfreight.com/3-hp-79cc-ohv-horizontal-shaft-gas-engine-epa-69733.html'
WHERE slug = 'predator-79';

-- Predator 212cc Non-Hemi (6.5 HP) - Item 69730
-- Note: Standard 212cc engine, typically the Non-Hemi variant
UPDATE engines 
SET 
  price = 149.99,
  affiliate_url = 'https://www.harborfreight.com/65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html'
WHERE slug = 'predator-212-non-hemi';

-- Predator 212cc Hemi (6.5 HP) - Item 69730 or 60363
-- Note: Hemi and Non-Hemi often share the same SKU on Harbor Freight
UPDATE engines 
SET 
  price = 149.99,
  affiliate_url = 'https://www.harborfreight.com/65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html'
WHERE slug = 'predator-212-hemi';

-- Predator Ghost 212cc (Racing Engine) - Item 57531
UPDATE engines 
SET 
  price = 329.99,
  affiliate_url = 'https://www.harborfreight.com/brands/predator/racing-engines/212cc-ghost-kart-racing-engine-57531.html'
WHERE slug = 'predator-ghost';

-- Predator 224cc - Need to verify current SKU and price
-- Note: 224cc may be discontinued or rare - keeping existing price if set
UPDATE engines 
SET 
  affiliate_url = 'https://www.harborfreight.com/search?q=predator%20224'
WHERE slug = 'predator-224' AND (affiliate_url IS NULL OR affiliate_url = '');

-- Predator 301cc (8 HP) - Item 62554
UPDATE engines 
SET 
  price = 249.99,
  affiliate_url = 'https://www.harborfreight.com/8-hp-301cc-ohv-horizontal-shaft-gas-engine-epa-62554.html'
WHERE slug = 'predator-301';

-- Predator 420cc (13 HP) - Item 60340
UPDATE engines 
SET 
  price = 379.99,
  affiliate_url = 'https://www.harborfreight.com/13-hp-420cc-ohv-horizontal-shaft-gas-engine-epa-60340.html'
WHERE slug = 'predator-420';

-- Predator 670cc V-Twin (22 HP) - Item 61614
UPDATE engines 
SET 
  price = 949.99,
  affiliate_url = 'https://www.harborfreight.com/22-hp-670cc-v-twin-horizontal-shaft-gas-engine-epa-61614.html'
WHERE slug = 'predator-670';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify prices were updated:
/*
SELECT 
  slug,
  name,
  price,
  affiliate_url,
  CASE 
    WHEN affiliate_url LIKE '%harborfreight%' THEN '✓'
    ELSE '✗'
  END as has_harbor_freight_link
FROM engines
WHERE brand ILIKE '%predator%'
ORDER BY displacement_cc;
*/

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. Prices are current as of 2026-01-16
-- 2. Prices may vary with promotions, coupons, or store location
-- 3. Harbor Freight periodically runs sales - prices should be updated monthly
-- 4. For price monitoring, consider automated price checking script
-- 5. All affiliate_url links are direct (non-affiliate) per PRICING-POLICY.md
