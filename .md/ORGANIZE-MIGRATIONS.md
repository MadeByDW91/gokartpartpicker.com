# 📁 Organizing Your Migrations

**How to keep your database migrations organized and avoid confusion.**

---

## 📂 File Structure

```
gokartpartpicker.com/
├── supabase/
│   └── migrations/          ← SOURCE OF TRUTH (Keep all of these!)
│       ├── 20260116000001_initial_schema.sql
│       ├── 20260116000002_rls_policies.sql
│       ├── 20260116000004_seed_engines.sql
│       ├── 20260116000006_seed_parts.sql
│       └── ... (all other migrations)
│
├── ALL-MIGRATIONS-COMBINED.sql  ← Can delete (causes issues)
├── CHECK-DATABASE-STATUS.sql    ← Keep (diagnostic tool)
├── CHECK-EXISTING-MIGRATIONS.sql ← Keep (diagnostic tool)
└── FIX-DATABASE-ISSUES.md       ← Keep (troubleshooting guide)
```

---

## ✅ What to Keep

### In Your Codebase (Keep All):

1. **All files in `supabase/migrations/`**
   - These are your database schema
   - Version controlled
   - Source of truth

2. **Diagnostic/Helper Files:**
   - `CHECK-DATABASE-STATUS.sql` - Check what exists
   - `CHECK-EXISTING-MIGRATIONS.sql` - Check migrations
   - `FIX-DATABASE-ISSUES.md` - Troubleshooting guide
   - `MIGRATIONS-QUICK-START.md` - Quick reference

### In Supabase SQL Editor (Clean Up):

**Keep only:**
- Diagnostic queries you use regularly
- Custom queries for specific tasks

**Delete:**
- Old development queries
- One-off test queries
- Queries that duplicate migration files

---

## ❌ What You Can Delete

### Files You Can Remove:

1. **`ALL-MIGRATIONS-COMBINED.sql`**
   - Causes issues when run all at once
   - Use individual migration files instead
   - Can delete or keep as reference (but don't run it)

### SQL Editor Queries You Can Delete:

- Old seed data queries (now in migration files)
- Test queries from development
- One-off fixes (now in migrations)
- Duplicate queries

---

## 🎯 Best Practice Workflow

### For Running Migrations:

1. **Use migration files from codebase:**
   ```
   supabase/migrations/20260116000001_initial_schema.sql
   ```

2. **Open in your code editor** (VS Code, etc.)

3. **Copy the entire file**

4. **Paste into Supabase SQL Editor**

5. **Run it**

6. **Don't save it in SQL Editor** - it's already in your codebase!

### For Diagnostic Queries:

1. **Save useful diagnostic queries** in SQL Editor:
   - `CHECK-DATABASE-STATUS.sql`
   - `CHECK-EXISTING-MIGRATIONS.sql`

2. **Use these regularly** to check database state

3. **Keep them organized** in SQL Editor

---

## 📝 Recommended SQL Editor Organization

**After cleanup, your SQL Editor should have:**

```
PRIVATE
├── CHECK-DATABASE-STATUS.sql        ← Diagnostic
├── CHECK-EXISTING-MIGRATIONS.sql    ← Diagnostic
└── [Your custom queries]             ← Only if you use them regularly
```

**Everything else comes from migration files in your codebase!**

---

## 🚀 Migration Workflow

**When you need to run migrations:**

1. ✅ Open migration file from `supabase/migrations/`
2. ✅ Copy entire file
3. ✅ Paste into Supabase SQL Editor (new query)
4. ✅ Run it
5. ✅ Don't save (it's already in codebase)
6. ✅ Move to next migration file

**This keeps your SQL Editor clean and organized!**

---

## ⚠️ Important Reminders

1. **Migration files in codebase = Source of truth**
2. **SQL Editor queries = Just for convenience**
3. **Deleting SQL Editor queries ≠ Deleting database**
4. **Always use migration files from codebase for actual migrations**

---

**Clean up your SQL Editor, then use the organized migration files from your codebase!** 📁
