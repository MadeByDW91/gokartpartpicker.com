# 🚀 Quick Access to All SQL Migration Files

## ⚠️ IMPORTANT: "Already Exists" Errors

**If you see:** `ERROR: 42710: type "user_role" already exists`

**This means:** Some migrations have already run! ✅

**Solution:** Run migrations **individually** instead of combined file:
- See: `RUN-MIGRATIONS-INDIVIDUALLY.md` for step-by-step guide
- Or check what exists first: Run `CHECK-EXISTING-MIGRATIONS.sql`

---

## ✅ Option 1: Combined File (If Nothing Exists Yet)

**I've created a single file with ALL migrations combined:**

📄 **File:** `ALL-MIGRATIONS-COMBINED.sql`

**How to use:**
1. Open: `ALL-MIGRATIONS-COMBINED.sql` (in your project root)
2. Copy ALL contents (Cmd+A, Cmd+C)
3. Go to Supabase SQL Editor
4. Paste and click "Run"
5. **If you see "already exists" errors** → Use Option 2 instead ✅

**This runs all 30 migrations at once (only if nothing exists yet)!**

---

## ✅ Option 2: Individual Files (Recommended if "Already Exists")

**If you're getting "already exists" errors, run migrations one by one:**

📄 **See:** `RUN-MIGRATIONS-INDIVIDUALLY.md` for full guide

**Quick steps:**
1. Run each migration file individually
2. If you see "already exists" → Skip it, already done ✅
3. If you see "Success" → Continue to next ✅

**All migration files are in:** `supabase/migrations/`

**All migration files are in:** `supabase/migrations/`

### Quick File List (In Order):

1. `supabase/migrations/20260116000001_initial_schema.sql`
2. `supabase/migrations/20260116000002_rls_policies.sql`
3. `supabase/migrations/20260116000003_rls_canary_tests.sql`
4. `supabase/migrations/20260116000004_seed_engines.sql`
5. `supabase/migrations/20260116000005_hardening_constraints.sql`
6. `supabase/migrations/20260116000006_seed_parts.sql`
7. `supabase/migrations/20260116000007_add_harbor_freight_links.sql`
8. `supabase/migrations/20260116000008_fix_profile_trigger.sql`
9. `supabase/migrations/20260116000008_update_engine_prices_harborfreight.sql`
10. `supabase/migrations/20260116000009_add_profile_insert_policy.sql`
11. `supabase/migrations/20260116000010_simplify_profile_trigger.sql`
12. `supabase/migrations/20260116000011_add_build_templates.sql`
13. `supabase/migrations/20260116000012_add_price_tracking.sql`
14. `supabase/migrations/20260116000012_add_videos.sql`
15. `supabase/migrations/20260116000013_seed_videos.sql`
16. `supabase/migrations/20260116000013_user_templates_approval.sql`
17. `supabase/migrations/20260116000014_add_engine_clones.sql`
18. `supabase/migrations/20260116000015_add_guides_enhancements.sql`
19. `supabase/migrations/20260116000016_seed_videos_all_engines.sql`
20. `supabase/migrations/20260116000017_fix_video_engine_links.sql`
21. `supabase/migrations/20260116000018_auto_thumbnail_videos.sql`
22. `supabase/migrations/20260116000019_seed_videos_25_per_engine.sql`
23. `supabase/migrations/20260116000020_add_10_videos_per_engine.sql`
24. `supabase/migrations/20260116000020_add_profile_preferences.sql`
25. `supabase/migrations/20260116000021_forums_schema.sql`
26. `supabase/migrations/20260116000022_seed_forum_topics.sql`
27. `supabase/migrations/20260116000023_backfill_video_thumbnails.sql`
28. `supabase/migrations/20260117000001_performance_indexes.sql`
29. `supabase/migrations/20260117000002_optimize_forum_category_counts.sql`
30. `supabase/migrations/20260117000003_seed_build_templates.sql`

---

## 🎯 Recommended Approach

**If you're getting "already exists" errors:**
1. ✅ Run: `CHECK-EXISTING-MIGRATIONS.sql` (see what exists)
2. ✅ Follow: `RUN-MIGRATIONS-INDIVIDUALLY.md` (run missing ones)

**If nothing exists yet:**
- ✅ Use: `ALL-MIGRATIONS-COMBINED.sql` (fastest way)

---

## 📋 Quick Steps

1. **Open:** `ALL-MIGRATIONS-COMBINED.sql` (in your project folder)
2. **Select All:** Cmd+A
3. **Copy:** Cmd+C
4. **Go to:** Supabase Dashboard → SQL Editor
5. **Paste:** Cmd+V
6. **Run:** Click "Run" button
7. **Wait:** 30-60 seconds for all migrations to complete
8. **Done!** ✅

---

**The combined file is ready - just open it and copy/paste!** 🎉
