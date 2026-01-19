-- ============================================================================
-- QUICK FIX FOR REGISTRATION ERROR
-- Copy and paste this entire file into Supabase SQL Editor and run it
-- ============================================================================

-- Step 1: Drop and recreate the trigger with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

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
  
  -- Clean and validate username
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
  
  -- Ensure minimum length (3 chars)
  IF LENGTH(v_username) < 3 THEN
    v_username := 'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  END IF;
  
  -- Ensure maximum length (30 chars)
  IF LENGTH(v_username) > 30 THEN
    v_username := LEFT(v_username, 30);
  END IF;
  
  -- Handle duplicates by appending user ID
  IF EXISTS (SELECT 1 FROM profiles WHERE username = v_username) THEN
    v_username := LEFT(v_username, 22) || '_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 7);
  END IF;
  
  -- Insert profile with conflict handling
  INSERT INTO profiles (id, email, username, role)
  VALUES (NEW.id, NEW.email, v_username, 'user')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(profiles.username, EXCLUDED.username);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Fallback: use UUID-based username
    INSERT INTO profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 12),
      'user'
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Don't fail user creation if profile creation fails
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 2: Ensure RLS policies allow the trigger to work
-- Note: SECURITY DEFINER functions bypass RLS, but we'll add a policy for safety

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policy that allows users to insert their own profile
-- (The trigger uses SECURITY DEFINER so it bypasses RLS, but this helps)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Test query to check if function exists
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
