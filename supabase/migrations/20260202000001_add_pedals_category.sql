-- ============================================================================
-- Add Pedals part category
-- Description: Pedals (gas/brake, often sold in pairs) for the builder
-- ============================================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'pedals'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'pedals';
    END IF;
END $$;

-- Seed part_categories so admin and APIs see the new category
INSERT INTO part_categories (slug, name, description, sort_order)
SELECT 'pedals', 'Pedals', 'Gas and brake pedals (often sold in pairs)', 10
WHERE NOT EXISTS (SELECT 1 FROM part_categories WHERE slug = 'pedals');

COMMENT ON TYPE part_category IS 'Part categories including gas engine parts, EV-specific components, tire sub-categories, and pedals';
