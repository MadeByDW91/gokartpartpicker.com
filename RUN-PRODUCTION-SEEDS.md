# Run Production Seed Data - Quick Guide

## ✅ Status Check
Your health check shows:
- ✅ Environment variables configured
- ✅ Tables exist
- ❌ **No data** (engines: 0, parts: 0, templates: 0)

## 🚀 Solution: Run Seed Migrations

You need to run these 3 seed migrations in your **production Supabase database**:

### Step 1: Go to Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ybtcciyyinxywitfmlhv
2. Click **"SQL Editor"** in the left sidebar

### Step 2: Run Engine Seed Migration
1. Open the file: `supabase/migrations/20260116000004_seed_engines.sql`
2. Copy the **entire contents** of the file
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see: "Success. No rows returned"

This will add ~10 engines (Predator 79cc, 212cc, 420cc, etc.)

### Step 3: Run Parts Seed Migration
1. Open the file: `supabase/migrations/20260116000006_seed_parts.sql`
2. Copy the **entire contents** of the file
3. Paste into Supabase SQL Editor
4. Click **"Run"**
5. You should see: "Success. No rows returned"

This will add sample parts (clutches, chains, sprockets, etc.)

### Step 4: Run Templates Seed Migration (Optional)
1. Open the file: `supabase/migrations/20260117000003_seed_build_templates.sql`
2. Copy the **entire contents** of the file
3. Paste into Supabase SQL Editor
4. Click **"Run"**

This will add build templates (Beginner, Kids, Budget, etc.)

### Step 5: Verify Data Was Added
Run these queries in SQL Editor to verify:

```sql
-- Check engines
SELECT COUNT(*) as engine_count FROM engines WHERE is_active = true;
-- Should return > 0

-- Check parts
SELECT COUNT(*) as part_count FROM parts WHERE is_active = true;
-- Should return > 0

-- Check templates
SELECT COUNT(*) as template_count FROM build_templates 
WHERE is_public = true AND is_active = true AND approval_status = 'approved';
-- Should return > 0
```

### Step 6: Test Live Site
1. Visit: https://gokartpartpicker.com/engines
2. Visit: https://gokartpartpicker.com/parts
3. Visit: https://gokartpartpicker.com/templates
4. Data should now be visible!

## 🔍 If Migrations Fail

**Error: "relation does not exist"**
- Run the schema migration first: `20260116000001_initial_schema.sql`

**Error: "duplicate key value"**
- This is OK - means data already exists. The `ON CONFLICT DO NOTHING` prevents errors.

**Error: "permission denied"**
- Check RLS policies are set correctly
- Run: `20260116000002_rls_policies.sql` if not already run

## 📋 Quick Checklist

- [ ] Run `20260116000004_seed_engines.sql` in production Supabase
- [ ] Run `20260116000006_seed_parts.sql` in production Supabase
- [ ] Run `20260117000003_seed_build_templates.sql` in production Supabase (optional)
- [ ] Verify data with COUNT queries
- [ ] Test live site - engines/parts should now show

---

**Note:** These migrations are idempotent (safe to run multiple times). They use `ON CONFLICT DO NOTHING` so they won't create duplicates.
