-- ============================================================================
-- GoKart Part Picker - Videos Table
-- Created: 2026-01-16
-- Description: Educational/how-to videos linked to engines or parts
-- Owner: Agent A9 (Video Content)
-- ============================================================================

-- ============================================================================
-- VIDEOS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube/Vimeo embed URL or direct link
  thumbnail_url TEXT, -- Video thumbnail image
  duration_seconds INTEGER, -- Video length in seconds
  category TEXT NOT NULL CHECK (category IN (
    'unboxing',
    'installation',
    'maintenance',
    'modification',
    'troubleshooting',
    'tutorial',
    'review',
    'tips'
  )),
  
  -- Link to engine OR part (exclusive)
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  
  -- Metadata
  channel_name TEXT, -- YouTube channel or creator name
  channel_url TEXT, -- Creator channel URL
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_date DATE, -- Original publish date
  language TEXT DEFAULT 'en',
  
  -- Admin management
  is_featured BOOLEAN DEFAULT FALSE, -- Featured videos shown first
  display_order INTEGER DEFAULT 0, -- Sort order within category
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_linked_to_item CHECK (
    (engine_id IS NOT NULL AND part_id IS NULL) OR
    (engine_id IS NULL AND part_id IS NOT NULL)
  ),
  CONSTRAINT video_url_format CHECK (
    video_url ~ '^(https?://)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/' OR
    video_url ~ '^https?://.+\.(mp4|webm|ogg)'
  )
);

CREATE INDEX IF NOT EXISTS idx_videos_engine ON videos(engine_id) WHERE engine_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_part ON videos(part_id) WHERE part_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos(display_order);

COMMENT ON TABLE videos IS 'Educational/how-to videos linked to engines or parts';
COMMENT ON COLUMN videos.video_url IS 'YouTube/Vimeo embed URL or direct video link';
COMMENT ON COLUMN videos.category IS 'Video type: unboxing, installation, maintenance, etc.';
COMMENT ON COLUMN videos.display_order IS 'Sort order within category (lower numbers first)';

-- ============================================================================
-- RLS POLICIES FOR VIDEOS
-- ============================================================================

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Videos are publicly readable (active videos only)
DROP POLICY IF EXISTS "Videos are publicly readable" ON videos;
CREATE POLICY "Videos are publicly readable"
ON videos FOR SELECT
USING (is_active = TRUE);

-- Only admins can manage videos
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
CREATE POLICY "Admins can manage videos"
ON videos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- ============================================================================
-- AUDIT TRIGGER FOR VIDEOS
-- ============================================================================

-- Add audit trigger (reuses existing audit_catalog_changes, which calls log_audit_action)
DROP TRIGGER IF EXISTS videos_audit_trigger ON videos;
CREATE TRIGGER videos_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH ROW
EXECUTE FUNCTION audit_catalog_changes();

-- ============================================================================
-- UPDATE TRIGGER FOR VIDEOS
-- ============================================================================

DROP TRIGGER IF EXISTS videos_updated_at_trigger ON videos;
CREATE TRIGGER videos_updated_at_trigger
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
