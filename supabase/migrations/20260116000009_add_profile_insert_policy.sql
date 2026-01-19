-- ============================================================================
-- Add INSERT Policy for Profiles (for trigger)
-- Created: 2026-01-16
-- Description: Allow the trigger to insert profiles even with RLS enabled
-- ============================================================================

-- The trigger uses SECURITY DEFINER, but we should also have a policy
-- that allows the service role to insert profiles (for the trigger)

-- Note: SECURITY DEFINER functions bypass RLS, but having an explicit policy
-- is good practice and can help with debugging

-- Allow authenticated users to insert their own profile
-- Note: The trigger uses SECURITY DEFINER which bypasses RLS,
-- but this policy helps if the trigger needs to run as the user
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
