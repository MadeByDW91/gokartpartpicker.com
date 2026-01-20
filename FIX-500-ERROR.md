# Fix 500 Internal Server Error - Production Database

## Problem
The live website is showing 500 Internal Server Errors for engines, parts, and forums pages. This indicates a server-side issue with database connectivity.

## Root Cause
The server-side Supabase client was returning a mock client when environment variables were missing, but the mock didn't properly handle database queries, causing 500 errors.

## Solution Applied

### 1. Improved Server Client Error Handling
- **File:** `frontend/src/lib/supabase/server.ts`
- **Change:** In production, throw an error instead of returning a broken mock client
- **Result:** Server actions will now fail gracefully with proper error messages

### 2. Added Configuration Checks
- **Files:** 
  - `frontend/src/actions/engines.ts`
  - `frontend/src/actions/parts.ts`
  - `frontend/src/actions/forums.ts`
- **Change:** Added explicit checks for Supabase configuration before running queries
- **Result:** Better error messages when database is not configured

## Verification Steps

### Step 1: Check Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Test Health Endpoint
Visit: `https://gokartpartpicker.com/api/health/database`

**Expected Result:**
```json
{
  "status": "healthy",
  "checks": {
    "engines": { "exists": true, "count": 10 },
    "parts": { "exists": true, "count": 50 }
  }
}
```

**If you see errors:**
- `"Supabase environment variables not configured"` → Add variables in Vercel
- `"exists": false` → Run migrations in Supabase
- `"count": 0` → Run seed migrations

### Step 3: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Check for error logs showing:
   - "Supabase not configured"
   - "Database connection not configured"
   - Any Supabase-related errors

### Step 4: Verify Database Migrations
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Go to **SQL Editor**
4. Run this query to check tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('engines', 'parts', 'forum_categories');
```

If tables don't exist, run migrations from `supabase/migrations/` folder.

## Common Issues & Fixes

### Issue: "Supabase not configured" error
**Fix:** 
1. Get your Supabase credentials from [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API
2. Add to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon/public key
3. Redeploy on Vercel

### Issue: Tables don't exist
**Fix:**
1. Go to Supabase SQL Editor
2. Run all migration files from `supabase/migrations/` in order
3. Start with `20260116000001_initial_schema.sql`

### Issue: Tables exist but empty
**Fix:**
1. Run seed migrations:
   - `20260116000004_seed_engines.sql`
   - `20260116000006_seed_parts.sql`

### Issue: RLS policies blocking access
**Fix:**
1. Verify RLS policies allow public read:
```sql
-- Check engines policy
SELECT * FROM pg_policies WHERE tablename = 'engines';

-- Should see: "Active engines are publicly readable"
```

## After Fixing

1. **Redeploy on Vercel:**
   - After adding environment variables, Vercel will auto-redeploy
   - Or manually trigger a redeploy

2. **Test Live Site:**
   - Visit `https://gokartpartpicker.com/engines`
   - Visit `https://gokartpartpicker.com/parts`
   - Visit `https://gokartpartpicker.com/forums`
   - All should load without 500 errors

3. **Monitor:**
   - Check Vercel logs for any remaining errors
   - Use browser DevTools → Console to check for client-side errors

## Next Steps

If errors persist after fixing environment variables:
1. Check Vercel function logs for specific error messages
2. Verify Supabase project is active and not paused
3. Check Supabase project usage limits
4. Verify RLS policies are correctly configured

---

**Note:** The code changes ensure that missing Supabase configuration will now produce clear error messages instead of causing 500 errors.
