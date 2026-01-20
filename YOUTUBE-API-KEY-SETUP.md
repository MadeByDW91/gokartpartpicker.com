# YouTube API Key Setup for Vercel

## Overview
The auto-add videos feature requires a YouTube Data API v3 key to search YouTube and automatically add relevant videos when you create parts. This guide will walk you through getting the API key and adding it to Vercel.

---

## Step 1: Get YouTube API Key from Google Cloud

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### 1.2 Create or Select a Project
1. Click the project dropdown at the top (next to "Google Cloud")
2. Either:
   - **Select an existing project** (if you have one)
   - **Click "New Project"** to create one
     - Project name: `GoKartPartPicker` (or any name you prefer)
     - Click "Create"

### 1.3 Enable YouTube Data API v3
1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"** (or search for "API Library" in the search bar)
2. Search for: **"YouTube Data API v3"**
3. Click on **"YouTube Data API v3"**
4. Click the **"Enable"** button
5. Wait for it to enable (usually takes a few seconds)

### 1.4 Create API Credentials
1. Go to **"APIs & Services"** → **"Credentials"** (in the left sidebar)
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. Your API key will be generated and displayed
5. **IMPORTANT:** Copy this key immediately - you won't be able to see it again!
   - It will look like: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

### 1.5 (Optional) Restrict the API Key
For security, you can restrict the key:
1. Click on the API key you just created (or click "Edit" next to it)
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check only **"YouTube Data API v3"**
3. Under **"Application restrictions"** (optional but recommended):
   - Select **"HTTP referrers (web sites)"**
   - Add your Vercel domain: `https://gokartpartpicker.com/*`
   - Add your preview domains: `https://*.vercel.app/*`
4. Click **"Save"**

---

## Step 2: Add API Key to Vercel

### 2.1 Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Sign in to your account
3. Find and click on your **"gokartpartpicker.com"** project

### 2.2 Navigate to Environment Variables
1. Click on **"Settings"** (in the top navigation)
2. Click on **"Environment Variables"** (in the left sidebar)

### 2.3 Add the YouTube API Key
1. In the **"Key"** field, enter: `YOUTUBE_API_KEY`
2. In the **"Value"** field, paste your YouTube API key (the one you copied from Google Cloud)
3. **IMPORTANT:** Select all three environments:
   - ✅ **Production** (for live site)
   - ✅ **Preview** (for preview deployments)
   - ✅ **Development** (for local development)
4. Click **"Save"**

### 2.4 Redeploy Your Application
After adding the environment variable, you need to redeploy:
1. Go to the **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Or simply push a new commit to trigger a new deployment

**Note:** Environment variables are only available to new deployments. Existing deployments won't have access to newly added variables until you redeploy.

---

## Step 3: Verify It's Working

### 3.1 Test in Production
1. Go to your live site: https://gokartpartpicker.com
2. Log in as admin
3. Go to **Admin** → **Parts** → **Add New Part**
4. Fill in part details
5. Check the box: **"Auto-add videos (searches YouTube for relevant videos)"**
6. Click **"Create Part"**
7. You should see a message like: **"Added X video(s) automatically!"**

### 3.2 Check for Errors
If it doesn't work:
1. Check the browser console (F12 → Console tab) for errors
2. Check Vercel deployment logs:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check the "Build Logs" and "Function Logs" for errors

---

## YouTube API Quota & Limits

### Default Quota
- **Free tier:** 10,000 units per day
- **One search request:** 100 units
- **Approximate limit:** ~100 video searches per day

### What This Means
- The system limits to **3 search queries per part** to conserve quota
- You can add up to **5 videos per part** automatically
- This should be enough for **~30-35 parts per day** with auto-video feature

### If You Hit the Quota
- You'll see an error: "YouTube API quota exceeded"
- Wait 24 hours for the quota to reset
- Or request a quota increase in Google Cloud Console:
  - Go to **"APIs & Services"** → **"Quotas"**
  - Find **"YouTube Data API v3"**
  - Click **"Edit Quotas"**
  - Request an increase (may require billing account)

---

## Troubleshooting

### "YouTube API key not configured"
- ✅ Make sure you added `YOUTUBE_API_KEY` to Vercel
- ✅ Make sure you selected all three environments (Production, Preview, Development)
- ✅ Make sure you redeployed after adding the variable

### "YouTube API quota exceeded"
- You've used your daily quota (10,000 units)
- Wait 24 hours or request a quota increase
- The system will skip video addition but still create the part

### "Invalid API key"
- Double-check you copied the entire key correctly
- Make sure the YouTube Data API v3 is enabled in Google Cloud
- Check that the API key restrictions allow your domain

### Videos Not Being Added
- Check browser console for errors
- Check Vercel function logs
- Verify the API key is correct
- Make sure the part name/brand is specific enough for YouTube to find videos

---

## Security Best Practices

1. **Never commit the API key to GitHub**
   - It's already in `.gitignore`, but double-check
   - Only add it to Vercel environment variables

2. **Restrict the API key** (as mentioned in Step 1.5)
   - Limit to YouTube Data API v3 only
   - Restrict to your Vercel domains

3. **Monitor usage**
   - Check Google Cloud Console → APIs & Services → Dashboard
   - Monitor quota usage to avoid unexpected limits

---

## Summary Checklist

- [ ] Created Google Cloud project
- [ ] Enabled YouTube Data API v3
- [ ] Created API key
- [ ] (Optional) Restricted API key for security
- [ ] Added `YOUTUBE_API_KEY` to Vercel environment variables
- [ ] Selected all three environments (Production, Preview, Development)
- [ ] Redeployed application
- [ ] Tested auto-add videos feature

---

## Need Help?

If you run into issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify API key in Google Cloud Console
4. Make sure YouTube Data API v3 is enabled

The feature should work automatically once the API key is added and the site is redeployed!
