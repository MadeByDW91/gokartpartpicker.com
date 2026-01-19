-- ============================================================================
-- Check if videos table exists and show its structure
-- ============================================================================

-- Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'videos'
    ) 
    THEN 'Table "videos" EXISTS ✓'
    ELSE 'Table "videos" DOES NOT EXIST ✗'
  END AS table_status;

-- If table exists, show structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'videos'
ORDER BY ordinal_position;

-- Show row count if table exists
SELECT COUNT(*) as video_count FROM videos;
