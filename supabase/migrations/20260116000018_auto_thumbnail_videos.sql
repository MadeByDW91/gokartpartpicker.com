-- ============================================================================
-- Auto-populate video thumbnail_url from YouTube video_url
-- 1) One-time backfill for existing rows
-- 2) Trigger: on INSERT/UPDATE, set thumbnail_url when null and video_url has a valid YouTube ID
-- ============================================================================

-- 1) Backfill: set thumbnail_url for any video where we can derive from video_url
--    Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
UPDATE videos v
SET thumbnail_url = 'https://i.ytimg.com/vi/' || sub.yt_id || '/hqdefault.jpg'
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

-- 2) Trigger function: auto-set thumbnail when thumbnail_url is empty and video_url has a valid YouTube ID
CREATE OR REPLACE FUNCTION videos_auto_thumbnail()
RETURNS TRIGGER AS $$
DECLARE
  yt_id text;
BEGIN
  -- Only derive when thumbnail is empty
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

  NEW.thumbnail_url := 'https://i.ytimg.com/vi/' || yt_id || '/hqdefault.jpg';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Trigger on INSERT and UPDATE (video_url or thumbnail_url)
DROP TRIGGER IF EXISTS videos_auto_thumbnail_trigger ON videos;
CREATE TRIGGER videos_auto_thumbnail_trigger
  BEFORE INSERT OR UPDATE OF video_url, thumbnail_url
  ON videos
  FOR EACH ROW
  EXECUTE FUNCTION videos_auto_thumbnail();
