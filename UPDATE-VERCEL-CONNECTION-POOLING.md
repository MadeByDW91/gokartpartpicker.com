# Update Vercel Environment Variable for Connection Pooling

## Quick Steps (2 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **gokartpartpicker.com**

2. **Navigate to Environment Variables**
   - Click **"Settings"** (top navigation)
   - Click **"Environment Variables"** (left sidebar)

3. **Update NEXT_PUBLIC_SUPABASE_URL**
   - Find the variable: `NEXT_PUBLIC_SUPABASE_URL`
   - **Current value:** `https://ybtcciyyinxywitfmlhv.supabase.co`
   - **New value:** `https://ybtcciyyinxywitfmlhv.supabase.co:6543`
   - **Important:** Add `:6543` to the end
   - Click **"Save"** or **"Update"**

4. **Apply to All Environments**
   - Make sure it's checked for:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**

5. **Redeploy**
   - Go to **"Deployments"** tab
   - Click **"..."** (three dots) on the latest deployment
   - Click **"Redeploy"**
   - Or just push a new commit to trigger a new deployment

## What This Does

- **Before:** 120 max connections (direct)
- **After:** 400 max connections (pooled)
- **Benefit:** 3.3x more concurrent users without hitting limits

## Verify It's Working

After redeploying, check your application logs:
- Should see connections using port 6543
- No connection limit errors
- Better performance under load

## Need Help?

If you can't find the environment variable:
1. Make sure you're in the correct project
2. Check that you have admin access
3. Try refreshing the page

---

**Time Required:** 2 minutes  
**Impact:** High (3x more connections)  
**Risk:** Low (just changing port number)
