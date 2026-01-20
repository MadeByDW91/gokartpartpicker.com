# 🧹 SQL Editor Cleanup - Specific List

**Based on your PRIVATE section, here's exactly what to keep and delete:**

---

## ✅ KEEP These Queries (3)

1. **"Schema Health Check"** ✅ KEEP
   - This is your diagnostic tool
   - Useful for checking database status

2. **"Promote User to Admin"** ✅ KEEP (if you use it)
   - Useful for creating admin users
   - Keep if you need to promote users manually

3. **"Insert policies for profiles"** ✅ KEEP (if you use it)
   - Useful for fixing profile policies
   - Keep if you need to troubleshoot RLS

---

## ❌ DELETE These Queries (12)

**These are all covered by migration files in your codebase:**

1. **"Untitled query"** ❌ DELETE
   - Unnamed query, likely a test

2. **"Auto-fill YouTube Thumbnails"** ❌ DELETE
   - Covered by: `20260116000018_auto_thumbnail_videos.sql`

3. **"Forum Topics Seeder"** ❌ DELETE
   - Covered by: `20260116000022_seed_forum_topics.sql`

4. **"GoKart Forums Schema (Phase 1)"** ❌ DELETE
   - Covered by: `20260116000021_forums_schema.sql`

5. **"Add 10 Videos per Engine"** ❌ DELETE
   - Covered by: `20260116000020_add_10_videos_per_engine.sql`

6. **"Installation Guides"** ❌ DELETE
   - Covered by: `20260116000015_add_guides_enhancements.sql`

7. **"Auto-populate YouTube Thumb.."** ❌ DELETE
   - Covered by: `20260116000018_auto_thumbnail_videos.sql`

8. **"Seed Videos for All Engines"** ❌ DELETE
   - Covered by: `20260116000016_seed_videos_all_engines.sql`

9. **"Engine Clone Relationships"** ❌ DELETE
   - Covered by: `20260116000014_add_engine_clones.sql`

10. **"GoKart Video Seed Data"** ❌ DELETE
    - Covered by: `20260116000013_seed_videos.sql`

11. **"GoKart Video Catalog Seed"** ❌ DELETE
    - Covered by: `20260116000019_seed_videos_25_per_engine.sql`

12. **"GoKart Parts Seed Data"** ❌ DELETE
    - Covered by: `20260116000006_seed_parts.sql`

---

## 🎯 After Cleanup

**Your PRIVATE section should have:**
- ✅ Schema Health Check
- ✅ Promote User to Admin (optional)
- ✅ Insert policies for profiles (optional)

**Everything else comes from migration files in your codebase!**

---

## 📝 How to Delete

1. **Right-click on each query** → "Delete"
2. **Or select query** → Click trash icon
3. **Confirm deletion**

**Deleting queries does NOT affect your database - it only removes saved queries!**

---

## ⚠️ Important

**All the functionality from deleted queries is in your migration files:**
- `supabase/migrations/` folder contains everything
- These are version controlled
- These are your source of truth

**You don't need saved queries for migrations - use the files from your codebase!**
