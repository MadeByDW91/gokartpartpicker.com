# Vercel Environment Variable Update Instructions

## What You Need to Do

I've automated most optimizations, but **you need to update one environment variable in Vercel** for connection pooling to work.

## Step-by-Step Instructions

### 1. Open Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Sign in if needed

### 2. Select Your Project
- Click on: **gokartpartpicker.com** (or your project name)

### 3. Go to Settings
- Click **"Settings"** in the top navigation bar

### 4. Open Environment Variables
- In the left sidebar, click **"Environment Variables"**

### 5. Find and Edit NEXT_PUBLIC_SUPABASE_URL
- Look for: `NEXT_PUBLIC_SUPABASE_URL`
- Click the **pencil/edit icon** next to it
- **Current value:** `https://ybtcciyyinxywitfmlhv.supabase.co`
- **Change to:** `https://ybtcciyyinxywitfmlhv.supabase.co:6543`
- **Important:** Just add `:6543` to the end

### 6. Apply to All Environments
- Make sure these are checked:
  - ✅ **Production**
  - ✅ **Preview**  
  - ✅ **Development**

### 7. Save
- Click **"Save"** or **"Update"**

### 8. Redeploy
- Go to **"Deployments"** tab
- Click **"..."** (three dots menu) on the latest deployment
- Click **"Redeploy"**
- Or push a new commit to GitHub (will auto-deploy)

## Visual Guide

```
Vercel Dashboard
  └─ Your Project (gokartpartpicker.com)
      └─ Settings (top nav)
          └─ Environment Variables (left sidebar)
              └─ NEXT_PUBLIC_SUPABASE_URL
                  └─ Edit → Add :6543 → Save
                      └─ Redeploy
```

## What This Does

**Before:**
- Direct connections: 120 max
- Each request opens new connection
- Can hit connection limits under load

**After:**
- Pooled connections: 400 max  
- Connections are reused efficiently
- 3.3x more concurrent users supported

## Verification

After redeploying, you can verify it's working:
1. Check Vercel deployment logs (should see no connection errors)
2. Monitor Supabase Dashboard → Database → Connection Pooling
3. Run the health check script: `npx tsx scripts/database-health-check.ts`

## Need Help?

If you can't find the environment variable:
1. Make sure you're logged in as the project owner
2. Check you're in the correct project
3. Try refreshing the page
4. Check if you have the right permissions

---

**Time Required:** 2 minutes  
**Difficulty:** Easy (just adding `:6543` to URL)  
**Impact:** High (3x more connections)
