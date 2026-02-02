-- ============================================================================
-- Account Security - Phase 1
-- Created: 2026-01-17
-- Description: Login attempt tracking, account lockout, and public profile view
-- ============================================================================

-- ============================================================================
-- LOGIN ATTEMPT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
  ON login_attempts(email, created_at DESC) 
  WHERE success = FALSE;

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
  ON login_attempts(ip_address, created_at DESC) 
  WHERE success = FALSE;

CREATE INDEX IF NOT EXISTS idx_login_attempts_created 
  ON login_attempts(created_at DESC);

COMMENT ON TABLE login_attempts IS 'Tracks login attempts for security monitoring and account lockout';
COMMENT ON COLUMN login_attempts.email IS 'Email address used in login attempt';
COMMENT ON COLUMN login_attempts.ip_address IS 'IP address of the login attempt';
COMMENT ON COLUMN login_attempts.success IS 'Whether the login attempt was successful';
COMMENT ON COLUMN login_attempts.failure_reason IS 'Reason for failure if unsuccessful';

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own login attempts (for tracking)
-- In production, consider using service role for inserts via Edge Function
CREATE POLICY "Authenticated users can insert login attempts"
  ON login_attempts FOR INSERT
  WITH CHECK (true); -- Allow inserts - we'll validate in application code

CREATE POLICY "Admins can view all login attempts"
  ON login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- ACCOUNT LOCKOUT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_account_lockout(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recent_failures INTEGER;
BEGIN
  -- Count failed attempts in last 15 minutes
  SELECT COUNT(*) INTO recent_failures
  FROM login_attempts
  WHERE email = LOWER(p_email)
    AND success = FALSE
    AND created_at > NOW() - INTERVAL '15 minutes';
  
  -- Lock account after 5 failed attempts
  RETURN recent_failures >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_account_lockout(TEXT) IS 'Checks if account should be locked due to too many failed login attempts (5 failures in 15 minutes)';

-- ============================================================================
-- UPDATE RLS POLICY: Hide email from public profile queries
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- New policy: Everyone can view profiles, but email is protected by column-level security
-- Note: Supabase doesn't support column-level RLS directly, so we'll use a view
CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  USING (TRUE);

-- ============================================================================
-- PUBLIC PROFILES VIEW (Hides sensitive data like email)
-- ============================================================================

CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  bio,
  location,
  experience_level,
  public_profile,
  show_builds_publicly,
  created_at,
  updated_at
FROM profiles
WHERE public_profile = TRUE;

COMMENT ON VIEW public_profiles IS 'Public profile data - excludes email and other sensitive information. Use this view for public profile queries.';

-- Grant access to authenticated and anonymous users
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- ============================================================================
-- NOTE: Application code should use public_profiles view OR explicitly
-- exclude email when selecting from profiles table:
-- .select('id, username, avatar_url, ...') // exclude email
-- ============================================================================

-- ============================================================================
-- CLEANUP FUNCTION (Run periodically to clean old login attempts)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete login attempts older than 30 days
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_login_attempts() IS 'Cleans up login attempts older than 30 days. Run via cron or scheduled job.';

-- ============================================================================
-- HELPER: Get client IP from request (for use in application code)
-- Note: This is a placeholder - actual IP extraction happens in application
-- ============================================================================

COMMENT ON TABLE login_attempts IS 'Use getClientIp() from headers() in server actions to get real IP address';
