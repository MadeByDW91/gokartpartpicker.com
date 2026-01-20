-- Use hqdefault for new/updated video_url so it matches app-side derivation.
-- VideoCard falls back to mqdefault then default on img load error.
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
  -- Support watch, embed, shorts, youtu.be
  yt_id := (regexp_match(NEW.video_url, '(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1];
  IF yt_id IS NULL OR yt_id ~ '^(PLACEHOLDER|EXAMPLE)' THEN
    RETURN NEW;
  END IF;
  NEW.thumbnail_url := 'https://i.ytimg.com/vi/' || yt_id || '/hqdefault.jpg';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
