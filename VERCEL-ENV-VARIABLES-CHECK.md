# Vercel Environment Variables Check

## ✅ Variables That Are Set Correctly

1. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - ✅ Scope: All Environments
   - ✅ This is correct - needed everywhere

2. **`NEXT_PUBLIC_SUPABASE_URL`**
   - ⚠️ Scope: Production only
   - ⚠️ **Issue:** Should be set for "All Environments" to work in Preview deployments too

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   - ✅ Scope: Production and Preview
   - ✅ This is correct for admin operations

## ⚠️ Potential Issues

### Issue 1: NEXT_PUBLIC_SUPABASE_URL Scope
**Current:** Only set for Production  
**Problem:** Preview deployments won't have access to this variable  
**Fix:** Change scope to "All Environments"

### Issue 2: Duplicate Variables
You have several duplicate/alternative Supabase variables that aren't needed:
- `SUPABASE_URL` (not used by code - uses `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (not used by code - uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not used by code)

**Note:** These won't cause errors, but they're unnecessary clutter.

## 🔧 Recommended Fix

### Step 1: Update NEXT_PUBLIC_SUPABASE_URL Scope
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_SUPABASE_URL`
3. Click the three-dot menu → Edit
4. Change scope from "Production" to "All Environments"
5. Save

### Step 2: Verify Values Are Correct
Make sure the values match your Supabase project:
- `NEXT_PUBLIC_SUPABASE_URL` should be: `https://your-project-ref.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be your anon/public key

### Step 3: Redeploy
After changing the scope, Vercel will auto-redeploy, or you can manually trigger a redeploy.

## ✅ Verification Checklist

After fixing:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` scope is "All Environments"
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` scope is "All Environments"
- [ ] Values match your Supabase project
- [ ] Test health endpoint: `https://gokartpartpicker.com/api/health/database`
- [ ] Test pages: `/engines`, `/parts`, `/forums`

## 🎯 What Your Code Uses

Your application code specifically uses:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (set, but scope issue)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (set correctly)
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (set correctly, for admin only)

All other Supabase variables in your list are not used by the code and can be ignored or removed.
