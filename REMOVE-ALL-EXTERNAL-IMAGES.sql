-- REMOVE ALL EXTERNAL IMAGE URLS
-- This will set all image_url fields to NULL for engines and parts
-- Use this if images are causing the site to freeze
-- Run this in Supabase SQL Editor

-- WARNING: This will remove ALL image URLs. Make sure you want to do this!

-- 1. Remove all engine image URLs
UPDATE engines
SET image_url = NULL
WHERE image_url IS NOT NULL;

-- 2. Remove all part image URLs  
UPDATE parts
SET image_url = NULL
WHERE image_url IS NOT NULL;

-- 3. Verify the changes
SELECT 
  'engines' as table_name,
  COUNT(*) as total_count,
  COUNT(image_url) as with_images,
  COUNT(*) - COUNT(image_url) as without_images
FROM engines
UNION ALL
SELECT 
  'parts' as table_name,
  COUNT(*) as total_count,
  COUNT(image_url) as with_images,
  COUNT(*) - COUNT(image_url) as without_images
FROM parts;
