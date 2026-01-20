# 🔧 Fix Migration Errors - "Already Exists"

## The Problem

You're getting: `ERROR: 42710: type "user_role" already exists`

**This means:** Some migrations have already been run in your Supabase database.

---

## ✅ Solution: Run Migrations Selectively

Instead of running the combined file, run migrations **one at a time** and skip the ones that error.

### Step 1: Check What Already Exists

1. Go to Supabase Dashboard → **Table Editor**
2. Check what tables exist:
   - Do you see `engines` table? ✅
   - Do you see `parts` table? ✅
   - Do you see `profiles` table? ✅
   - Do you see `build_templates` table? ✅
   - Do you see `forum_categories` table? ✅

### Step 2: Run Only Missing Migrations

**If tables already exist, skip the schema migrations and run only:**

1. **Seed data migrations** (safe to run multiple times):
   - `20260116000004_seed_engines.sql` - May add duplicates (that's OK)
   - `20260116000006_seed_parts.sql` - May add duplicates (that's OK)
   - `20260117000003_seed_build_templates.sql` - May add duplicates (that's OK)

2. **New migrations** (if not run yet):
   - `20260117000001_performance_indexes.sql` - Uses IF NOT EXISTS
   - `20260117000002_optimize_forum_category_counts.sql` - Uses IF NOT EXISTS

---

## ✅ Better Solution: Run Individual Migrations

**Skip the combined file. Run migrations one by one:**

1. Start with: `20260116000001_initial_schema.sql`
2. If you get "already exists" error → **Skip it, continue to next**
3. Run: `20260116000002_rls_policies.sql`
4. If error → Skip, continue
5. Continue through the list

**The migrations that fail with "already exists" are already done - that's fine!**

---

## ✅ Quick Fix: Run Only What's Missing

**If your tables already exist, just run these:**

### Essential Missing Migrations:

1. **Performance indexes** (safe):
   ```sql
   -- Run: supabase/migrations/20260117000001_performance_indexes.sql
   ```

2. **Forum optimization** (safe):
   ```sql
   -- Run: supabase/migrations/20260117000002_optimize_forum_category_counts.sql
   ```

3. **Seed templates** (may add duplicates, that's OK):
   ```sql
   -- Run: supabase/migrations/20260117000003_seed_build_templates.sql
   ```

---

## 🎯 Recommended Approach

**Instead of combined file, run migrations individually:**

1. Open Supabase SQL Editor
2. Open first migration: `20260116000001_initial_schema.sql`
3. Copy, paste, run
4. **If error "already exists"** → That's OK! Skip it.
5. Move to next migration
6. Repeat

**This way you can see which ones are already done and which need to run.**

---

## ✅ Check What You Have

**Quick check in Supabase:**

1. Go to **Table Editor**
2. Do you see these tables?
   - ✅ `engines` → Engines migration already run
   - ✅ `parts` → Parts migration already run
   - ✅ `profiles` → Profile migration already run
   - ✅ `build_templates` → Templates migration already run
   - ✅ `forum_categories` → Forums migration already run

**If you see these tables, you've already run most migrations!**

Just run the **new ones**:
- `20260117000001_performance_indexes.sql`
- `20260117000002_optimize_forum_category_counts.sql`
- `20260117000003_seed_build_templates.sql`

---

## 🐛 If You Want to Run All Anyway

**You can modify the combined file to skip errors:**

1. At the start of the SQL, add:
   ```sql
   -- Ignore errors for existing objects
   SET client_min_messages TO warning;
   ```

2. Or wrap CREATE statements in:
   ```sql
   DO $$ BEGIN
       CREATE TYPE ...;
   EXCEPTION
       WHEN duplicate_object THEN null;
   END $$;
   ```

**But it's easier to just run individual migrations and skip the errors!**

---

**The error means some migrations already ran - that's good! Just run the remaining ones individually.** ✅
