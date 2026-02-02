-- ============================================================================
-- Fix "Database error saving new user" - Bulletproof handle_new_user trigger
-- Created: 2026-01-24
-- Description: Trigger must NEVER abort the auth transaction. Use nested
--   exception handling so fallback inserts never propagate.
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_username TEXT;
  v_uuid_suffix TEXT;
BEGIN
  v_uuid_suffix := REPLACE(NEW.id::TEXT, '-', '');

  -- Build username from metadata or email
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-z0-9]', '_', 'g'))
  );
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));

  IF LENGTH(v_username) < 3 THEN
    v_username := 'user_' || SUBSTRING(v_uuid_suffix, 1, 8);
  END IF;
  IF LENGTH(v_username) > 30 THEN
    v_username := LEFT(v_username, 30);
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE username = v_username) THEN
    v_username := LEFT(v_username, 22) || '_' || SUBSTRING(v_uuid_suffix, 1, 7);
  END IF;

  -- Attempt 1: primary insert
  BEGIN
    INSERT INTO profiles (id, email, username, role)
    VALUES (NEW.id, NEW.email, v_username, 'user')
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = COALESCE(profiles.username, EXCLUDED.username);
    RETURN NEW;
  EXCEPTION
    WHEN unique_violation THEN
      NULL; /* fall through to attempt 2 */
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: attempt 1 failed for %: %', NEW.id, SQLERRM;
      NULL; /* fall through */
  END;

  -- Attempt 2: UUID-based username (guaranteed unique per user)
  BEGIN
    INSERT INTO profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      'user_' || SUBSTRING(v_uuid_suffix, 1, 12),
      'user'
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: attempt 2 failed for %: %', NEW.id, SQLERRM;
      NULL;
  END;

  -- Attempt 3: minimal username 'u_' + 28 chars (length 30)
  BEGIN
    INSERT INTO profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      'u_' || SUBSTRING(v_uuid_suffix, 1, 28),
      'user'
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: attempt 3 failed for %: %', NEW.id, SQLERRM;
      -- Still return NEW so auth user is created; profile may be missing.
      -- Check Postgres logs and create profile manually if needed.
      RETURN NEW;
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Creates profile on signup. Never aborts auth transaction; uses nested exception handling.';
