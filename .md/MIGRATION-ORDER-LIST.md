# 📋 Migration Files - Ordered List for Deployment

**Run these migrations in this exact order. One at a time!**

---

## ✅ ESSENTIAL MIGRATIONS (Run These First)

**These are required for your site to work:**

### 1. Core Schema
**File:** `supabase/migrations/20260116000001_initial_schema.sql`
- **What it does:** Creates all core tables (profiles, engines, parts, builds, etc.)
- **Status:** ✅ REQUIRED
- **If error "already exists":** Skip those lines, continue
- **Time:** ~30 seconds

### 2. Security Policies (RLS)
**File:** `supabase/migrations/20260116000002_rls_policies.sql`
- **What it does:** Enables Row Level Security on all tables
- **Status:** ✅ REQUIRED
- **If error "already exists":** Skip those lines, continue
- **Time:** ~20 seconds

### 3. Seed Engines (Data)
**File:** `supabase/migrations/20260116000004_seed_engines.sql`
- **What it does:** Adds engine data (10+ engines)
- **Status:** ✅ REQUIRED - Run this even if some engines exist
- **If error "duplicate":** That's OK, some may already exist
- **Time:** ~10 seconds

### 4. Seed Parts (Data)
**File:** `supabase/migrations/20260116000006_seed_parts.sql`
- **What it does:** Adds parts data (50+ parts)
- **Status:** ✅ REQUIRED - Run this even if some parts exist
- **If error "duplicate":** That's OK, some may already exist
- **Time:** ~15 seconds

---

## ✅ FORUMS (If You Want Forums to Work)

### 5. Forums Schema
**File:** `supabase/migrations/20260116000021_forums_schema.sql`
- **What it does:** Creates forum tables (categories, topics, posts)
- **Status:** ✅ REQUIRED for forums
- **If error "already exists":** Skip those lines, continue
- **Time:** ~20 seconds

### 6. Seed Forum Topics
**File:** `supabase/migrations/20260116000022_seed_forum_topics.sql`
- **What it does:** Adds forum topics and posts
- **Status:** ✅ REQUIRED for forums
- **If error "duplicate":** That's OK
- **Time:** ~10 seconds

---

## ✅ BUILD TEMPLATES (If You Want Templates to Work)

### 7. Build Templates Schema
**File:** `supabase/migrations/20260116000011_add_build_templates.sql`
- **What it does:** Creates build_templates table
- **Status:** ✅ REQUIRED for templates
- **If error "already exists":** Skip those lines, continue
- **Time:** ~15 seconds

### 8. Seed Build Templates
**File:** `supabase/migrations/20260117000003_seed_build_templates.sql`
- **What it does:** Adds 9 build templates
- **Status:** ✅ REQUIRED for templates
- **If error "duplicate":** That's OK
- **Time:** ~10 seconds

---

## ✅ OPTIONAL MIGRATIONS (Run These After Essentials)

**These add extra features but aren't required for basic functionality:**

### 9. RLS Canary Tests
**File:** `supabase/migrations/20260116000003_rls_canary_tests.sql`
- **What it does:** Adds test functions for RLS
- **Status:** ⚠️ OPTIONAL
- **Time:** ~10 seconds

### 10. Hardening Constraints
**File:** `supabase/migrations/20260116000005_hardening_constraints.sql`
- **What it does:** Adds data validation constraints
- **Status:** ⚠️ OPTIONAL (but recommended)
- **Time:** ~15 seconds

### 11. Harbor Freight Links
**File:** `supabase/migrations/20260116000007_add_harbor_freight_links.sql`
- **What it does:** Adds affiliate links
- **Status:** ⚠️ OPTIONAL
- **Time:** ~5 seconds

### 12. Profile Trigger Fixes
**File:** `supabase/migrations/20260116000008_fix_profile_trigger.sql`
- **What it does:** Fixes profile creation triggers
- **Status:** ⚠️ OPTIONAL
- **Time:** ~5 seconds

### 13. Profile Insert Policy
**File:** `supabase/migrations/20260116000009_add_profile_insert_policy.sql`
- **What it does:** Adds profile creation policy
- **Status:** ⚠️ OPTIONAL
- **Time:** ~5 seconds

### 14. Simplify Profile Trigger
**File:** `supabase/migrations/20260116000010_simplify_profile_trigger.sql`
- **What it does:** Simplifies profile trigger
- **Status:** ⚠️ OPTIONAL
- **Time:** ~5 seconds

### 15. Price Tracking
**File:** `supabase/migrations/20260116000012_add_price_tracking.sql`
- **What it does:** Adds price history tracking
- **Status:** ⚠️ OPTIONAL
- **Time:** ~10 seconds

### 16. Videos Schema
**File:** `supabase/migrations/20260116000012_add_videos.sql`
- **What it does:** Creates videos table
- **Status:** ⚠️ OPTIONAL (for video features)
- **Time:** ~15 seconds

### 17. Seed Videos
**File:** `supabase/migrations/20260116000013_seed_videos.sql`
- **What it does:** Adds initial video data
- **Status:** ⚠️ OPTIONAL
- **Time:** ~10 seconds

### 18. User Templates Approval
**File:** `supabase/migrations/20260116000013_user_templates_approval.sql`
- **What it does:** Adds approval workflow for user templates
- **Status:** ⚠️ OPTIONAL
- **Time:** ~10 seconds

### 19. Engine Clones
**File:** `supabase/migrations/20260116000014_add_engine_clones.sql`
- **What it does:** Adds engine clone relationships
- **Status:** ⚠️ OPTIONAL
- **Time:** ~10 seconds

### 20. Guides Enhancements
**File:** `supabase/migrations/20260116000015_add_guides_enhancements.sql`
- **What it does:** Adds guide features
- **Status:** ⚠️ OPTIONAL (for guides)
- **Time:** ~15 seconds

### 21-25. Video Seed Migrations (Optional)
- `20260116000016_seed_videos_all_engines.sql`
- `20260116000017_fix_video_engine_links.sql`
- `20260116000018_auto_thumbnail_videos.sql`
- `20260116000019_seed_videos_25_per_engine.sql`
- `20260116000020_add_10_videos_per_engine.sql`
- **Status:** ⚠️ OPTIONAL (for video features)

### 26. Profile Preferences
**File:** `supabase/migrations/20260116000020_add_profile_preferences.sql`
- **What it does:** Adds user preferences
- **Status:** ⚠️ OPTIONAL
- **Time:** ~10 seconds

### 27. Backfill Video Thumbnails
**File:** `supabase/migrations/20260116000023_backfill_video_thumbnails.sql`
- **What it does:** Generates thumbnails for existing videos
- **Status:** ⚠️ OPTIONAL
- **Time:** ~30 seconds

### 28. Performance Indexes
**File:** `supabase/migrations/20260117000001_performance_indexes.sql`
- **What it does:** Adds performance indexes
- **Status:** ✅ RECOMMENDED (improves speed)
- **Time:** ~20 seconds

### 29. Forum Category Counts Optimization
**File:** `supabase/migrations/20260117000002_optimize_forum_category_counts.sql`
- **What it does:** Optimizes forum queries
- **Status:** ✅ RECOMMENDED (improves speed)
- **Time:** ~10 seconds

---

## 🎯 Quick Deployment Checklist

**Minimum to get site working (run these first):**

- [ ] 1. `20260116000001_initial_schema.sql`
- [ ] 2. `20260116000002_rls_policies.sql`
- [ ] 3. `20260116000004_seed_engines.sql`
- [ ] 4. `20260116000006_seed_parts.sql`
- [ ] 5. `20260116000021_forums_schema.sql` (if you want forums)
- [ ] 6. `20260116000011_add_build_templates.sql` (if you want templates)
- [ ] 7. `20260117000003_seed_build_templates.sql` (if you want templates)
- [ ] 8. `20260117000001_performance_indexes.sql` (recommended)
- [ ] 9. `20260117000002_optimize_forum_category_counts.sql` (recommended)

**After these, your site should work! Then run optional migrations as needed.**

---

## 📝 How to Run

1. **Open migration file** from `supabase/migrations/` folder
2. **Copy ALL contents** (Cmd+A, Cmd+C)
3. **Paste into Supabase SQL Editor** (new query)
4. **Click "Run"**
5. **Check for errors:**
   - "Already exists" → OK, skip it
   - Other errors → Note them down
6. **Move to next migration**
7. **Don't save in SQL Editor** - it's already in your codebase!

---

**Start with the essential migrations, then add optional ones as needed!** 🚀
