-- ============================================================================
-- Add Harbor Freight Links to Engines
-- Created: 2026-01-16
-- Description: Add direct Harbor Freight product links to engines
-- Note: These are NOT affiliate links - direct links per pricing policy
-- ============================================================================

-- Predator 212 (6.5 HP) - Most common engine
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html'
WHERE (name ILIKE '%predator%212%' OR name ILIKE '%212%') 
  AND displacement_cc = 212
  AND brand ILIKE '%predator%'
  AND (affiliate_url IS NULL OR affiliate_url = '');

-- Predator 420 (13 HP)
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/13-hp-420cc-ohv-horizontal-shaft-gas-engine-epa-60340.html'
WHERE displacement_cc = 420
  AND brand ILIKE '%predator%'
  AND (affiliate_url IS NULL OR affiliate_url = '');

-- Predator 670 V-Twin (22 HP)
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/22-hp-670cc-v-twin-horizontal-shaft-gas-engine-epa-61614.html'
WHERE displacement_cc = 670
  AND brand ILIKE '%predator%'
  AND (affiliate_url IS NULL OR affiliate_url = '');

-- Note: Only updates engines that don't already have affiliate_url set
-- This preserves any manually entered links
