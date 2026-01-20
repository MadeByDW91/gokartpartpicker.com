# 🚀 How to Run Migrations - Step by Step

**Where to run them and how to do it correctly.**

---

## ✅ Where to Run Migrations

**Run them in Supabase SQL Editor, but DON'T save them in PRIVATE section!**

**Why?** The migration files are already in your codebase - you don't need to save copies in SQL Editor.

---

## 📝 Step-by-Step Process

### For Each Migration:

1. **Open the migration file in VS Code:**
   - Press `Cmd+P` (or `Ctrl+P`)
   - Type the migration number (e.g., `20260116000001`)
   - Press Enter → File opens

2. **Copy the entire file:**
   - Press `Cmd+A` (select all)
   - Press `Cmd+C` (copy)

3. **Go to Supabase SQL Editor:**
   - Open: https://supabase.com/dashboard
   - Click your project
   - Click **"SQL Editor"** (left sidebar)
   - Click **"New query"** button (top right)

4. **Paste and run:**
   - Press `Cmd+V` (paste)
   - Click **"Run"** button (or press `Cmd+Enter`)

5. **Check for errors:**
   - If you see "already exists" → That's OK! Skip it
   - If you see other errors → Note them down

6. **Supabase auto-saves queries:**
   - After running, Supabase automatically saves it as "Untitled query" in PRIVATE section
   - That's OK - you can delete it after running

7. **Delete the auto-saved query (optional cleanup):**
   - Right-click on "Untitled query" in PRIVATE section
   - Click "Delete" (or click trash icon)
   - This doesn't affect your database - it just removes the saved query
   - The migration file is still in your codebase

8. **Move to next migration:**
   - Repeat steps 1-7 for the next migration file

---

## ⚠️ About Auto-Save

**Supabase automatically saves queries:**
- When you run a query, Supabase saves it as "Untitled query" in PRIVATE section
- This is automatic - you can't prevent it
- **That's OK!** Just delete them after running

**After running migrations:**
- You'll see multiple "Untitled query" entries
- Right-click each one → Delete
- Or keep them if you want (they won't hurt anything)

**Important:** The migration files in your codebase are still your source of truth!

---

## ❌ What NOT to Do

**Don't:**
- ❌ Rename "Untitled query" to migration names (creates confusion)
- ❌ Keep old development queries that duplicate migrations
- ❌ Worry about auto-saved queries (they're harmless)

**Why?** 
- Migration files are in your codebase (source of truth)
- Auto-saved queries are just temporary copies
- You can delete them anytime without affecting your database

---

## ✅ What to Keep in PRIVATE Section

**Only save these in SQL Editor:**

1. **Diagnostic queries:**
   - `CHECK-DATABASE-STATUS-SAFE.sql` (for checking what exists)
   - `CHECK-EXISTING-MIGRATIONS.sql` (for checking migrations)

2. **Useful utility queries:**
   - `Promote User to Admin` (if you use it)
   - `Insert policies for profiles` (if you use it)

**Everything else comes from migration files in your codebase!**

---

## 🎯 Quick Workflow

```
VS Code → Cmd+P → Type migration number → Enter
↓
Cmd+A → Cmd+C (copy entire file)
↓
Supabase SQL Editor → New query → Paste → Run
↓
Check errors → Close query (don't save)
↓
Repeat for next migration
```

---

## 📋 Example: Running First Migration

1. **VS Code:** `Cmd+P` → Type `20260116000001` → Enter
2. **File opens:** `20260116000001_initial_schema.sql`
3. **Copy:** `Cmd+A` → `Cmd+C`
4. **Supabase:** Go to SQL Editor → Click "New query"
5. **Paste:** `Cmd+V`
6. **Run:** Click "Run" button
7. **Check:** Look for errors (skip "already exists")
8. **Close:** Close the query tab (don't save)
9. **Next:** Repeat for `20260116000002`

---

## ⚠️ Important Notes

1. **Migration files are in your codebase** - that's your source of truth
2. **SQL Editor is just for running** - not for storing
3. **Don't save migration queries** - they're already saved in codebase
4. **Keep SQL Editor clean** - only diagnostic/utility queries

---

## 🧹 After Running Migrations

**Your SQL Editor PRIVATE section should have:**
- ✅ `CHECK-DATABASE-STATUS-SAFE.sql` (diagnostic)
- ✅ `Promote User to Admin` (optional utility)
- ✅ `Insert policies for profiles` (optional utility)

**That's it!** Everything else comes from your codebase migration files.

---

**Run migrations in SQL Editor, but don't save them there - they're already in your codebase!** 🚀
