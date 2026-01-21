# Fix: Engines Not Showing After Seed

## Problem
Seed SQL runs successfully but engines still don't appear on the website.

## Diagnostic Steps

### Step 1: Verify Data Was Inserted
Run `VERIFY-ENGINES-INSERTED.sql` in Supabase SQL Editor. This will show:
- Total count of engines
- Active count
- List of all engines
- What anon role can see (what frontend sees)
- RLS policy status

### Step 2: Check Common Issues

#### Issue 1: `is_active` is False
**Symptom:** Engines exist but `is_active = false`
**Fix:** Run this to activate them:
```sql
UPDATE engines SET is_active = true WHERE is_active = false;
```

#### Issue 2: RLS Policy Blocking
**Symptom:** Engines exist but anon role can't see them
**Fix:** Check if RLS policy exists:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'engines';
```

Should see: `"Active engines are publicly readable"` with `qual = 'is_active = TRUE OR is_admin()'`

#### Issue 3: Data Inserted to Wrong Database
**Symptom:** Data exists in one project but not the other
**Fix:** Verify you're running seeds in the correct Supabase project (production: `ybtcciyyinxywitfmlhv`)

#### Issue 4: Cache Issue
**Symptom:** Data exists but frontend shows old cached data
**Fix:** 
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server: `cd frontend && npm run dev`

### Step 3: Quick Fix - Force Activate All Engines
If engines exist but aren't active:
```sql
UPDATE engines SET is_active = true;
```

### Step 4: Verify Frontend Can See Data
After fixing, check:
```sql
-- Test as anon (what frontend sees)
SET ROLE anon;
SELECT COUNT(*) FROM engines WHERE is_active = true;
SELECT slug, name FROM engines WHERE is_active = true LIMIT 5;
RESET ROLE;
```

If this returns 0, RLS is blocking. If it returns data, the issue is in the frontend.

## Most Likely Fix

Run this in Supabase SQL Editor:
```sql
-- Check if engines exist
SELECT COUNT(*) as total, 
       COUNT(*) FILTER (WHERE is_active = true) as active 
FROM engines;

-- If total > 0 but active = 0, activate them:
UPDATE engines SET is_active = true WHERE is_active = false;

-- Verify
SELECT COUNT(*) FROM engines WHERE is_active = true;
```
