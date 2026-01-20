# 🧹 Clean Up Supabase SQL Editor

**You have 14+ saved queries in your SQL Editor. Here's what to do with them.**

---

## 📋 Understanding the Difference

### Migration Files (Keep These!)
**Location:** `supabase/migrations/` folder in your codebase

**These are:**
- ✅ Your source of truth
- ✅ Version controlled (in Git)
- ✅ The actual migration files
- ✅ What you should run

**Keep all of these!** They're your database schema.

### Saved Queries in SQL Editor (Can Clean Up)
**Location:** Supabase Dashboard → SQL Editor → "PRIVATE" section

**These are:**
- ⚠️ Just saved queries for convenience
- ⚠️ Not version controlled
- ⚠️ Can get confusing with many old ones
- ⚠️ Can be deleted without affecting your database

---

## ✅ Recommended: Clean Up SQL Editor

**Before running the new migrations, clean up your SQL Editor:**

### Option 1: Delete Old Development Queries (Recommended)

1. **Go to Supabase SQL Editor**
2. **In the "PRIVATE" section:**
   - Delete old queries you don't need anymore
   - Keep only:
     - `CHECK-DATABASE-STATUS.sql` (if you saved it)
     - Any queries you use regularly
3. **Delete these old development queries:**
   - Old seed data queries
   - Test queries
   - One-off fixes that are now in migrations

**How to delete:**
- Right-click on a query → "Delete"
- Or click the query → Click the trash icon

### Option 2: Archive Old Queries

1. **Create a new folder/group** called "Archive" or "Old Development"
2. **Move old queries there** instead of deleting
3. **Keep your SQL Editor clean** with only active queries

---

## ✅ What to Keep in SQL Editor

**Keep these saved queries (optional but helpful):**

1. **`CHECK-DATABASE-STATUS.sql`** - Diagnostic tool
2. **`CHECK-EXISTING-MIGRATIONS.sql`** - Check what exists
3. **Any custom queries you use regularly**

**Everything else can be deleted** - the migration files in your codebase are the source of truth!

---

## ✅ What to Keep in Your Codebase

**Keep ALL migration files in `supabase/migrations/`:**

- ✅ `20260116000001_initial_schema.sql`
- ✅ `20260116000002_rls_policies.sql`
- ✅ `20260116000004_seed_engines.sql`
- ✅ `20260116000006_seed_parts.sql`
- ✅ All other migration files

**These are your database schema - never delete these!**

---

## 🎯 Quick Cleanup Steps

1. **Open Supabase SQL Editor**
2. **Review your "PRIVATE" queries:**
   - Identify which are old development queries
   - Identify which are actual migration files (you don't need these saved - they're in your codebase)
3. **Delete old queries:**
   - Right-click → Delete
   - Or select → Trash icon
4. **Keep only:**
   - Diagnostic queries (CHECK-DATABASE-STATUS, etc.)
   - Custom queries you use regularly
5. **Start fresh** with the migration files from your codebase

---

## 📝 After Cleanup

**Your SQL Editor should have:**
- ✅ `CHECK-DATABASE-STATUS.sql` (optional - diagnostic tool)
- ✅ `CHECK-EXISTING-MIGRATIONS.sql` (optional - check what exists)
- ✅ Any custom queries you use

**Everything else comes from your codebase migration files!**

---

## ⚠️ Important Notes

1. **Deleting queries in SQL Editor does NOT affect your database**
   - It only removes saved queries
   - Your database tables/data remain unchanged

2. **Migration files in codebase are the source of truth**
   - Always use these for running migrations
   - Don't rely on saved queries in SQL Editor

3. **You can always recreate queries**
   - They're just saved for convenience
   - The actual migration files are in your codebase

---

## 🚀 Ready to Deploy

**After cleanup:**

1. ✅ SQL Editor is clean and organized
2. ✅ Use migration files from `supabase/migrations/` folder
3. ✅ Run them one by one as outlined in `FIX-DATABASE-ISSUES.md`
4. ✅ No confusion from old development queries

---

**Clean up the SQL Editor, then use the migration files from your codebase!** 🧹
