# Production Deployment Checklist

> **Last Updated:** 2026-01-16  
> **Status:** Pre-deployment checklist

This document outlines all steps needed to prepare and deploy the GoKartPartPicker.com project to production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables ✅

#### Required for Production

**Supabase Configuration:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

**Application Configuration:**
```bash
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com
NEXT_PUBLIC_APP_NAME="GoKartPartPicker"
```

**Optional (Analytics/Tracking):**
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics 4
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gokartpartpicker.com  # Plausible Analytics
```

#### Action Items

- [ ] Create Supabase production project (if not exists)
- [ ] Set all environment variables in Vercel project settings
- [ ] Verify `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Document all env vars in `.env.example` for reference

---

### 2. Database Migrations ✅

#### Migration Files Status

All migrations are ready in `supabase/migrations/`:

- [x] `20260116000001_initial_schema.sql` - Core schema
- [x] `20260116000002_rls_policies.sql` - RLS policies
- [x] `20260116000003_rls_canary_tests.sql` - Security tests
- [x] `20260116000004_seed_engines.sql` - Engine seed data
- [x] `20260116000005_hardening_constraints.sql` - Constraints
- [x] `20260116000006_seed_parts.sql` - Parts seed data
- [x] `20260116000007_add_harbor_freight_links.sql` - Affiliate links
- [x] `20260116000008_*.sql` - Profile fixes
- [x] `20260116000009_add_profile_insert_policy.sql` - Auth policies
- [x] `20260116000010_simplify_profile_trigger.sql` - Trigger fixes
- [x] `20260116000011_add_build_templates.sql` - Templates
- [x] `20260116000012_*.sql` - Price tracking, videos
- [x] `20260116000013_*.sql` - Video seeding, user templates
- [x] `20260116000014_add_engine_clones.sql` - Engine cloning
- [x] `20260116000015_add_guides_enhancements.sql` - Guides
- [x] `20260116000016-20_*.sql` - Video enhancements
- [x] `20260116000021_forums_schema.sql` - Forums
- [x] `20260116000022_seed_forum_topics.sql` - Forum topics
- [x] `20260116000023_backfill_video_thumbnails.sql` - Video thumbnails

#### Deployment Steps

**Option A: Supabase Dashboard (Recommended)**

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file **in order** (by filename)
3. Verify migrations succeeded (check for errors)
4. Run verification queries:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check admin user exists
SELECT id, username, role, email 
FROM profiles 
WHERE role IN ('admin', 'super_admin');
```

**Option B: Supabase CLI** (if installed)

```bash
supabase link --project-ref your-project-ref
supabase db push
```

#### Action Items

- [ ] All migrations tested in staging/development
- [ ] Migration order verified (timestamps are sequential)
- [ ] Create admin user account in production database
- [ ] Verify RLS policies are active
- [ ] Test authentication flow end-to-end

---

### 3. Build & Type Checks ✅

#### Pre-Deployment Build Checks

```bash
cd frontend

# Install dependencies (ensure lock file is committed)
npm ci

# Type check (must pass with no errors)
npx tsc --noEmit

# Lint check (fix all warnings/errors)
npm run lint

# Production build (must succeed)
npm run build

# Test production build locally
npm start
```

#### Action Items

- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings/errors fixed
- [ ] Production build succeeds without errors
- [ ] Test production build locally (`npm start`)
- [ ] Verify no console errors in production build

---

### 4. Security Hardening ✅

#### Checklist

- [ ] All `.env*` files in `.gitignore`
- [ ] No API keys/secrets in code or commits
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-side only (not `NEXT_PUBLIC_*`)
- [ ] RLS policies enabled on all tables
- [ ] Admin routes protected (middleware/checks)
- [ ] Rate limiting enabled for public endpoints
- [ ] CORS configured (if needed)
- [ ] CSP headers configured (Content Security Policy)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (DOMPurify for user content)

#### Security Audit

```sql
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check admin role exists
SELECT COUNT(*) as admin_count 
FROM profiles 
WHERE role IN ('admin', 'super_admin');
```

#### Action Items

- [ ] Run security audit queries
- [ ] Review RLS policies in `supabase/migrations/20260116000002_rls_policies.sql`
- [ ] Verify admin authentication is required for `/admin/*` routes
- [ ] Check forum content sanitization (DOMPurify)

---

### 5. Git Repository ✅

#### Pre-Push Checklist

```bash
# Check git status (no uncommitted changes)
git status

# Ensure all changes are committed
git add .
git commit -m "chore: production deployment preparation"

# Verify .gitignore includes sensitive files
git check-ignore .env.local .env.production
```

#### Files to Verify in Repository

- [x] `.gitignore` includes `.env*`, `node_modules/`, `.next/`
- [ ] All migration files committed
- [ ] `package.json` and `package-lock.json` up to date
- [ ] No secrets in code history (check `git log`)
- [ ] README.md updated with deployment info

#### Action Items

- [ ] Commit all final changes
- [ ] Create a release tag (optional): `git tag -a v1.0.0 -m "Production release"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Push tags (if created): `git push origin --tags`

---

### 6. Vercel Deployment ✅

#### Project Setup

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub repository

2. **Configure Project Settings**
   - Framework Preset: **Next.js**
   - Root Directory: `frontend` (if monorepo structure)
   - Build Command: `npm run build` (or `cd frontend && npm run build`)
   - Output Directory: `.next` (default)
   - Install Command: `npm ci` (or `cd frontend && npm ci`)

3. **Environment Variables**
   - Add all required variables from **Section 1** above
   - Verify `NEXT_PUBLIC_*` vars are available to client
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is NOT `NEXT_PUBLIC_*`

4. **Domain Configuration**
   - Add custom domain: `gokartpartpicker.com`
   - Configure DNS (A/CNAME records per Vercel instructions)
   - Enable SSL/HTTPS (automatic with Vercel)

#### Action Items

- [ ] Import project to Vercel
- [ ] Set all environment variables in Vercel dashboard
- [ ] Configure build settings (root directory, build command)
- [ ] Deploy to preview environment first
- [ ] Test preview deployment end-to-end
- [ ] Configure custom domain
- [ ] Set up DNS records (if needed)
- [ ] Verify SSL certificate is active

---

### 7. Post-Deployment Verification ✅

#### Smoke Tests

After deployment, verify:

1. **Homepage**
   - [ ] Site loads without errors
   - [ ] Navigation works
   - [ ] No console errors

2. **Authentication**
   - [ ] Can register new account
   - [ ] Email verification works
   - [ ] Can login/logout
   - [ ] Protected routes redirect properly

3. **Database**
   - [ ] Can fetch engines list
   - [ ] Can fetch parts list
   - [ ] Can view engine/part details
   - [ ] Can save builds (if logged in)

4. **Admin Panel**
   - [ ] Admin routes accessible (if logged in as admin)
   - [ ] Admin dashboard loads
   - [ ] Can manage engines/parts
   - [ ] Can manage forums

5. **Forums**
   - [ ] Forum categories load
   - [ ] Can view topics
   - [ ] Can create posts (if logged in)
   - [ ] Moderation tools work (if admin)

6. **Builder**
   - [ ] Builder page loads
   - [ ] Can select parts
   - [ ] Compatibility checks work
   - [ ] Can save builds

#### Monitoring Setup

- [ ] Set up Vercel Analytics (optional)
- [ ] Configure Google Analytics / Plausible (if using)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring

---

### 8. Performance Optimization ✅

#### Checklist

- [ ] Images optimized (Next.js Image component)
- [ ] Code splitting enabled (automatic with Next.js)
- [ ] Static pages pre-rendered where possible
- [ ] API routes cached appropriately
- [ ] Database queries optimized (indexes present)
- [ ] Large dependencies tree-shaken

#### Action Items

- [ ] Run Lighthouse audit on production
- [ ] Verify Core Web Vitals are acceptable
- [ ] Check bundle size (`npm run build` shows sizes)
- [ ] Enable Vercel Edge caching where applicable

---

### 9. SEO & Metadata ✅

#### Checklist

- [ ] `<title>` tags on all pages
- [ ] `<meta description>` tags
- [ ] Open Graph tags for social sharing
- [ ] `robots.txt` configured correctly
- [ ] Sitemap generated (if applicable)
- [ ] Canonical URLs set

#### Files to Check

- [ ] `frontend/public/robots.txt` exists
- [ ] Metadata defined in page components
- [ ] Dynamic metadata for engine/part pages

---

### 10. Documentation ✅

#### Update Documentation

- [ ] README.md has deployment instructions
- [ ] Environment variables documented
- [ ] Database migration process documented
- [ ] Admin user creation documented
- [ ] Troubleshooting guide (if needed)

---

## 🚀 Deployment Steps (Summary)

### Step 1: Local Preparation

```bash
# 1. Final build check
cd frontend
npm ci
npm run build

# 2. Git commit
git add .
git commit -m "chore: production deployment"
git push origin main
```

### Step 2: Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Run all migrations in order (from `supabase/migrations/`)
3. Verify migrations succeeded
4. Create admin user account

### Step 3: Vercel Setup

1. Import project from GitHub
2. Set environment variables in Vercel dashboard
3. Configure build settings (root: `frontend`)
4. Deploy

### Step 4: Verification

1. Test homepage loads
2. Test authentication
3. Test admin panel
4. Test core features (builder, forums)
5. Verify no console errors

---

## 🐛 Troubleshooting

### Build Fails on Vercel

- Check build logs in Vercel dashboard
- Verify `package.json` has correct scripts
- Ensure all dependencies are in `package.json` (not just devDependencies if needed at runtime)
- Check for environment variable issues

### Database Connection Fails

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Check Supabase project is active
- Verify RLS policies allow public read access where needed

### Authentication Not Working

- Check `SUPABASE_SERVICE_ROLE_KEY` is set (server-side)
- Verify email templates are configured in Supabase
- Check redirect URLs in Supabase Auth settings

### Admin Routes Not Accessible

- Verify user has `role = 'admin'` or `'super_admin'` in `profiles` table
- Check middleware is not blocking admin routes
- Verify admin layout checks role correctly

---

## 📞 Support Contacts

- **Supabase Support:** [supabase.com/support](https://supabase.com/support)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **GitHub Issues:** Use repository issues for bugs

---

## ✅ Final Checklist Before Go-Live

- [ ] All environment variables set in Vercel
- [ ] All database migrations run successfully
- [ ] Production build succeeds locally
- [ ] Git repository is clean and pushed
- [ ] Admin user account created
- [ ] Smoke tests passed on preview deployment
- [ ] Custom domain configured and SSL active
- [ ] Analytics/tracking configured (if using)
- [ ] Error monitoring set up (if using)
- [ ] Documentation updated

---

**Ready to Deploy!** 🚀

After completing all checklist items, you're ready to deploy to production. Start with a preview deployment to test, then promote to production once verified.
