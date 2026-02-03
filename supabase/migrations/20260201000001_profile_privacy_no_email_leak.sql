-- ============================================================================
-- Profile privacy: stop leaking email to the world
-- Created: 2026-02-01
-- Description: profiles were viewable by everyone (USING (TRUE)), so anyone
-- could SELECT * FROM profiles and get every user's email. This migration
-- adds a public view with only display fields and restricts profiles to
-- owner or admin only.
-- ============================================================================

-- ============================================================================
-- PUBLIC DISPLAY VIEW (no email, no role to anon)
-- ============================================================================

CREATE OR REPLACE VIEW profile_display AS
SELECT id, username, avatar_url
FROM profiles;

COMMENT ON VIEW profile_display IS 'Public slice of profiles for display names/avatars only. No email. Use for forums, builds, templates.';

-- Allow anon and authenticated to read (view runs as owner so can read profiles)
GRANT SELECT ON profile_display TO anon;
GRANT SELECT ON profile_display TO authenticated;

-- ============================================================================
-- RESTRICT PROFILES: only owner or admin can read full profile (including email)
-- ============================================================================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'User can read only their own row (for profile page, header).';
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Admins can read all profiles (admin user list, search).';
