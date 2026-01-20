# Troubleshooting Dev Server & Deployment Issues

## Issue: localhost:3001 won't connect

### Problem
The Next.js dev server runs on port **3000** by default, but some code was hardcoded to use port **3001**.

### Solution
The code has been updated to:
1. Use `process.env.PORT` if set
2. Default to port 3000 (Next.js default)
3. Use `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL` in production

### How to Start Dev Server

```bash
cd frontend
npm run dev
```

The server will start on **http://localhost:3000** (not 3001).

### If You Need a Different Port

You can set the PORT environment variable:

```bash
PORT=3001 npm run dev
```

Or create a `.env.local` file in the `frontend` directory:

```bash
PORT=3001
```

---

## Issue: Updates Not Deploying to Live Server

### Check Deployment Status

1. **GitHub Status**
   ```bash
   git status
   git log --oneline -5
   ```
   - Ensure all changes are committed
   - Ensure branch is pushed to `origin/main`

2. **Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Check the "Deployments" tab
   - Look for:
     - ✅ Successful builds
     - ❌ Failed builds (check logs)
     - ⏳ In-progress builds

3. **Check Build Logs**
   - Click on a deployment
   - Review "Build Logs" for errors
   - Common issues:
     - Missing environment variables
     - TypeScript errors
     - Build timeouts
     - Dependency installation failures

### Common Deployment Issues

#### 1. Build Failures
**Symptoms**: Deployment shows "Build Failed"
**Fix**: 
- Check build logs in Vercel
- Run `npm run build` locally to catch errors
- Fix TypeScript/ESLint errors
- Ensure all dependencies are in `package.json`

#### 2. Missing Environment Variables
**Symptoms**: App works locally but fails in production
**Fix**:
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add all required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `YOUTUBE_API_KEY` (for auto-video feature)
  - Any other API keys

#### 3. Git Not Connected
**Symptoms**: Pushes to GitHub don't trigger deployments
**Fix**:
- Go to Vercel Dashboard → Project → Settings → Git
- Ensure GitHub repository is connected
- Check that the branch is set to `main`
- Verify webhook is active

#### 4. Preview vs Production
**Symptoms**: Changes appear in preview but not production
**Fix**:
- Ensure you're pushing to `main` branch (not a feature branch)
- Production deployments only trigger from `main`
- Preview deployments trigger from all branches

---

## Quick Diagnostic Commands

### Check Local Server
```bash
# Check if server is running
lsof -ti:3000

# Test if server responds
curl http://localhost:3000

# Start dev server
cd frontend && npm run dev
```

### Check Git Status
```bash
# See uncommitted changes
git status

# See recent commits
git log --oneline -5

# Check remote connection
git remote -v

# Push to GitHub
git push origin main
```

### Test Build Locally
```bash
cd frontend
npm run build
```

This will catch build errors before they reach Vercel.

---

## Environment Variables Checklist

Ensure these are set in **both** local `.env.local` and Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `YOUTUBE_API_KEY` (for auto-video feature)
- [ ] `NEXT_PUBLIC_SITE_URL` (optional, for production URL)

---

## Still Having Issues?

1. **Check Vercel Status**: https://www.vercel-status.com/
2. **Review Build Logs**: Detailed error messages in Vercel dashboard
3. **Test Locally First**: Always test `npm run build` before pushing
4. **Clear Cache**: Sometimes Vercel cache causes issues - try redeploying
