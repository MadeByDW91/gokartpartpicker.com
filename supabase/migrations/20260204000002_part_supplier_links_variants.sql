-- Optional variant (e.g. color) per supplier link: label + image URL
ALTER TABLE part_supplier_links
  ADD COLUMN IF NOT EXISTS variant_label VARCHAR(50),
  ADD COLUMN IF NOT EXISTS variant_image_url TEXT;

COMMENT ON COLUMN part_supplier_links.variant_label IS 'Optional variant name, e.g. color: Red, Black, Silver';
COMMENT ON COLUMN part_supplier_links.variant_image_url IS 'Optional image URL for this variant';
