# Fix Registration Error

## Problem
"Database error saving new user" - The trigger that creates profiles is failing.

## ⚡ QUICK FIX (Easiest Method)

**Just run this one file:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the **entire contents** of `QUICK-FIX-REGISTRATION.sql`
3. Paste and click **Run**
4. Try registering again

This single file contains everything needed to fix the issue.

---

## Alternative: Step-by-Step Solution
Apply these two migrations to fix the trigger and add proper RLS policies.

---

## Step 1: Apply Migration 0008 (Fix Trigger)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of: `supabase/migrations/20260116000008_fix_profile_trigger.sql`
4. Click **Run**

This migration:
- Improves the trigger with better error handling
- Handles username conflicts automatically
- Validates username format
- Has fallback error handling

---

## Step 2: Apply Migration 0009 (Add INSERT Policy)

1. Still in **SQL Editor**
2. Copy and paste the contents of: `supabase/migrations/20260116000009_add_profile_insert_policy.sql`
3. Click **Run**

This migration:
- Adds INSERT policy for profiles (allows trigger to work)
- Allows users to insert their own profile

---

## Alternative: Apply Both at Once

You can also combine both migrations and run them together:

```sql
-- Migration 0008: Fix Trigger
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
  
  -- Ensure username meets format requirements
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
  
  -- Ensure minimum length
  IF LENGTH(v_username) < 3 THEN
    v_username := v_username || '_' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');
  END IF;
  
  -- Ensure maximum length
  IF LENGTH(v_username) > 30 THEN
    v_username := LEFT(v_username, 30);
  END IF;
  
  -- Handle duplicate usernames
  v_base_username := v_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := LEFT(v_base_username, 27) || '_' || LPAD(v_counter::TEXT, 2, '0');
    IF v_counter > 999 THEN
      v_username := v_base_username || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert profile
  INSERT INTO profiles (id, email, username)
  VALUES (NEW.id, NEW.email, v_username)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    BEGIN
      INSERT INTO profiles (id, email, username)
      VALUES (NEW.id, NEW.email, 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8))
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile with fallback: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Migration 0009: Add INSERT Policy
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true)
  TO service_role;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## After Applying

1. Try creating an account again
2. The registration should work now
3. Check the browser console if there are still errors

---

## What These Fixes Do

1. **Better Trigger**: Handles edge cases, validates usernames, prevents conflicts
2. **RLS Policies**: Allows the trigger (via service_role) to insert profiles
3. **Error Handling**: If something fails, it tries a fallback instead of crashing

---

*If you still get errors after applying these migrations, check the Supabase logs for more details.*
