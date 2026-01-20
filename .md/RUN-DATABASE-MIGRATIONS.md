# 🗄️ Run Database Migrations - Step by Step

**Your site is live!** Now let's set up the database so everything works.

---

## 📋 Migration Files (Run in This Order)

You have **29 migration files** to run. Here's the complete list in order:

### Phase 1: Core Schema (Run First)
1. `20260116000001_initial_schema.sql` - Creates all core tables
2. `20260116000002_rls_policies.sql` - Sets up security policies
3. `20260116000003_rls_canary_tests.sql` - Security tests
4. `20260116000004_seed_engines.sql` - Adds engine data
5. `20260116000005_hardening_constraints.sql` - Data validation
6. `20260116000006_seed_parts.sql` - Adds parts data
7. `20260116000007_add_harbor_freight_links.sql` - Affiliate links
8. `20260116000008_fix_profile_trigger.sql` - Profile fixes
9. `20260116000008_update_engine_prices_harborfreight.sql` - Price updates
10. `20260116000009_add_profile_insert_policy.sql` - Auth policies
11. `20260116000010_simplify_profile_trigger.sql` - Trigger fixes
12. `20260116000011_add_build_templates.sql` - Templates table
13. `20260116000012_add_price_tracking.sql` - Price tracking
14. `20260116000012_add_videos.sql` - Videos table
15. `20260116000013_seed_videos.sql` - Video data
16. `20260116000013_user_templates_approval.sql` - Template approval
17. `20260116000014_add_engine_clones.sql` - Engine clones
18. `20260116000015_add_guides_enhancements.sql` - Guides system
19. `20260116000016_seed_videos_all_engines.sql` - More videos
20. `20260116000017_fix_video_engine_links.sql` - Video fixes
21. `20260116000018_auto_thumbnail_videos.sql` - Thumbnails
22. `20260116000019_seed_videos_25_per_engine.sql` - Video seeding
23. `20260116000020_add_10_videos_per_engine.sql` - More videos
24. `20260116000020_add_profile_preferences.sql` - User preferences
25. `20260116000021_forums_schema.sql` - Forums tables
26. `20260116000022_seed_forum_topics.sql` - Forum data
27. `20260116000023_backfill_video_thumbnails.sql` - Thumbnail fixes

### Phase 2: Performance & Optimization (Run After Core)
28. `20260117000001_performance_indexes.sql` - Performance indexes
29. `20260117000002_optimize_forum_category_counts.sql` - N+1 query fix

### Phase 3: Seed Data (Run Last)
30. `20260117000003_seed_build_templates.sql` - Template seed data

---

## ✅ How to Run Migrations

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run Each Migration

**Option A: Run One at a Time (Recommended for First Time)**

1. Open the migration file from your computer:
   - Go to: `supabase/migrations/20260116000001_initial_schema.sql`
   - Copy ALL the contents (Cmd+A, Cmd+C)

2. Paste into Supabase SQL Editor

3. Click **"Run"** (or press Cmd+Enter)

4. Wait for "Success" message

5. Repeat for next file

**Option B: Run Multiple at Once (Faster)**

1. Open multiple migration files
2. Copy all their contents
3. Paste into SQL Editor (separate with `;`)
4. Run all at once

---

## 🎯 Quick Start - Run These First (Essential)

**Minimum to get site working:**

1. `20260116000001_initial_schema.sql` - Creates all tables
2. `20260116000002_rls_policies.sql` - Security
3. `20260116000004_seed_engines.sql` - Engine data
4. `20260116000006_seed_parts.sql` - Parts data
5. `20260116000021_forums_schema.sql` - Forums
6. `20260117000003_seed_build_templates.sql` - Templates

**Run these 6 first, then test your site. Then run the rest.**

---

## ⚠️ Important Notes

1. **Run in order** - Some migrations depend on previous ones
2. **Check for errors** - If a migration fails, check the error message
3. **Some may already exist** - If you see "already exists" errors, that's OK (skip those)
4. **Take breaks** - You don't have to run all 29 at once

---

## 🐛 If a Migration Fails

1. **Read the error message** - It will tell you what's wrong
2. **Common issues:**
   - "relation already exists" → Skip it, already done
   - "permission denied" → Check RLS policies
   - "syntax error" → Check SQL syntax
3. **Continue with next migration** - Don't let one failure stop you

---

## ✅ After Running Migrations

1. **Test your site:**
   - Visit `/engines` - should show engines
   - Visit `/parts` - should show parts
   - Visit `/forums` - should show forums
   - Visit `/templates` - should show templates

2. **Create admin user:**
   - Register/login in your app
   - Supabase → Table Editor → `profiles`
   - Set your user's `role` to `'admin'`
   - Test `/admin` page

---

## 📋 Migration Checklist

- [ ] `20260116000001_initial_schema.sql`
- [ ] `20260116000002_rls_policies.sql`
- [ ] `20260116000003_rls_canary_tests.sql`
- [ ] `20260116000004_seed_engines.sql`
- [ ] `20260116000005_hardening_constraints.sql`
- [ ] `20260116000006_seed_parts.sql`
- [ ] `20260116000007_add_harbor_freight_links.sql`
- [ ] `20260116000008_fix_profile_trigger.sql`
- [ ] `20260116000008_update_engine_prices_harborfreight.sql`
- [ ] `20260116000009_add_profile_insert_policy.sql`
- [ ] `20260116000010_simplify_profile_trigger.sql`
- [ ] `20260116000011_add_build_templates.sql`
- [ ] `20260116000012_add_price_tracking.sql`
- [ ] `20260116000012_add_videos.sql`
- [ ] `20260116000013_seed_videos.sql`
- [ ] `20260116000013_user_templates_approval.sql`
- [ ] `20260116000014_add_engine_clones.sql`
- [ ] `20260116000015_add_guides_enhancements.sql`
- [ ] `20260116000016_seed_videos_all_engines.sql`
- [ ] `20260116000017_fix_video_engine_links.sql`
- [ ] `20260116000018_auto_thumbnail_videos.sql`
- [ ] `20260116000019_seed_videos_25_per_engine.sql`
- [ ] `20260116000020_add_10_videos_per_engine.sql`
- [ ] `20260116000020_add_profile_preferences.sql`
- [ ] `20260116000021_forums_schema.sql`
- [ ] `20260116000022_seed_forum_topics.sql`
- [ ] `20260116000023_backfill_video_thumbnails.sql`
- [ ] `20260117000001_performance_indexes.sql`
- [ ] `20260117000002_optimize_forum_category_counts.sql`
- [ ] `20260117000003_seed_build_templates.sql`

---

**Start with the 6 essential migrations first, then we can run the rest!** 🚀
