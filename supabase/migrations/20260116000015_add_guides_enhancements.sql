-- ============================================================================
-- Guides System Enhancements
-- Created: 2026-01-16
-- Description: Enhance content table for installation guides with better metadata
-- ============================================================================

-- Add guide-specific columns to content table
ALTER TABLE content
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS related_engine_id UUID REFERENCES engines(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS related_part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Create index for guide categories
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category) WHERE content_type = 'guide';
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content(difficulty_level) WHERE content_type = 'guide';
CREATE INDEX IF NOT EXISTS idx_content_related_engine ON content(related_engine_id) WHERE related_engine_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_related_part ON content(related_part_id) WHERE related_part_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN content.estimated_time_minutes IS 'Estimated time to complete the guide in minutes';
COMMENT ON COLUMN content.difficulty_level IS 'Difficulty level: beginner, intermediate, advanced, expert';
COMMENT ON COLUMN content.related_engine_id IS 'Engine this guide is related to (if applicable)';
COMMENT ON COLUMN content.related_part_id IS 'Part this guide is related to (if applicable)';
COMMENT ON COLUMN content.category IS 'Guide category (e.g., Installation, Maintenance, Performance, Safety)';
COMMENT ON COLUMN content.tags IS 'Array of tags for searching and filtering';
COMMENT ON COLUMN content.featured_image_url IS 'Featured image for the guide card';
COMMENT ON COLUMN content.views_count IS 'Number of times this guide has been viewed';
COMMENT ON COLUMN content.helpful_count IS 'Number of users who found this guide helpful';

-- Create guide_steps table for step-by-step instructions
CREATE TABLE IF NOT EXISTS guide_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  warning TEXT,
  tips TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_guide_step UNIQUE (guide_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_guide_steps_guide ON guide_steps(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_steps_sort ON guide_steps(guide_id, sort_order);

COMMENT ON TABLE guide_steps IS 'Step-by-step instructions for installation guides';
COMMENT ON COLUMN guide_steps.step_number IS 'Step number in the sequence';
COMMENT ON COLUMN guide_steps.warning IS 'Safety warning or important note for this step';
COMMENT ON COLUMN guide_steps.tips IS 'Helpful tips for completing this step';

-- Create guide_helpful table to track user feedback
CREATE TABLE IF NOT EXISTS guide_helpful (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_guide_helpful UNIQUE (guide_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_guide_helpful_guide ON guide_helpful(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_helpful_user ON guide_helpful(user_id);

COMMENT ON TABLE guide_helpful IS 'Tracks user feedback on guides (helpful/not helpful)';

-- RLS Policies for guide_steps (public read, admin write)
ALTER TABLE guide_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to guide steps"
ON guide_steps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM content 
    WHERE content.id = guide_steps.guide_id 
    AND content.is_published = TRUE
  )
);

CREATE POLICY "Allow admins to manage guide steps"
ON guide_steps FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- RLS Policies for guide_helpful (authenticated users can vote)
ALTER TABLE guide_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to vote on guides"
ON guide_helpful FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public read access to guide helpful votes"
ON guide_helpful FOR SELECT
USING (TRUE);
