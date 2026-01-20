# Troubleshooting Site Errors

## Quick Diagnostic Steps

### 1. Check Browser Console
1. Open your site in browser
2. Press `F12` (or `Cmd+Option+I` on Mac)
3. Go to **Console** tab
4. Look for red error messages
5. Copy any error messages you see

### 2. Check Network Tab
1. In browser DevTools, go to **Network** tab
2. Refresh the page
3. Look for failed requests (red status codes)
4. Click on failed requests to see error details

### 3. Check Vercel Logs
1. Go to **Vercel Dashboard** → Your Project
2. Click **"Deployments"** tab
3. Click on latest deployment
4. Check **"Function Logs"** for errors
5. Check **"Build Logs"** for build errors

### 4. Check Supabase Logs
1. Go to **Supabase Dashboard** → Your Project
2. Click **"Logs"** in left sidebar
3. Check **"Postgres Logs"** for database errors
4. Check **"API Logs"** for API errors

---

## Common Errors & Fixes

### Error: "Function get_forum_categories_with_counts does not exist"

**Cause:** The database function migration hasn't been run yet.

**Fix:**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open migration file: `supabase/migrations/20260117000002_optimize_forum_category_counts.sql`
3. Copy and paste the SQL
4. Click **"Run"**
5. The function will be created

**Or:** If GitHub auto-migrations are set up, just push the migration file to GitHub and it will run automatically.

---

### Error: "Failed to fetch forum categories"

**Possible Causes:**
1. Forum tables don't exist (migration not run)
2. RLS policies blocking access
3. Database connection issue

**Fix:**
1. Check if forum tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name LIKE 'forum%';
   ```
2. If tables don't exist, run migration: `20260116000021_forums_schema.sql`
3. Check RLS policies are enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' AND tablename LIKE 'forum%';
   ```

---

### Error: "Connection pool exhausted" or "Too many connections"

**Cause:** Not using connection pooling (port 6543).

**Fix:**
1. Update Vercel environment variable `NEXT_PUBLIC_SUPABASE_URL`
2. Add `:6543` to the end: `https://ybtcciyyinxywitfmlhv.supabase.co:6543`
3. Redeploy

See: `VERCEL-ENV-UPDATE-INSTRUCTIONS.md`

---

### Error: "Rate limit function not found"

**Cause:** The `check_rate_limit` function doesn't exist.

**Fix:**
1. Run migration: `20260116000021_forums_schema.sql`
2. This creates the `check_rate_limit` function
3. The function is in the forums schema migration

---

### Error: "Cannot read property of undefined"

**Cause:** Data structure mismatch or missing data.

**Fix:**
1. Check browser console for the exact error
2. Look at which component/action is failing
3. Check if database migration has been run
4. Verify data exists in database

---

## Quick Health Check

Run this SQL in Supabase SQL Editor to check database health:

```sql
-- Check if forum tables exist
SELECT 'forum_categories' as table_name, 
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_categories') as exists
UNION ALL
SELECT 'forum_topics', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_topics')
UNION ALL
SELECT 'forum_posts', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts');

-- Check if functions exist
SELECT 'get_forum_categories_with_counts' as function_name,
       EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_forum_categories_with_counts') as exists
UNION ALL
SELECT 'check_rate_limit', EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_rate_limit');
```

---

## Still Having Issues?

1. **Check the exact error message** in browser console
2. **Check which page/feature** is failing
3. **Check Vercel deployment logs** for server errors
4. **Check Supabase logs** for database errors
5. **Verify migrations have been run** (see above SQL)

Share the specific error message and I can help fix it!
