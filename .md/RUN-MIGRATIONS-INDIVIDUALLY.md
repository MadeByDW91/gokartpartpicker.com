# 🔧 Run Migrations Individually (Handle "Already Exists")

## The Problem

You're getting: `ERROR: 42710: type "user_role" already exists`

**This means:** Some migrations have already run. That's fine! ✅

---

## ✅ Solution: Run Migrations One by One

**Instead of the combined file, run migrations individually:**

### Step 1: Check What Exists

1. Open Supabase SQL Editor
2. Run: `CHECK-EXISTING-MIGRATIONS.sql`
3. See what tables/types already exist

### Step 2: Run Migrations Individually

**For each migration file:**

1. Open the migration file (e.g., `20260116000001_initial_schema.sql`)
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**
5. **If you see "already exists" error:**
   - ✅ That's OK! The migration already ran
   - ✅ Skip it, move to next migration
6. **If you see "Success":**
   - ✅ Migration completed
   - ✅ Move to next migration

---

## ✅ Migration Order (Run in This Order)

### Essential (Run These First):

1. ✅ `20260116000001_initial_schema.sql`
   - **If error "already exists"** → Skip, already done ✅

2. ✅ `20260116000002_rls_policies.sql`
   - **If error "already exists"** → Skip, already done ✅

3. ✅ `20260116000004_seed_engines.sql`
   - **May add duplicates** → That's OK, safe to run ✅

4. ✅ `20260116000006_seed_parts.sql`
   - **May add duplicates** → That's OK, safe to run ✅

5. ✅ `20260116000021_forums_schema.sql`
   - **If error "already exists"** → Skip, already done ✅

6. ✅ `20260117000003_seed_build_templates.sql`
   - **May add duplicates** → That's OK, safe to run ✅

### Performance (Run These Next):

7. ✅ `20260117000001_performance_indexes.sql`
   - **Uses IF NOT EXISTS** → Safe to run multiple times ✅

8. ✅ `20260117000002_optimize_forum_category_counts.sql`
   - **Uses IF NOT EXISTS** → Safe to run multiple times ✅

### Optional (Run If Needed):

9. `20260116000003_rls_canary_tests.sql`
10. `20260116000005_hardening_constraints.sql`
11. `20260116000011_add_build_templates.sql`
12. `20260116000013_user_templates_approval.sql`
13. `20260116000012_add_videos.sql`
14. `20260116000013_seed_videos.sql`
15. ... (and all others)

---

## 🎯 Quick Method

**Run migrations in order, skip "already exists" errors:**

```bash
# In Supabase SQL Editor, run each file:
1. 20260116000001_initial_schema.sql → Skip if "already exists"
2. 20260116000002_rls_policies.sql → Skip if "already exists"
3. 20260116000004_seed_engines.sql → Run (safe, may duplicate)
4. 20260116000006_seed_parts.sql → Run (safe, may duplicate)
5. 20260116000021_forums_schema.sql → Skip if "already exists"
6. 20260117000003_seed_build_templates.sql → Run (safe, may duplicate)
7. 20260117000001_performance_indexes.sql → Run (safe)
8. 20260117000002_optimize_forum_category_counts.sql → Run (safe)
```

---

## ✅ After Running Migrations

1. **Test your site:**
   - `/engines` - should show engines
   - `/parts` - should show parts
   - `/forums` - should show forums
   - `/templates` - should show templates

2. **If pages work** → Migrations are complete! ✅

---

## 🐛 Troubleshooting

### "Already Exists" for Everything

**If ALL migrations show "already exists":**
- ✅ All migrations already ran!
- ✅ Your database is set up
- ✅ Test your site - it should work

### "Already Exists" for Some

**If SOME migrations show "already exists":**
- ✅ Those are done
- ✅ Run the remaining ones
- ✅ Skip the errors, continue

### Can't Tell What's Missing

**Run the check script:**
1. Run: `CHECK-EXISTING-MIGRATIONS.sql`
2. See what exists
3. Run only missing migrations

---

**The "already exists" error is GOOD - it means that migration already ran! Just skip it and continue.** ✅
