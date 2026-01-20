# 🚀 Production Deployment Checklist

**Simple step-by-step checklist to prepare for production**

---

## ✅ PHASE 1: Code Preparation

### Build & Type Checks
- [ ] Run `cd frontend && npm run build` - must succeed with no errors
- [ ] Fix any TypeScript errors if build fails
- [ ] Fix any ESLint warnings (run `npm run lint`)

### Git Cleanup
- [ ] Commit all changes: `git add . && git commit -m "chore: production ready"`
- [ ] Verify `.env*` files are in `.gitignore`
- [ ] Check `git status` - should be clean
- [ ] Push to GitHub: `git push origin main`

---

## ✅ PHASE 2: Database Preparation

### Run Migrations
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Run **all existing migrations** in order (23 files starting with `20260116000001_initial_schema.sql`)
- [ ] Run **performance migration**: `20260117000001_performance_indexes.sql`
- [ ] Run **N+1 fix migration**: `20260117000002_optimize_forum_category_counts.sql`
- [ ] Verify no errors in Supabase Dashboard

### Create Admin User
- [ ] Register an account in your app (or use existing)
- [ ] In Supabase Dashboard → Table Editor → `profiles`, find your user
- [ ] Set `role` to `'admin'` or `'super_admin'` for your account
- [ ] Test admin access at `/admin` page

---

## ✅ PHASE 3: Environment Variables

### In Vercel Dashboard
- [ ] Go to your Vercel project → Settings → Environment Variables
- [ ] Add these **required** variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ybtcciyyinxywitfmlhv.supabase.co:6543
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzc5OTcsImV4cCI6MjA4NDE1Mzk5N30.wnypXNLSnPLMhdjlgf3t4RE_1AVT9Opc1V7UHj6Ojo4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU3Nzk5NywiZXhwIjoyMDg0MTUzOTk3fQ.QGIWE_xBaYeZ-CDROa_bVEK2BgfYIt57p5vrN-kw3zM
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com
```

**Important:** 
- Use port `:6543` for connection pooling (required for production)
- Select all environments: **Production**, **Preview**, **Development**

### Verify Secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does **NOT** have `NEXT_PUBLIC_*` prefix ✓ (correct)
- [ ] After adding, redeploy Vercel project to pick up new variables

---

## ✅ PHASE 4: Supabase Pro Integrations (NEW!)

### GitHub Integration
- [ ] Go to Supabase Dashboard → Settings → Integrations → GitHub
- [ ] Connect your GitHub account
- [ ] Select your repository
- [ ] Configure branch mappings: `main` = production, `*` = preview
- [ ] Set migration path to: `supabase/migrations/`
- [ ] Enable "Auto-deploy migrations on push to main"
- [ ] Test: Create a PR and verify preview database is created

### Vercel Integration
- [ ] Go to Supabase Dashboard → Settings → Integrations → Vercel
- [ ] Connect your Vercel account
- [ ] Link your Vercel project to Supabase project
- [ ] Enable "Preview deployments"
- [ ] Test: Create a Vercel preview and verify it gets preview database

**See detailed guide:** `docs/SUPABASE-PRO-INTEGRATIONS-SETUP.md`

## ✅ PHASE 5: Vercel Deployment

### Project Setup
- [ ] Go to [vercel.com](https://vercel.com) → Add New Project
- [ ] Import from GitHub (select your repo)
- [ ] Framework: **Next.js** (auto-detected)
- [ ] Root Directory: `frontend` (if your frontend is in a subfolder)
- [ ] Build Command: `npm run build` (or `cd frontend && npm run build`)
- [ ] Output Directory: `.next` (default)

### Deploy
- [ ] Click "Deploy" (or push to main branch if auto-deploy enabled)
- [ ] Wait for build to complete
- [ ] Check build logs for errors
- [ ] Verify preview deployments get preview databases (if integration enabled)

---

## ✅ PHASE 6: Domain & SSL

### Custom Domain
- [ ] In Vercel project → Settings → Domains
- [ ] Add domain: `gokartpartpicker.com`
- [ ] Follow DNS instructions (add A/CNAME records)
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify SSL certificate is active (green checkmark)

---

## ✅ PHASE 7: Post-Deployment Testing

### Smoke Tests (Test on production URL)
- [ ] Homepage loads: `https://gokartpartpicker.com`
- [ ] Navigation works (click through menu)
- [ ] Engines page loads: `/engines`
- [ ] Parts page loads: `/parts`
- [ ] Builder page loads: `/builder`
- [ ] Forums page loads: `/forums`
- [ ] No console errors in browser DevTools

### Authentication Tests
- [ ] Can register new account
- [ ] Receive verification email
- [ ] Can verify email
- [ ] Can login
- [ ] Can logout
- [ ] Protected routes redirect properly

### Admin Tests (If you set role to admin)
- [ ] Can access `/admin` page
- [ ] Admin dashboard loads
- [ ] Can view engines/parts in admin

### Database Tests
- [ ] Engines display correctly
- [ ] Parts display correctly
- [ ] Forum categories load
- [ ] Forum topics load

---

## ✅ PHASE 8: Monitoring Setup

### Supabase Monitoring
- [ ] Go to Supabase Dashboard → Database → Reports
- [ ] Check "Query Performance" tab (should show queries running)
- [ ] Set up alerts: Settings → Alerts → Enable:
  - [ ] Database CPU > 80%
  - [ ] Database memory > 85%
  - [ ] Connection pool > 80%

### Vercel Monitoring
- [ ] Check Vercel Analytics (if enabled)
- [ ] Monitor deployment status
- [ ] Check error logs (if any)

---

## ✅ OPTIONAL: Performance Optimizations

### Only do these if you have time or notice performance issues:

#### Fix N+1 Query (Important for forums)
- [ ] Update `getForumCategories()` in `frontend/src/actions/forums.ts`
- [ ] Replace N+1 queries with database function call (see `docs/SUPABASE-PERFORMANCE-OPTIMIZATION.md`)

#### Caching (Optional but recommended)
- [ ] Add `export const revalidate = 60` to static pages (engines, parts)
- [ ] Implement Next.js caching for read-heavy queries

---

## 📋 Quick Reference

### Connection Strings
```
# ❌ WRONG (direct connection - not for production)
https://xxx.supabase.co

# ✅ CORRECT (pooled connection - use this)
https://xxx.supabase.co:6543
```

### Migration Order
1. All `20260116000001-23_*.sql` files (23 files)
2. `20260117000001_performance_indexes.sql` (new)
3. `20260117000002_optimize_forum_category_counts.sql` (new)

### Essential Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co:6543
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com
```

---

## 🐛 If Something Breaks

### Build Fails
1. Check build logs in Vercel
2. Run `npm run build` locally to see error
3. Fix error, commit, push again

### Database Errors
1. Check Supabase Dashboard → SQL Editor for errors
2. Verify all migrations ran successfully
3. Check RLS policies are enabled

### Authentication Not Working
1. Verify environment variables in Vercel
2. Check Supabase Dashboard → Authentication → Settings
3. Verify redirect URLs are configured

### Can't Access Admin
1. Verify your user `role` is `'admin'` in `profiles` table
2. Check admin layout is checking role correctly
3. Try logging out and back in

---

## ✅ Final Checklist Before Going Live

- [ ] All code committed and pushed
- [ ] All migrations run successfully
- [ ] Admin user created
- [ ] All environment variables set in Vercel
- [ ] Custom domain configured with SSL
- [ ] All smoke tests passed
- [ ] Authentication works
- [ ] Monitoring alerts set up

---

## 🎉 Ready to Launch!

Once all checkboxes are checked, your site is ready for production! 🚀

**Need help?** See detailed guides:
- `docs/PRODUCTION-DEPLOYMENT.md` - Full deployment guide
- `docs/SUPABASE-PERFORMANCE-OPTIMIZATION.md` - Performance tips
- `PRE-DEPLOYMENT-CHECKLIST.md` - Quick pre-deploy checklist
