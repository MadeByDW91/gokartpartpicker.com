# 🧹 Clean Up Auto-Saved Queries

**Supabase auto-saves queries when you run them. Here's how to clean them up.**

---

## ⚠️ What Happens

**When you run a migration:**
1. You paste SQL into Supabase SQL Editor
2. You click "Run"
3. Supabase automatically saves it as "Untitled query" in PRIVATE section
4. This happens automatically - you can't prevent it

**Result:** You'll have multiple "Untitled query" entries after running migrations.

---

## ✅ Two Options

### Option 1: Delete After Each Migration (Recommended)

**After running each migration:**

1. **Look in PRIVATE section** for "Untitled query"
2. **Right-click** on it
3. **Click "Delete"** (or click trash icon)
4. **Confirm deletion**

**This keeps your SQL Editor clean!**

---

### Option 2: Delete All at Once (After Running All Migrations)

**After running all migrations:**

1. **Go to PRIVATE section**
2. **Delete all "Untitled query" entries:**
   - Right-click each one → Delete
   - Or select multiple and delete

**Keep only:**
- ✅ "Schema Health Check" (diagnostic tool)
- ✅ "Promote User to Admin" (if you use it)
- ✅ "Insert policies for profiles" (if you use it)

---

## 🎯 Quick Cleanup Workflow

**After running all 10 essential migrations:**

1. **You'll have 10 "Untitled query" entries**
2. **Delete them all:**
   - Right-click → Delete (repeat 10 times)
   - Or select all → Delete

3. **Your PRIVATE section should have:**
   - ✅ "Schema Health Check"
   - ✅ "Promote User to Admin" (optional)
   - ✅ "Insert policies for profiles" (optional)

**That's it! Clean and organized.**

---

## ⚠️ Important Notes

1. **Deleting queries does NOT affect your database**
   - It only removes saved queries from SQL Editor
   - Your database tables/data remain unchanged

2. **Migration files are still in your codebase**
   - `supabase/migrations/` folder has all migrations
   - These are your source of truth

3. **Auto-saved queries are harmless**
   - They're just copies
   - You can delete them anytime
   - Or leave them if you want (they won't hurt)

---

## 🚀 Recommended Approach

**During migration run:**
- Run each migration
- Delete "Untitled query" immediately after running
- Keeps SQL Editor clean as you go

**Or after all migrations:**
- Run all migrations
- Delete all "Untitled query" entries at once
- Faster, but SQL Editor gets cluttered during process

**Either way works!** Choose what's easier for you.

---

**Auto-save is normal - just delete the "Untitled query" entries when you're done!** 🧹
