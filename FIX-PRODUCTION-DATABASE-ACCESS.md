# Fix Production Database Access - Quick Guide

## 🚨 Issue: Engines and Parts Not Showing on Live Site

The live website (gokartpartpicker.com) is showing empty databases. This is almost certainly one of these issues:

## ✅ Step 1: Check Vercel Environment Variables (MOST LIKELY)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your `gokartpartpicker.com` project

2. **Go to Settings → Environment Variables**

3. **Verify these are set:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Should be: `https://ybtcciyyinxywitfmlhv.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

4. **If missing, add them:**
   - Click "Add New"
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://ybtcciyyinxywitfmlhv.supabase.co`
   - Environment: Production (and Preview if needed)
   - Click "Save"
   
   - Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **After adding variables:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or wait for auto-redeploy

## ✅ Step 2: Check Production Database Has Data

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project (reference: `ybtcciyyinxywitfmlhv`)

2. **Go to SQL Editor**

3. **Run this query to check if data exists:**
```sql
-- Check engines
SELECT COUNT(*) as engine_count FROM engines WHERE is_active = true;

-- Check parts
SELECT COUNT(*) as part_count FROM parts WHERE is_active = true;

-- Check templates
SELECT COUNT(*) as template_count FROM build_templates 
WHERE is_public = true AND is_active = true AND approval_status = 'approved';
```

4. **If counts are 0, you need to run migrations:**
   - Go to SQL Editor
   - Copy and paste each migration file from `supabase/migrations/` in order
   - Start with: `20260116000001_initial_schema.sql`
   - Then: `20260116000002_rls_policies.sql`
   - Then: `20260116000004_seed_engines.sql`
   - Then: `20260116000006_seed_parts.sql`
   - (Continue with all other migrations)

## ✅ Step 3: Test Database Connection

Visit this URL on your live site to test the connection:
```
https://gokartpartpicker.com/api/health/database
```

This should return JSON showing:
- `env_configured: true`
- `database_connected: true`
- `tables.engines.exists: true` and `count > 0`
- `tables.parts.exists: true` and `count > 0`

## ✅ Step 4: Check Browser Console

1. Open https://gokartpartpicker.com
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for errors like:
   - "Supabase is not configured"
   - "Failed to fetch"
   - "permission denied"

## 🔧 Quick Fix Checklist

- [ ] Vercel has `NEXT_PUBLIC_SUPABASE_URL` set to `https://ybtcciyyinxywitfmlhv.supabase.co`
- [ ] Vercel has `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Production Supabase database has migrations run
- [ ] Production database has seed data (engines, parts)
- [ ] RLS policies allow public read access
- [ ] Vercel deployment has been redeployed after setting env vars

## 📞 Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/ybtcciyyinxywitfmlhv
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Most Common Issue:** Environment variables not set in Vercel. Check Step 1 first!
