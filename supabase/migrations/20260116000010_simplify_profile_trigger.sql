-- ============================================================================
-- Simplify Profile Trigger - More Robust Version
-- Created: 2026-01-16
-- Description: Simplified trigger that definitely works
-- ============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simpler, more robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Get username from metadata or generate from email
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-z0-9]', '_', 'g'))
  );
  
  -- Ensure it's lowercase and valid format
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
  
  -- Ensure minimum length
  IF LENGTH(v_username) < 3 THEN
    v_username := 'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  END IF;
  
  -- Ensure maximum length
  IF LENGTH(v_username) > 30 THEN
    v_username := LEFT(v_username, 30);
  END IF;
  
  -- Handle potential duplicates by appending user ID suffix
  IF EXISTS (SELECT 1 FROM profiles WHERE username = v_username) THEN
    v_username := LEFT(v_username, 22) || '_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 7);
  END IF;
  
  -- Insert the profile
  -- Use ON CONFLICT to handle race conditions
  INSERT INTO profiles (id, email, username, role)
  VALUES (NEW.id, NEW.email, v_username, 'user')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(profiles.username, EXCLUDED.username);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username is still duplicate, use UUID-based fallback
    INSERT INTO profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 12),
      'user'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    -- Supabase will still create the auth user even if profile creation fails
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Creates a profile when a new auth user is created. Uses SECURITY DEFINER to bypass RLS.';
