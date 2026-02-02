-- ============================================================================
-- Enforce at most one video per YouTube ID (no duplicates)
-- App-level checks already prevent duplicates; this adds a DB safeguard.
-- Placeholder URLs are excluded from the index.
--
-- If this migration fails with "duplicate key", you have existing duplicate
-- YouTube IDs. Use Admin → Videos to remove duplicates, or run a one-off
-- de-dupe script, then re-run the migration.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_youtube_id_unique
ON videos ((
  (regexp_match(video_url, '(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1]
))
WHERE video_url IS NOT NULL
  AND video_url ~ '(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)[a-zA-Z0-9_-]{11}'
  AND (regexp_match(video_url, '(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1] !~ '^(PLACEHOLDER|EXAMPLE)';

COMMENT ON INDEX idx_videos_youtube_id_unique IS 'One video per YouTube ID; placeholders excluded';
