# Fix Vercel 404 Error

## Problem
Your deployment shows "404_NOT_FOUND" because Vercel is looking in the wrong directory.

## Solution: Update Vercel Project Settings

### Step 1: Go to Vercel Project Settings

1. Go to: https://vercel.com
2. Click on your project: **gokartpartpicker-com**
3. Click **"Settings"** (top right)
4. Click **"General"** in the left sidebar

### Step 2: Fix Root Directory

1. Scroll down to **"Root Directory"**
2. Click **"Edit"**
3. Change from `/` (root) to `frontend`
4. Click **"Save"**

### Step 3: Verify Build Settings

While you're in Settings:

1. Go to **"Build & Development Settings"**
2. Verify:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (or `cd frontend && npm run build`)
   - **Output Directory:** `.next` (or `frontend/.next`)
   - **Install Command:** `npm ci` (or `cd frontend && npm ci`)

### Step 4: Redeploy

1. Go back to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

---

## Alternative: Update via Vercel Dashboard

If the above doesn't work:

1. Go to project → **Settings** → **General**
2. Under **"Root Directory"**, click **"Edit"**
3. Enter: `frontend`
4. Save
5. Go to **Deployments** → Click **"Redeploy"** on latest deployment

---

## Quick Fix Command (If you have Vercel CLI)

```bash
cd "/Users/dillonwallace/Desktop/Garage Built Digital LLC/Websites Testing/gokartpartpicker.com"
vercel --prod
```

But the easiest is to fix it in the dashboard!
