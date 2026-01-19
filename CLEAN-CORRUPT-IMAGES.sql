-- Clean Corrupt Image URLs
-- This script identifies and cleans corrupt or invalid image URLs
-- Run this in Supabase SQL Editor

-- 1. Find engines with potentially corrupt image URLs
SELECT 
  id,
  name,
  brand,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN 'NULL'
    WHEN image_url = '' THEN 'EMPTY'
    WHEN image_url NOT LIKE 'http%' THEN 'INVALID_PROTOCOL'
    WHEN image_url LIKE '% %' THEN 'HAS_SPACES'
    WHEN LENGTH(image_url) > 500 THEN 'TOO_LONG'
    ELSE 'OK'
  END as url_status
FROM engines
WHERE 
  image_url IS NOT NULL 
  AND (
    image_url = '' 
    OR image_url NOT LIKE 'http%'
    OR image_url LIKE '% %'
    OR LENGTH(image_url) > 500
  )
ORDER BY url_status;

-- 2. Find parts with potentially corrupt image URLs
SELECT 
  id,
  name,
  category,
  brand,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN 'NULL'
    WHEN image_url = '' THEN 'EMPTY'
    WHEN image_url NOT LIKE 'http%' THEN 'INVALID_PROTOCOL'
    WHEN image_url LIKE '% %' THEN 'HAS_SPACES'
    WHEN LENGTH(image_url) > 500 THEN 'TOO_LONG'
    ELSE 'OK'
  END as url_status
FROM parts
WHERE 
  image_url IS NOT NULL 
  AND (
    image_url = '' 
    OR image_url NOT LIKE 'http%'
    OR image_url LIKE '% %'
    OR LENGTH(image_url) > 500
  )
ORDER BY url_status;

-- 3. CLEAN: Remove empty or invalid image URLs from engines
-- Uncomment to execute:
/*
UPDATE engines
SET image_url = NULL
WHERE 
  image_url IS NOT NULL 
  AND (
    image_url = '' 
    OR image_url NOT LIKE 'http%'
    OR image_url LIKE '% %'
    OR LENGTH(image_url) > 500
  );
*/

-- 4. CLEAN: Remove empty or invalid image URLs from parts
-- Uncomment to execute:
/*
UPDATE parts
SET image_url = NULL
WHERE 
  image_url IS NOT NULL 
  AND (
    image_url = '' 
    OR image_url NOT LIKE 'http%'
    OR image_url LIKE '% %'
    OR LENGTH(image_url) > 500
  );
*/

-- 5. Find images with very long URLs (potential corruption)
SELECT 
  'engine' as table_name,
  id,
  name,
  LENGTH(image_url) as url_length,
  image_url
FROM engines
WHERE image_url IS NOT NULL AND LENGTH(image_url) > 300
UNION ALL
SELECT 
  'part' as table_name,
  id,
  name,
  LENGTH(image_url) as url_length,
  image_url
FROM parts
WHERE image_url IS NOT NULL AND LENGTH(image_url) > 300
ORDER BY url_length DESC
LIMIT 20;
