# Supabase Pro Integrations Setup Guide

> **Last Updated:** 2026-01-17  
> **Status:** Setup guide for GitHub and Vercel integrations with Supabase Pro

This guide walks you through setting up the GitHub and Vercel integrations that come with your Supabase Pro account.

---

## 🎉 What You Get with Pro Integrations

### GitHub Integration
- ✅ **Automatic migrations** - Push to GitHub → Supabase runs migrations automatically
- ✅ **Preview databases** - Each PR gets its own test database
- ✅ **CI/CD pipelines** - Test migrations before they hit production
- ✅ **Branch-based testing** - Safe testing environment for each feature branch

### Vercel Integration
- ✅ **Preview deployments** - Each Vercel preview gets its own Supabase preview database
- ✅ **Shared environment variables** - Automatic sync between Vercel and Supabase
- ✅ **Isolated testing** - Preview deployments don't affect production data
- ✅ **Automatic SSL** - Preview deployments get SSL certificates automatically

---

## 📋 Step 1: Set Up GitHub Integration

### 1.1 Connect Your Repository

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Integrations** → **GitHub**
3. Click **"Connect GitHub"** or **"Configure"**
4. Authorize Supabase to access your GitHub account
5. Select your repository: `gokartpartpicker.com` (or your repo name)

### 1.2 Configure Migration Settings

After connecting, configure:

**Branch Mappings:**
- **Production branch**: `main` (or `master`)
  - Migrations in this branch deploy to your production database
- **Preview branches**: `*` (all other branches)
  - Each PR/branch gets its own preview database

**Migration Path:**
- Set to: `supabase/migrations/`
- This tells Supabase where to find your migration files

**Auto-deploy:**
- ✅ Enable "Auto-deploy migrations on push to main"
- This automatically runs migrations when you merge to main

### 1.3 Test the Integration

1. Create a test branch:
   ```bash
   git checkout -b test-supabase-integration
   ```

2. Create a test migration:
   ```sql
   -- supabase/migrations/20260117000004_test_integration.sql
   -- This is just a test, won't affect anything
   SELECT 'GitHub integration test' AS message;
   ```

3. Commit and push:
   ```bash
   git add supabase/migrations/20260117000004_test_integration.sql
   git commit -m "test: verify Supabase GitHub integration"
   git push origin test-supabase-integration
   ```

4. Create a PR on GitHub
5. Check Supabase Dashboard → **Database** → **Migrations**
   - You should see a preview database created for your PR
   - The migration should run automatically

6. Merge the PR to `main`
7. Check Supabase Dashboard again
   - The migration should now run on production

### 1.4 Verify It's Working

✅ **Success indicators:**
- Preview database appears in Supabase Dashboard when you create a PR
- Migrations run automatically when you push to `main`
- You can see migration history in Supabase Dashboard

---

## 📋 Step 2: Set Up Vercel Integration

### 2.1 Connect Vercel Account

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Integrations** → **Vercel**
3. Click **"Connect Vercel"** or **"Configure"**
4. Authorize Supabase to access your Vercel account
5. Select your Vercel project (or create one if you haven't)

### 2.2 Link Projects

After connecting:

1. **Select your Vercel project** from the dropdown
2. **Select your Supabase project** (should auto-detect)
3. Enable **"Preview deployments"**
   - This creates preview databases for each Vercel preview deployment

### 2.3 Configure Environment Variables

The integration will automatically:
- ✅ Sync Supabase environment variables to Vercel
- ✅ Create preview-specific variables for preview deployments
- ✅ Keep production variables separate from preview variables

**You still need to manually set these in Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ybtcciyyinxywitfmlhv.supabase.co:6543
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<from Supabase project API settings>
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com
```

**But the integration will:**
- Automatically create preview-specific `NEXT_PUBLIC_SUPABASE_URL` for preview deployments
- Point preview deployments to preview databases (not production)

### 2.4 Test the Integration

1. Create a test branch and push to GitHub
2. Vercel will automatically create a preview deployment
3. Check Supabase Dashboard → **Database** → **Projects**
   - You should see a preview database created for this Vercel preview
4. Visit the Vercel preview URL
5. Verify it connects to the preview database (not production)

### 2.5 Verify It's Working

✅ **Success indicators:**
- Preview databases appear in Supabase when Vercel creates preview deployments
- Preview deployments use preview databases (isolated from production)
- Production deployments use production database

---

## 🔄 New Workflow with Integrations

### Before (Manual):
```
1. Write migration locally
2. Copy SQL to Supabase Dashboard
3. Run migration manually
4. Hope nothing breaks
5. Deploy to Vercel manually
6. All previews use same database (risky)
```

### After (Automated):
```
1. Write migration in supabase/migrations/
2. Push to GitHub PR
3. Supabase auto-creates preview database
4. Test migration safely in preview
5. Merge PR → auto-deploys to production
6. Vercel previews get their own preview databases
7. Zero manual steps!
```

---

## 🎯 Best Practices

### Migration Workflow

1. **Always test in preview first:**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Add migration
   # supabase/migrations/20260117000005_new_feature.sql
   
   # Push and create PR
   git push origin feature/new-feature
   ```

2. **Test in preview database:**
   - Supabase creates preview DB automatically
   - Test your changes safely
   - Verify migration works correctly

3. **Merge when ready:**
   ```bash
   # Merge PR to main
   # Supabase automatically runs migration on production
   # Vercel automatically deploys to production
   ```

### Environment Variables

**Production (Vercel):**
- Uses production Supabase database
- Set manually in Vercel Dashboard

**Preview (Vercel):**
- Uses preview Supabase database (auto-created)
- Environment variables auto-synced by integration

### Database Management

**Production Database:**
- Only modified by migrations merged to `main`
- Protected by Supabase Pro automatic backups
- 7-day backup retention

**Preview Databases:**
- Created automatically for PRs/previews
- Deleted when PR is closed/preview expires
- Safe to test anything without affecting production

---

## 🐛 Troubleshooting

### GitHub Integration Not Working

**Problem:** Migrations not running automatically

**Solutions:**
1. Check Supabase Dashboard → **Settings** → **Integrations** → **GitHub**
   - Verify repository is connected
   - Check branch mappings are correct
   - Ensure migration path is `supabase/migrations/`

2. Check GitHub repository settings
   - Verify Supabase has access to repository
   - Check webhook is installed (Supabase should add this automatically)

3. Check migration files
   - Ensure files are in `supabase/migrations/` directory
   - Verify file naming: `YYYYMMDDHHMMSS_description.sql`
   - Check SQL syntax is valid

### Vercel Integration Not Working

**Problem:** Preview deployments not getting preview databases

**Solutions:**
1. Check Supabase Dashboard → **Settings** → **Integrations** → **Vercel**
   - Verify Vercel account is connected
   - Check project is linked correctly
   - Ensure "Preview deployments" is enabled

2. Check Vercel project settings
   - Verify Supabase integration is installed
   - Check environment variables are set

3. Check preview deployment logs
   - Look for Supabase connection errors
   - Verify preview database was created

### Preview Database Not Created

**Problem:** PR created but no preview database appears

**Solutions:**
1. Wait a few minutes (creation can take 1-2 minutes)
2. Check Supabase Dashboard → **Database** → **Projects**
   - Look for preview databases (may be in separate section)
3. Check Supabase logs for errors
4. Verify GitHub integration is properly configured

---

## ✅ Verification Checklist

After setting up both integrations:

- [ ] GitHub repository connected in Supabase
- [ ] Branch mappings configured (main = production, * = preview)
- [ ] Migration path set to `supabase/migrations/`
- [ ] Test PR created preview database successfully
- [ ] Test migration ran in preview database
- [ ] Vercel account connected in Supabase
- [ ] Vercel project linked to Supabase project
- [ ] Preview deployments enabled
- [ ] Test Vercel preview got its own preview database
- [ ] Production environment variables set in Vercel
- [ ] Preview deployments work correctly

---

## 🎉 You're All Set!

With both integrations configured, you now have:

✅ **Automated migrations** - No more manual SQL copying  
✅ **Safe testing** - Preview databases for every PR  
✅ **Isolated deployments** - Preview deployments don't affect production  
✅ **CI/CD pipeline** - Push to GitHub → Auto-deploy to production  
✅ **Automatic backups** - 7-day retention on production database  

**Next Steps:**
1. Test the workflow with a small migration
2. Create a PR and verify preview database is created
3. Merge to main and verify production migration runs
4. Deploy to Vercel and verify preview gets preview database

---

## 📚 Additional Resources

- [Supabase GitHub Integration Docs](https://supabase.com/docs/guides/platform/github-integration)
- [Supabase Vercel Integration Docs](https://supabase.com/docs/guides/platform/vercel-integration)
- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)

---

**Need help?** Check the troubleshooting section above or refer to Supabase documentation.
