# 🚀 Database Migrations - Quick Start Guide

**Your site is live!** Now let's add the database so pages work.

> **⚠️ If you're seeing 505 errors or continuous loading:** See `FIX-DATABASE-ISSUES.md` for troubleshooting steps!

---

## ✅ Step 0: Check What Already Exists (Optional)

**If you're getting "already exists" errors, check first:**

1. Open Supabase SQL Editor
2. Open file: `CHECK-EXISTING-MIGRATIONS.sql`
3. Copy, paste, run
4. This shows what tables/types already exist ✅

**Then skip those migrations and run only what's missing!**

---

## ✅ Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New query"** button

---

## ✅ Step 2: Run Essential Migrations First

**Start with these 6 to get your site working:**
### Migration 1: Core Schema
1. Open file: `supabase/migrations/20260116000001_initial_schema.sql`
2. Copy ALL contents (Cmd+A, Cmd+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or Cmd+Enter)
5. **If you see "already exists" errors** → That's OK! Skip them, continue ✅
6. Wait for "Success" or "already exists" ✅

### Migration 2: Security Policies
1. Open: `supabase/migrations/20260116000002_rls_policies.sql`
2. Copy, paste, run ✅

### Migration 3: Engines Data
1. Open: `supabase/migrations/20260116000004_seed_engines.sql`
2. Copy, paste, run ✅

### Migration 4: Parts Data
1. Open: `supabase/migrations/20260116000006_seed_parts.sql`
2. Copy, paste, run ✅

### Migration 5: Forums
1. Open: `supabase/migrations/20260116000021_forums_schema.sql`
2. Copy, paste, run ✅

### Migration 6: Templates
1. Open: `supabase/migrations/20260117000003_seed_build_templates.sql`
2. Copy, paste, run ✅

---

## ✅ Step 3: Test Your Site

After running the 6 essential migrations:

1. Visit: `https://gokartpartpicker-com.vercel.app/engines`
   - Should show list of engines ✅

2. Visit: `/parts`
   - Should show list of parts ✅

3. Visit: `/forums`
   - Should show forum categories ✅

4. Visit: `/templates`
   - Should show build templates ✅

**If these work, you're good!** You can run the remaining migrations later.

---

## ✅ Step 4: Run Remaining Migrations (Optional)

If you want everything (videos, guides, etc.), run the rest:

**In order:**
- `20260116000003_rls_canary_tests.sql`
- `20260116000005_hardening_constraints.sql`
- `20260116000007_add_harbor_freight_links.sql`
- `20260116000008_fix_profile_trigger.sql`
- `20260116000008_update_engine_prices_harborfreight.sql`
- `20260116000009_add_profile_insert_policy.sql`
- `20260116000010_simplify_profile_trigger.sql`
- `20260116000011_add_build_templates.sql`
- `20260116000012_add_price_tracking.sql`
- `20260116000012_add_videos.sql`
- `20260116000013_seed_videos.sql`
- `20260116000013_user_templates_approval.sql`
- `20260116000014_add_engine_clones.sql`
- `20260116000015_add_guides_enhancements.sql`
- `20260116000016_seed_videos_all_engines.sql`
- `20260116000017_fix_video_engine_links.sql`
- `20260116000018_auto_thumbnail_videos.sql`
- `20260116000019_seed_videos_25_per_engine.sql`
- `20260116000020_add_10_videos_per_engine.sql`
- `20260116000020_add_profile_preferences.sql`
- `20260116000022_seed_forum_topics.sql`
- `20260116000023_backfill_video_thumbnails.sql`
- `20260117000001_performance_indexes.sql`
- `20260117000002_optimize_forum_category_counts.sql`

---

## 🎯 Quick Method: Run All at Once

**If you want to run all migrations quickly:**

1. Open Supabase SQL Editor
2. Copy contents of ALL migration files (one by one)
3. Paste them all into SQL Editor (separate each with `;`)
4. Click "Run"
5. Check for any errors

**Or run them in batches of 5-10 at a time.**

---

## ⚠️ If You See Errors

### ✅ "Already Exists" Errors (Most Common)

**Error:** `ERROR: 42710: type "user_role" already exists`  
**Error:** `ERROR: 42P07: relation "engines" already exists`

**This means:** Some migrations have already run! ✅

**Solution:**
1. **Skip the error** - That migration is already done
2. **Continue to next migration** - Run the next one
3. **Or check what exists first:**
   - Run: `CHECK-EXISTING-MIGRATIONS.sql` (see below)
   - This shows what's already created

### Other Errors

**"permission denied"** → Check if RLS policies are enabled.

**"syntax error"** → Check the SQL - might need to run separately.

---

## ✅ After Migrations

1. **Test your pages:**
   - `/engines` - should show engines
   - `/parts` - should show parts
   - `/forums` - should show forums
   - `/templates` - should show templates

2. **Create admin user:**
   - Register/login in your app
   - Supabase → Table Editor → `profiles`
   - Find your user → Set `role` = `'admin'`
   - Test `/admin` page

---

**Start with the 6 essential migrations - that's enough to get your site working!** 🚀
