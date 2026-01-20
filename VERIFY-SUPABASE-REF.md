# Verify Supabase Project Reference

## Your Supabase Project Reference
**Reference ID:** `ybtcciyyinxywitfmlhv`

## Expected URLs and Keys

### Project URL
Your `NEXT_PUBLIC_SUPABASE_URL` should be:
```
https://ybtcciyyinxywitfmlhv.supabase.co
```

### Where to Find Your Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (reference: `ybtcciyyinxywitfmlhv`)
3. Go to **Settings** → **API**
4. You'll see:
   - **Project URL:** `https://ybtcciyyinxywitfmlhv.supabase.co`
   - **anon public key:** (starts with `eyJhbGc...`)

## Verify in Vercel

### Check NEXT_PUBLIC_SUPABASE_URL
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_SUPABASE_URL`
3. Click the eye icon to reveal the value
4. **Should be:** `https://ybtcciyyinxywitfmlhv.supabase.co`
5. **If different:** Update it to match your project

### Check NEXT_PUBLIC_SUPABASE_ANON_KEY
1. Find `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Click the eye icon to reveal the value
3. **Should match:** The "anon public" key from Supabase Dashboard → Settings → API
4. **If different:** Copy the correct key from Supabase and update in Vercel

## Quick Verification Steps

### Step 1: Verify Project Exists
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Look for a project with reference `ybtcciyyinxywitfmlhv`
3. If you don't see it, you may need to:
   - Check if you're logged into the correct Supabase account
   - Verify the project hasn't been deleted or paused

### Step 2: Check Project Status
1. In Supabase Dashboard, select your project
2. Check the project status (should be "Active")
3. If paused, you'll need to resume it

### Step 3: Verify Database Tables
1. In Supabase Dashboard → Your Project
2. Go to **Table Editor**
3. Check if these tables exist:
   - `engines`
   - `parts`
   - `forum_categories`
   - `build_templates`

If tables don't exist, you need to run migrations.

### Step 4: Test Connection
After verifying/updating Vercel environment variables:
1. Wait for Vercel to redeploy (or manually trigger)
2. Visit: `https://gokartpartpicker.com/api/health/database`
3. This will show if the connection works

## Common Issues

### Issue: Project Reference Doesn't Match
**Symptom:** Environment variable has different project reference  
**Fix:** Update `NEXT_PUBLIC_SUPABASE_URL` in Vercel to match your actual project

### Issue: Wrong Anon Key
**Symptom:** Key doesn't match the one in Supabase Dashboard  
**Fix:** Copy the correct "anon public" key from Supabase → Settings → API and update in Vercel

### Issue: Project Paused
**Symptom:** Project exists but is paused  
**Fix:** Resume the project in Supabase Dashboard

### Issue: Tables Don't Exist
**Symptom:** Connection works but no data  
**Fix:** Run migrations from `supabase/migrations/` folder in Supabase SQL Editor

## Next Steps

1. ✅ Verify your Supabase project reference matches: `ybtcciyyinxywitfmlhv`
2. ✅ Check that `NEXT_PUBLIC_SUPABASE_URL` in Vercel is: `https://ybtcciyyinxywitfmlhv.supabase.co`
3. ✅ Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches your Supabase project
4. ✅ Check if database tables exist in your Supabase project
5. ✅ Test the health endpoint after redeploy
