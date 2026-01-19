# 🚀 Pre-Deployment Checklist

**Quick reference checklist before pushing to GitHub and deploying to Vercel**

---

## ✅ 1. Code Quality Checks

```bash
cd frontend

# Type check
npx tsc --noEmit

# Lint check
npm run lint

# Production build (must succeed)
npm run build
```

- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no errors
- [ ] Production build succeeds locally

---

## ✅ 2. Environment Variables

**Required for Vercel:**

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only

# Application (Required)
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com

# Optional (Analytics)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Action:**
- [ ] All environment variables set in Vercel project settings
- [ ] `.env*` files are in `.gitignore` (verify with `git check-ignore .env.local`)
- [ ] No secrets committed to git (check `git log`)

---

## ✅ 3. Database Migrations

**All migrations ready in `supabase/migrations/`:**

- [x] `20260116000001_initial_schema.sql`
- [x] `20260116000002_rls_policies.sql`
- [x] `20260116000003_rls_canary_tests.sql`
- [x] `20260116000004_seed_engines.sql`
- [x] `20260116000005_hardening_constraints.sql`
- [x] ... (all 23 migrations)

**Action:**
- [ ] Run all migrations in Supabase Dashboard (SQL Editor) **in order**
- [ ] Verify all tables created successfully
- [ ] Create admin user account in production database
- [ ] Test authentication flow

---

## ✅ 4. Git Repository

```bash
# Check status
git status

# Ensure all changes committed
git add .
git commit -m "chore: production deployment preparation"

# Verify sensitive files are ignored
git check-ignore .env.local .env.production
```

**Action:**
- [ ] All changes committed
- [ ] `.env*` files in `.gitignore`
- [ ] No secrets in git history
- [ ] Ready to push: `git push origin main`

---

## ✅ 5. Vercel Deployment Setup

**Project Settings:**
- Framework: **Next.js**
- Root Directory: `frontend` (if monorepo)
- Build Command: `npm run build` (or `cd frontend && npm run build`)
- Output Directory: `.next` (default)

**Environment Variables:**
- [ ] All variables from Section 2 added in Vercel dashboard
- [ ] `NEXT_PUBLIC_*` variables are available to client
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **NOT** `NEXT_PUBLIC_*`

**Domain:**
- [ ] Custom domain configured: `gokartpartpicker.com`
- [ ] DNS records set up (A/CNAME per Vercel instructions)
- [ ] SSL certificate active

---

## ✅ 6. Post-Deployment Verification

After deployment, test:

- [ ] Homepage loads without errors
- [ ] Can register new account
- [ ] Email verification works
- [ ] Can login/logout
- [ ] Engines page loads
- [ ] Parts page loads
- [ ] Builder page loads
- [ ] Forums page loads
- [ ] Admin panel accessible (if admin)
- [ ] No console errors in browser

---

## ✅ 7. Security Checklist

- [ ] All `.env*` files in `.gitignore`
- [ ] No API keys/secrets in code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-side only
- [ ] RLS policies enabled on all tables
- [ ] Admin routes protected
- [ ] User content sanitized (DOMPurify)

---

## ✅ 8. Quick Deployment Steps

### Step 1: Local Checks
```bash
cd frontend
npm ci
npm run build
```

### Step 2: Git Push
```bash
git add .
git commit -m "chore: production deployment"
git push origin main
```

### Step 3: Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Run all migrations in order (from `supabase/migrations/`)
3. Verify success

### Step 4: Vercel Deploy
1. Import project from GitHub (or auto-deploy on push)
2. Set environment variables in Vercel dashboard
3. Configure build settings
4. Deploy

### Step 5: Verify
1. Test homepage
2. Test authentication
3. Test core features
4. Check for errors

---

## 📋 Summary Checklist

- [ ] TypeScript compiles
- [ ] Build succeeds locally
- [ ] All environment variables set in Vercel
- [ ] All migrations run in production database
- [ ] Admin user created
- [ ] Git repository clean and pushed
- [ ] Vercel project configured
- [ ] Custom domain configured
- [ ] Smoke tests passed on production

---

**✅ Ready to Deploy!**

For detailed instructions, see [`docs/PRODUCTION-DEPLOYMENT.md`](./docs/PRODUCTION-DEPLOYMENT.md)
