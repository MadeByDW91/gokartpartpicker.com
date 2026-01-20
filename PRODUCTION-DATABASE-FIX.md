# Production Database Not Loading - Diagnostic & Fix Guide

> **Issue:** Parts, Engines, and Templates not showing on live website (gokartpartpicker.com)

## 🔍 Diagnostic Checklist

### 1. **Environment Variables in Vercel** ⚠️ MOST LIKELY ISSUE

The production site needs Supabase credentials configured in Vercel.

**Check Vercel Environment Variables:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `gokartpartpicker.com` project
3. Go to **Settings** → **Environment Variables**
4. Verify these variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**If missing, add them:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**After adding variables:**
- Redeploy the site (Vercel will auto-redeploy or trigger manually)
- Wait for deployment to complete

### 2. **Production Database Migrations**

Your production Supabase database needs all migrations run.

**Check if migrations are applied:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Go to **SQL Editor**
4. Run this query to check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('engines', 'parts', 'build_templates');
```

**If tables don't exist, run migrations:**
1. Go to **SQL Editor** in Supabase Dashboard
2. Run each migration file in order from `supabase/migrations/`:
   - `20260116000001_initial_schema.sql`
   - `20260116000002_rls_policies.sql`
   - `20260116000004_seed_engines.sql`
   - `20260116000006_seed_parts.sql`
   - `20260116000011_add_build_templates.sql`
   - (and all other migrations)

### 3. **RLS Policies - Public Read Access**

Verify RLS policies allow public (anonymous) users to read data.

**Check RLS policies:**
```sql
-- Check engines policy
SELECT * FROM pg_policies WHERE tablename = 'engines';

-- Check parts policy  
SELECT * FROM pg_policies WHERE tablename = 'parts';

-- Check templates policy
SELECT * FROM pg_policies WHERE tablename = 'build_templates';
```

**Expected policies:**
- `engines`: "Active engines are publicly readable" - `USING (is_active = TRUE OR is_admin())`
- `parts`: "Active parts are publicly readable" - `USING (is_active = TRUE OR is_admin())`
- `build_templates`: "Approved public templates are viewable by everyone" - `USING (is_public = true AND is_active = true AND approval_status = 'approved')`

### 4. **Database Seed Data**

Verify data exists in production database.

**Check if data exists:**
```sql
-- Check engines count
SELECT COUNT(*) FROM engines WHERE is_active = true;

-- Check parts count
SELECT COUNT(*) FROM parts WHERE is_active = true;

-- Check templates count
SELECT COUNT(*) FROM build_templates 
WHERE is_public = true 
  AND is_active = true 
  AND approval_status = 'approved';
```

**If counts are 0:**
- Run seed migrations: `20260116000004_seed_engines.sql` and `20260116000006_seed_parts.sql`
- Or manually add data through Supabase Dashboard

### 5. **Browser Console Errors**

Check browser console on live site for errors.

**Common errors:**
- `Supabase is not configured` → Environment variables missing
- `Failed to fetch` → Network/CORS issue or wrong Supabase URL
- `permission denied` → RLS policy blocking access
- `relation does not exist` → Migrations not run

### 6. **Supabase Project Connection**

Verify the Supabase project URL and keys are correct.

**Get correct values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Verify in Vercel:**
- Make sure these match exactly (no extra spaces, correct project)

## 🛠️ Quick Fix Steps

### Step 1: Verify Vercel Environment Variables
```bash
# Check if variables are set (you'll need to do this in Vercel dashboard)
# Go to: Project → Settings → Environment Variables
```

### Step 2: Run Database Migrations in Production
1. Open Supabase Dashboard → SQL Editor
2. Copy and run each migration file from `supabase/migrations/` in order
3. Verify tables exist with: `SELECT * FROM engines LIMIT 1;`

### Step 3: Verify RLS Policies
Run this in Supabase SQL Editor:
```sql
-- Verify engines can be read publicly
SELECT * FROM engines WHERE is_active = true LIMIT 1;

-- Verify parts can be read publicly  
SELECT * FROM parts WHERE is_active = true LIMIT 1;

-- Verify templates can be read publicly
SELECT * FROM build_templates 
WHERE is_public = true 
  AND is_active = true 
  AND approval_status = 'approved' 
LIMIT 1;
```

### Step 4: Redeploy Vercel
After fixing environment variables:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger auto-deploy

### Step 5: Test Live Site
1. Open https://gokartpartpicker.com
2. Open browser DevTools (F12) → Console tab
3. Check for errors
4. Try navigating to:
   - `/engines` - Should show engines
   - `/parts` - Should show parts
   - `/templates` - Should show templates

## 🔧 Common Issues & Solutions

### Issue: "Supabase is not configured"
**Solution:** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel environment variables

### Issue: "relation does not exist"
**Solution:** Run database migrations in Supabase SQL Editor

### Issue: "permission denied for table"
**Solution:** Check RLS policies allow public SELECT access

### Issue: Data exists but not showing
**Solution:** 
- Check `is_active = true` for engines/parts
- Check `is_public = true AND is_active = true AND approval_status = 'approved'` for templates
- Verify RLS policies match these conditions

### Issue: Wrong Supabase project
**Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` in Vercel matches your production Supabase project URL

## 📋 Verification Checklist

- [ ] Vercel environment variables set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] All migrations run in production Supabase database
- [ ] RLS policies allow public read access
- [ ] Seed data exists in production database
- [ ] Vercel deployment completed successfully
- [ ] Browser console shows no Supabase errors
- [ ] Live site displays engines, parts, and templates

## 🚨 Emergency Fix (If Nothing Works)

1. **Create a test query endpoint** to verify connection:
   - Add a test API route that queries Supabase directly
   - Check if it returns data

2. **Check Supabase project status:**
   - Verify project is not paused
   - Check project usage limits
   - Verify billing is active (if on paid plan)

3. **Temporary workaround:**
   - Use service role key (NOT recommended for production, but can test)
   - Only for debugging - remove after fixing

---

**Next Steps:** After fixing, monitor the live site and check browser console for any remaining errors.
