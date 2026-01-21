# How to Set Root Directory in Vercel

## Option 1: Find Root Directory Setting

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `gokartpartpicker.com`

2. **Open Settings**
   - Click on **"Settings"** tab (top navigation)

3. **Look for Root Directory in these sections:**
   - **General** → Scroll down to find "Root Directory"
   - **OR Build & Deployment Settings** → Look for "Root Directory" or "Root Directory Path"
   - **OR Project Settings** → General section

4. **Set the Root Directory**
   - Enter: `frontend` (without trailing slash)
   - Click **"Save"**

## Option 2: Current vercel.json Should Work

Since we've already updated `vercel.json` to use:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm ci"
}
```

The build commands already change into the `frontend` directory, so the Root Directory setting might not be strictly necessary. However, setting it in the dashboard is still recommended for clarity.

## If You Can't Find It

If Root Directory is not visible in Settings:
1. Make sure you're the project owner/admin
2. Try refreshing the page
3. Check if you're on the correct Vercel plan (some settings vary by plan)
4. The current `vercel.json` configuration should work without it

## Alternative: Use Vercel CLI

If you have Vercel CLI installed:
```bash
vercel --cwd frontend
```

This tells Vercel to use `frontend` as the root directory.

---

**Current Status:** The `vercel.json` file is configured correctly and should work even without setting Root Directory in the dashboard, but setting it there is the recommended approach.
