# 🔧 Fix Database Issues - Step by Step

**Your site is showing 505 errors and continuous loading. Let's fix the database properly.**

> **📋 See `MIGRATION-ORDER-LIST.md` for the complete ordered list of migrations to run!**
> **🧹 See `SQL-EDITOR-CLEANUP-LIST.md` for which queries to keep/delete in SQL Editor!**

---

## ✅ Step 1: Check What's Broken

**Run this in Supabase SQL Editor:**

```sql
-- Check if essential tables exist
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) 
        THEN 'EXISTS ✓' 
        ELSE 'MISSING ✗' 
    END as status
FROM (VALUES 
    ('profiles'),
    ('engines'),
    ('parts'),
    ('part_categories'),
    ('builds'),
    ('build_templates'),
    ('forum_categories')
) AS t(table_name);
```

**This shows which tables are missing.**

---

## ✅ Step 2: Run Essential Migrations (One at a Time)

**Instead of the combined file, run these individually:**

### Migration 1: Core Schema
1. Open: `supabase/migrations/20260116000001_initial_schema.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. **If you see "already exists" errors** → That's OK! Skip them, continue ✅
6. **If you see other errors** → Note them down, we'll fix them

### Migration 2: Security Policies
1. Open: `supabase/migrations/20260116000002_rls_policies.sql`
2. Copy, paste, run
3. **Skip "already exists" errors** ✅

### Migration 3: Seed Engines (Essential Data)
1. Open: `supabase/migrations/20260116000004_seed_engines.sql`
2. Copy, paste, run
3. **This adds engine data** - safe to run even if some exist ✅

### Migration 4: Seed Parts (Essential Data)
1. Open: `supabase/migrations/20260116000006_seed_parts.sql`
2. Copy, paste, run
3. **This adds parts data** - safe to run ✅

### Migration 5: Forums Schema
1. Open: `supabase/migrations/20260116000021_forums_schema.sql`
2. Copy, paste, run
3. **Skip "already exists" errors** ✅

### Migration 6: Build Templates
1. Open: `supabase/migrations/20260116000011_add_build_templates.sql`
2. Copy, paste, run
3. **Skip "already exists" errors** ✅

### Migration 7: Seed Templates
1. Open: `supabase/migrations/20260117000003_seed_build_templates.sql`
2. Copy, paste, run
3. **Safe to run** ✅

---

## ✅ Step 3: Verify Tables Have Data

**Run this to check:**

```sql
-- Check record counts
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'engines', COUNT(*) FROM engines
UNION ALL
SELECT 'parts', COUNT(*) FROM parts
UNION ALL
SELECT 'build_templates', COUNT(*) FROM build_templates
UNION ALL
SELECT 'forum_categories', COUNT(*) FROM forum_categories;
```

**Expected:**
- `engines`: Should have 10+ records
- `parts`: Should have 50+ records
- `build_templates`: Should have 9 records
- `forum_categories`: Should have 3+ records

**If counts are 0, the seed migrations didn't run properly.**

---

## ✅ Step 4: Check RLS Policies

**Run this:**

```sql
-- Check RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'engines', 'parts', 'builds', 'build_templates', 'forum_categories')
ORDER BY tablename;
```

**All should show `rls_enabled = true`**

---

## ✅ Step 5: Test Your Site

**After running migrations:**

1. **Homepage:** Should load (doesn't need database)
2. **/engines:** Should show list of engines
3. **/parts:** Should show list of parts
4. **/templates:** Should show build templates
5. **/forums:** Should show forum categories

**If pages still show errors, check the browser console for specific error messages.**

---

## 🐛 Common Issues and Fixes

### Issue 1: "Table doesn't exist"

**Fix:** Run the schema migration (`20260116000001_initial_schema.sql`)

### Issue 2: "Permission denied"

**Fix:** Run the RLS policies migration (`20260116000002_rls_policies.sql`)

### Issue 3: "No data showing"

**Fix:** Run the seed migrations:
- `20260116000004_seed_engines.sql`
- `20260116000006_seed_parts.sql`
- `20260117000003_seed_build_templates.sql`

### Issue 4: "505 errors"

**Possible causes:**
- Missing tables → Run schema migration
- Missing RLS policies → Run RLS migration
- Database connection issue → Check Supabase project is active

---

## 🎯 Quick Fix Checklist

- [ ] Run `CHECK-DATABASE-STATUS.sql` to see what's missing
- [ ] Run `20260116000001_initial_schema.sql` (skip "already exists")
- [ ] Run `20260116000002_rls_policies.sql` (skip "already exists")
- [ ] Run `20260116000004_seed_engines.sql` (adds data)
- [ ] Run `20260116000006_seed_parts.sql` (adds data)
- [ ] Run `20260116000021_forums_schema.sql` (skip "already exists")
- [ ] Run `20260116000011_add_build_templates.sql` (skip "already exists")
- [ ] Run `20260117000003_seed_build_templates.sql` (adds data)
- [ ] Verify tables have data (run count query)
- [ ] Test your site pages

---

## 📋 What Each Migration Does

| Migration | What It Does | Can Skip "Already Exists"? |
|-----------|--------------|---------------------------|
| `20260116000001_initial_schema.sql` | Creates tables, types, indexes | ✅ Yes |
| `20260116000002_rls_policies.sql` | Adds security policies | ✅ Yes |
| `20260116000004_seed_engines.sql` | Adds engine data | ❌ No - run it |
| `20260116000006_seed_parts.sql` | Adds parts data | ❌ No - run it |
| `20260116000021_forums_schema.sql` | Creates forum tables | ✅ Yes |
| `20260116000011_add_build_templates.sql` | Creates template table | ✅ Yes |
| `20260117000003_seed_build_templates.sql` | Adds template data | ❌ No - run it |

---

**Start with Step 1 - check what's missing, then run the migrations one by one!** 🚀
