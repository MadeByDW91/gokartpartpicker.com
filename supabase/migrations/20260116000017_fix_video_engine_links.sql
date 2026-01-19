-- ============================================================================
-- Fix videos about one engine that were wrongly linked to another
-- E.g. "Predator 212 Ghost" content was linked to predator-212-hemi; move to
-- predator-ghost so each engine page only shows videos for that engine.
-- ============================================================================

-- Ghost content wrongly on Hemi → move to predator-ghost
UPDATE videos
SET engine_id = (SELECT id FROM engines WHERE slug = 'predator-ghost')
WHERE engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi')
  AND (title ILIKE '%ghost%' OR description ILIKE '%ghost%');
