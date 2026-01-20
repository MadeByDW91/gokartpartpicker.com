# 🚀 Vercel Setup - Step by Step

## ✅ Step 1: Code is on GitHub! ✓

Your code is now at: https://github.com/MadeByDW91/gokartpartpicker.com

---

## ✅ Step 2: Create Vercel Project

### 2.1 Go to Vercel

1. Open: https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. **Sign in with GitHub** (recommended - easier integration)

### 2.2 Import Project

1. Click **"Add New Project"** (or **"Import Project"**)
2. You'll see your GitHub repositories
3. Find and select: **`MadeByDW91/gokartpartpicker.com`**
4. Click **"Import"**

### 2.3 Configure Project Settings

**IMPORTANT:** Set these correctly:

- **Framework Preset:** `Next.js` (should auto-detect)
- **Root Directory:** `frontend` ⚠️ **CRITICAL - Change this!**
  - Click "Edit" next to Root Directory
  - Change from `/` to `frontend`
- **Build Command:** `npm run build` (or leave default)
- **Output Directory:** `.next` (default is fine)
- **Install Command:** `npm ci` (or leave default)

**Why `frontend`?** Your Next.js app is in the `frontend/` folder, not the root.

---

## ✅ Step 3: Add Environment Variables

**BEFORE clicking "Deploy", add environment variables:**

1. In the project setup page, scroll down to **"Environment Variables"**
2. Click **"Add"** for each variable below
3. Select **ALL environments**: Production, Preview, Development

### Required Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ybtcciyyinxywitfmlhv.supabase.co:6543
```

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzc5OTcsImV4cCI6MjA4NDE1Mzk5N30.wnypXNLSnPLMhdjlgf3t4RE_1AVT9Opc1V7UHj6Ojo4
```

```bash
SUPABASE_SERVICE_ROLE_KEY=<ROTATE_AND_SET_IN_SUPABASE_AND_VERCEL>
```

```bash
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com
```

**Important Notes:**
- ✅ Use port `:6543` for connection pooling (production requirement)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` should **NOT** have `NEXT_PUBLIC_` prefix
- ✅ Select **ALL environments** (Production, Preview, Development)

---

## ✅ Step 4: Deploy!

1. After adding all environment variables, click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Watch the build logs - should see:
   - ✅ Installing dependencies
   - ✅ Building Next.js app
   - ✅ Build successful

### If Build Fails:

**Common Issues:**

1. **"Root Directory not found"**
   - Fix: Set Root Directory to `frontend`

2. **"Cannot find module"**
   - Fix: Make sure Root Directory is `frontend`

3. **"Environment variable not found"**
   - Fix: Verify all variables are added and selected for all environments

---

## ✅ Step 5: Your Site is Live!

After successful deployment:

1. **Your site URL:** `https://your-project-name.vercel.app`
2. **Check it works:**
   - Visit the URL
   - Test homepage
   - Test navigation
   - Check browser console for errors

---

## ✅ Step 6: Complete Supabase Integrations

### 6.1 Fix GitHub Integration

1. Go to **Supabase Dashboard** → **Settings** → **Integrations** → **GitHub**
2. The "Branch 'main' not found" error should be **GONE**! ✅
3. Verify settings:
   - Repository: `MadeByDW91/gokartpartpicker.com` ✅
   - Supabase directory: `.` (root)
   - Production branch: `main` ✅
4. Click **"Enable integration"**

### 6.2 Set Up Vercel Integration

1. Go to **Supabase Dashboard** → **Settings** → **Integrations** → **Vercel**
2. Click **"Connect Vercel"**
3. Authorize Supabase to access Vercel
4. Select your Vercel project
5. Enable **"Preview deployments"**
6. This automatically:
   - Creates preview databases for Vercel previews
   - Syncs environment variables
   - Isolates preview deployments

---

## ✅ Step 7: Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add domain: `gokartpartpicker.com`
3. Follow DNS instructions:
   - Add A record or CNAME as shown
   - Wait 5-30 minutes for DNS propagation
4. SSL certificate issues automatically

---

## 🎉 You're Live!

Your site is now in production! 🚀

**Next Steps:**
- Test all features
- Set up monitoring
- Share with users!

---

## 📋 Quick Checklist

- [ ] Code pushed to GitHub ✅
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root Directory set to `frontend`
- [ ] All environment variables added
- [ ] Build successful
- [ ] Site loads correctly
- [ ] Supabase GitHub integration enabled
- [ ] Supabase Vercel integration enabled
- [ ] Custom domain configured (optional)
