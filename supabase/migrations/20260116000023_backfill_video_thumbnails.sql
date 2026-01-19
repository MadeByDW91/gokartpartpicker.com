-- ============================================================================
-- 1) Use mqdefault (more reliable than hqdefault for some videos)
-- 2) Backfill thumbnail_url for any video with a real YouTube video_url but NULL thumbnail
--    (catches rows filled after 20260116000018 or where the trigger didn't run)
-- Idempotent: only touches rows where thumbnail_url IS NULL.
-- ============================================================================

-- 1) Update trigger to use mqdefault going forward
CREATE OR REPLACE FUNCTION videos_auto_thumbnail()
RETURNS TRIGGER AS $$
DECLARE
  yt_id text;
BEGIN
  IF NEW.thumbnail_url IS NOT NULL AND NEW.thumbnail_url != '' THEN
    RETURN NEW;
  END IF;
  IF NEW.video_url IS NULL OR NEW.video_url = '' THEN
    RETURN NEW;
  END IF;

  yt_id := (regexp_match(NEW.video_url, '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1];
  IF yt_id IS NULL OR yt_id ~ '^(PLACEHOLDER|EXAMPLE)' THEN
    RETURN NEW;
  END IF;

  NEW.thumbnail_url := 'https://i.ytimg.com/vi/' || yt_id || '/mqdefault.jpg';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Backfill: set thumbnail_url for videos with real YouTube URL and NULL thumbnail
UPDATE videos v
SET thumbnail_url = 'https://i.ytimg.com/vi/' || sub.yt_id || '/mqdefault.jpg'
FROM (
  SELECT 
    id AS vid,
    (regexp_match(video_url, '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1] AS yt_id
  FROM videos
  WHERE (thumbnail_url IS NULL OR thumbnail_url = '')
    AND video_url IS NOT NULL 
    AND video_url ~ '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)[a-zA-Z0-9_-]{11}'
) sub
WHERE v.id = sub.vid 
  AND sub.yt_id IS NOT NULL 
  AND sub.yt_id !~ '^(PLACEHOLDER|EXAMPLE)';
