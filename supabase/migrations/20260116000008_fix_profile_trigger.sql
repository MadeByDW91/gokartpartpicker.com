-- Fix Profile Creation Trigger
-- Created: 2026-01-16
-- Description: Improve handle_new_user trigger to handle edge cases
-- ============================================================================

-- Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_base_username TEXT;
  v_counter INTEGER := 0;
BEGIN
  -- Extract username from metadata or use email prefix
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(split_part(NEW.email, '@', 1))
  );
  
  -- Ensure username meets format requirements (lowercase, alphanumeric, underscore)
  -- Remove any invalid characters
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
  
  -- Ensure minimum length (add padding if needed)
  IF LENGTH(v_username) < 3 THEN
    v_username := v_username || '_' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');
  END IF;
  
  -- Ensure maximum length
  IF LENGTH(v_username) > 30 THEN
    v_username := LEFT(v_username, 30);
  END IF;
  
  -- Handle duplicate usernames by appending a number
  v_base_username := v_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := LEFT(v_base_username, 27) || '_' || LPAD(v_counter::TEXT, 2, '0');
    -- Safety check to prevent infinite loop
    IF v_counter > 999 THEN
      v_username := v_base_username || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
      EXIT;-- ============================================================================

    END IF;
  END LOOP;
  
  -- Insert profile
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    v_username
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate if trigger runs twice
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Try to create with minimal data
    BEGIN
      INSERT INTO profiles (id, email, username)
      VALUES (
        NEW.id,
        NEW.email,
        'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
      )
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- If even this fails, just log and continue
        RAISE WARNING 'Failed to create profile with fallback username: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile when a new auth user is created. Handles username conflicts and format validation.';
