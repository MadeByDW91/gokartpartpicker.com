# 🚀 Production Deployment Quickstart

**Goal:** Push to GitHub → Deploy to Vercel → Go Live!

---

## ✅ STEP 1: Push to GitHub (5 minutes)

### Option A: Using Personal Access Token (Recommended)

1. **Create GitHub Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: `gokartpartpicker-production`
   - Scope: ✅ **repo** (Full control)
   - Click "Generate" and **COPY THE TOKEN**

2. **Push to GitHub:**
   ```bash
   cd "/Users/dillonwallace/Desktop/Garage Built Digital LLC/Websites Testing/gokartpartpicker.com"
   git push -u origin main
   ```
   - Username: `MadeByDW91`
   - Password: **Paste your token** (not GitHub password)

### Option B: Using GitHub Desktop (Easier)

1. Download: https://desktop.github.com/
2. Sign in with GitHub
3. File → Add Local Repository
4. Select project folder
5. Click "Publish repository"

**✅ Verify:** Go to https://github.com/MadeByDW91/gokartpartpicker.com - files should be there!

---

## ✅ STEP 2: Set Up Vercel (10 minutes)

### 2.1 Create Vercel Account/Project

1. Go to: https://vercel.com
2. Sign in with GitHub (recommended)
3. Click **"Add New Project"**
4. Import from GitHub:
   - Select repository: `MadeByDW91/gokartpartpicker.com`
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `frontend` ⚠️ **IMPORTANT!**
   - Build Command: `npm run build` (or `cd frontend && npm run build`)
   - Output Directory: `.next` (default)
   - Install Command: `npm ci` (or `cd frontend && npm ci`)

### 2.2 Configure Environment Variables

**Before deploying, add these in Vercel:**

Go to: **Project Settings** → **Environment Variables**

Add these **required** variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ybtcciyyinxywitfmlhv.supabase.co:6543
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzc5OTcsImV4cCI6MjA4NDE1Mzk5N30.wnypXNLSnPLMhdjlgf3t4RE_1AVT9Opc1V7UHj6Ojo4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU3Nzk5NywiZXhwIjoyMDg0MTUzOTk3fQ.QGIWE_xBaYeZ-CDROa_bVEK2BgfYIt57p5vrN-kw3zM
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com
```

**Important:**
- Select **ALL environments**: Production, Preview, Development
- Use port `:6543` for connection pooling (production requirement)
- `SUPABASE_SERVICE_ROLE_KEY` should **NOT** have `NEXT_PUBLIC_` prefix

### 2.3 Deploy!

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Check build logs for any errors
4. Your site will be live at: `https://your-project.vercel.app`

---

## ✅ STEP 3: Complete Supabase Integrations (5 minutes)

### 3.1 Fix GitHub Integration

1. Go to **Supabase Dashboard** → **Settings** → **Integrations** → **GitHub**
2. The "Branch 'main' not found" error should be **gone** now!
3. Verify settings:
   - Repository: `MadeByDW91/gokartpartpicker.com`
   - Supabase directory: `.` (root)
   - Production branch: `main`
   - Deploy to production: ✅ Enabled
   - Automatic branching: ✅ Enabled
4. Click **"Enable integration"**

### 3.2 Set Up Vercel Integration

1. Go to **Supabase Dashboard** → **Settings** → **Integrations** → **Vercel**
2. Click **"Connect Vercel"**
3. Authorize Supabase to access Vercel
4. Select your Vercel project
5. Enable **"Preview deployments"**
6. This will automatically:
   - Create preview databases for each Vercel preview
   - Sync environment variables
   - Isolate preview deployments from production

---

## ✅ STEP 4: Custom Domain (Optional but Recommended)

1. In Vercel project → **Settings** → **Domains**
2. Add domain: `gokartpartpicker.com`
3. Follow DNS instructions:
   - Add A record or CNAME as instructed
   - Wait for DNS propagation (5-30 minutes)
4. SSL certificate will be issued automatically

---

## ✅ STEP 5: Verify Production (5 minutes)

### Test These Pages:

- [ ] Homepage loads: `https://your-project.vercel.app`
- [ ] Engines page: `/engines`
- [ ] Parts page: `/parts`
- [ ] Builder page: `/builder`
- [ ] Forums page: `/forums`
- [ ] Templates page: `/templates`
- [ ] No console errors in browser DevTools

### Test Authentication:

- [ ] Can register new account
- [ ] Receive verification email
- [ ] Can verify email and login
- [ ] Can logout

### Test Admin (If you set role to admin):

- [ ] Can access `/admin` page
- [ ] Admin dashboard loads

---

## 🎯 Quick Command Reference

```bash
# Push to GitHub
cd "/Users/dillonwallace/Desktop/Garage Built Digital LLC/Websites Testing/gokartpartpicker.com"
git push -u origin main

# Check git status
git status

# View recent commits
git log --oneline -5
```

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Verify root directory is set to `frontend`
- Ensure `package.json` has correct scripts

### Environment Variables Not Working
- Verify all variables are set in Vercel
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Database Connection Fails
- Verify Supabase URL uses port `:6543`
- Check API keys are correct
- Verify Supabase project is active

### GitHub Integration Still Shows Error
- Refresh Supabase dashboard
- Verify repository is pushed to GitHub
- Check branch name is `main` (not `master`)

---

## ✅ Final Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] Vercel project created and configured
- [ ] Environment variables set in Vercel
- [ ] Build succeeds on Vercel
- [ ] Supabase GitHub integration enabled
- [ ] Supabase Vercel integration enabled
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active

---

## 🎉 You're Live!

Once all checkboxes are done, your site is in production! 🚀

**Next Steps:**
- Monitor Vercel analytics
- Set up Supabase monitoring alerts
- Test all features thoroughly
- Share with users!
