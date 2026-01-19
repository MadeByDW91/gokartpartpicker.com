-- ============================================================================
-- GoKart Part Picker - Profile Preferences & User Data
-- Created: 2026-01-16
-- Description: Add user preferences and data collection fields to profiles
-- ============================================================================

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS build_goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_range TEXT CHECK (budget_range IN ('under-500', '500-1000', '1000-2000', '2000-5000', '5000-plus')),
ADD COLUMN IF NOT EXISTS primary_use_case TEXT CHECK (primary_use_case IN ('racing', 'recreation', 'kids', 'work', 'competition', 'other')),
ADD COLUMN IF NOT EXISTS interested_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_builds_publicly BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for active users
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC);

-- Create index for experience level (for filtering/recommendations)
CREATE INDEX IF NOT EXISTS idx_profiles_experience ON profiles(experience_level);

-- Update last_active_at trigger function
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We'll trigger this from the application layer when users interact
-- For now, we'll update it manually or via a scheduled job

COMMENT ON COLUMN profiles.bio IS 'User bio/description';
COMMENT ON COLUMN profiles.location IS 'User location (city, state, country)';
COMMENT ON COLUMN profiles.experience_level IS 'User experience level for personalized recommendations';
COMMENT ON COLUMN profiles.build_goals IS 'Array of build goals: speed, torque, budget, beginner, competition, kids';
COMMENT ON COLUMN profiles.budget_range IS 'Budget range for build recommendations';
COMMENT ON COLUMN profiles.primary_use_case IS 'Primary use case for go-kart';
COMMENT ON COLUMN profiles.interested_categories IS 'Part categories user is interested in';
COMMENT ON COLUMN profiles.newsletter_subscribed IS 'Whether user wants newsletter emails';
COMMENT ON COLUMN profiles.email_notifications IS 'Whether user wants email notifications';
COMMENT ON COLUMN profiles.public_profile IS 'Whether profile is publicly visible';
COMMENT ON COLUMN profiles.show_builds_publicly IS 'Whether user builds are shown publicly';
COMMENT ON COLUMN profiles.referral_source IS 'Where user came from (for tracking)';
COMMENT ON COLUMN profiles.last_active_at IS 'Last time user was active on the site';
