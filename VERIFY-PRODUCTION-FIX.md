# Verify Production Database Fix

After Vercel deployment completes, follow these steps to verify everything is working.

## ✅ Step 1: Check Deployment Status

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `gokartpartpicker.com` project
3. Check the latest deployment:
   - Should show "Ready" status
   - Should have a green checkmark
   - Note the deployment time (should be recent)

## ✅ Step 2: Test Database Health Endpoint

Visit this URL in your browser:
```
https://gokartpartpicker.com/api/health/database
```

**Expected Result:**
```json
{
  "status": "healthy",
  "message": "Database is healthy",
  "checks": {
    "engines": { "exists": true, "count": 10 },
    "parts": { "exists": true, "count": 50 },
    "build_templates": { "exists": true, "count": 5 }
  }
}
```

**If you see errors:**
- `"status": "error"` → Check the `recommendations` array for specific fixes
- `"message": "Supabase environment variables not configured"` → Variables not set correctly in Vercel
- `"exists": false` → Need to run migrations in Supabase
- `"count": 0` → Need to run seed migrations

## ✅ Step 3: Test Live Website

1. Visit **https://gokartpartpicker.com**
2. Open browser DevTools (F12) → **Console** tab
3. Check for errors:
   - ❌ `Supabase is not configured` → Environment variables issue
   - ❌ `Failed to fetch` → Network/CORS issue
   - ❌ `permission denied` → RLS policy issue
   - ✅ No errors → Good!

4. Navigate to these pages and verify data loads:
   - **Homepage** (`/`) → Should show engines/parts
   - **Engines** (`/engines`) → Should list engines
   - **Parts** (`/parts`) → Should list parts
   - **Templates** (`/templates`) → Should show templates

## ✅ Step 4: Verify Data is Loading

On each page, check:
- [ ] Engines page shows engine cards
- [ ] Parts page shows part cards
- [ ] Templates page shows template cards
- [ ] No "Loading..." states stuck forever
- [ ] No empty states when data should exist

## 🔍 Troubleshooting

### Issue: Health endpoint shows "error"

**Check:**
1. Vercel environment variables are set correctly
2. Variable names match exactly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. No extra spaces or quotes in values
4. Redeploy after fixing

### Issue: Tables don't exist

**Fix:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Go to **SQL Editor**
4. Run migration files from `supabase/migrations/` in order:
   - Start with `20260116000001_initial_schema.sql`
   - Then `20260116000002_rls_policies.sql`
   - Continue with all other migrations

### Issue: Tables exist but count is 0

**Fix:**
1. Run seed migrations:
   - `20260116000004_seed_engines.sql`
   - `20260116000006_seed_parts.sql`
2. Or manually add data through Supabase Dashboard

### Issue: Browser console shows errors

**Common errors:**
- `Supabase is not configured` → Environment variables not set
- `Failed to fetch` → Check Supabase project URL is correct
- `permission denied` → Check RLS policies allow public read

## 📋 Quick Verification Checklist

After deployment:
- [ ] Vercel deployment shows "Ready"
- [ ] Health endpoint (`/api/health/database`) returns `"status": "healthy"`
- [ ] Homepage loads without errors
- [ ] Engines page shows engines
- [ ] Parts page shows parts
- [ ] Templates page shows templates
- [ ] Browser console has no Supabase errors

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Health endpoint shows all tables exist with data
- ✅ Website pages load and display engines/parts/templates
- ✅ No errors in browser console
- ✅ No infinite loading states

---

**Next:** If everything checks out, your production site should be fully functional!
