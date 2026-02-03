-- Add optional variant (e.g. color) columns to part_supplier_links.
-- Run in Supabase SQL Editor if you want to use color/variant per supplier link.
-- Safe to run multiple times.

ALTER TABLE part_supplier_links
  ADD COLUMN IF NOT EXISTS variant_label VARCHAR(50),
  ADD COLUMN IF NOT EXISTS variant_image_url TEXT;

COMMENT ON COLUMN part_supplier_links.variant_label IS 'Optional variant name, e.g. color: Red, Black, Silver';
COMMENT ON COLUMN part_supplier_links.variant_image_url IS 'Optional image URL for this variant';
