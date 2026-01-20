# How to Find Your Supabase Keys

This guide shows you exactly where to find your Supabase project URL and API keys.

## 📍 Step-by-Step Instructions

### Step 1: Log into Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in with your Supabase account

### Step 2: Select Your Project

1. You'll see a list of your projects
2. Click on the project you want to use for production (gokartpartpicker.com)
   - If you don't have a project yet, click "New Project" to create one

### Step 3: Navigate to API Settings

1. In your project dashboard, look at the left sidebar
2. Click on **Settings** (gear icon at the bottom)
3. Click on **API** in the settings menu

### Step 4: Find Your Keys

You'll see a page with several sections. Here's what you need:

#### 🔑 Project URL
- **Location:** Under "Project URL" section
- **Format:** `https://xxxxxxxxxxxxx.supabase.co`
- **Copy this value** → This is your `NEXT_PUBLIC_SUPABASE_URL`

#### 🔑 API Keys
- **Location:** Under "Project API keys" section
- You'll see several keys:
  - **`anon` `public`** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **`service_role` `secret`** key → This is your `SUPABASE_SERVICE_ROLE_KEY` (for server-side only, keep secret!)

**Important:** 
- Use the **`anon` `public`** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- The `anon` key is safe to expose in client-side code
- The `service_role` key should NEVER be exposed in client-side code

## 📋 Visual Guide

```
Supabase Dashboard
├── Your Project
│   ├── Table Editor
│   ├── SQL Editor
│   ├── Authentication
│   ├── Storage
│   └── Settings ⚙️
│       ├── General
│       ├── API ← CLICK HERE
│       │   ├── Project URL: https://xxxxx.supabase.co
│       │   └── Project API keys:
│       │       ├── anon public: eyJhbGc... (use this)
│       │       └── service_role secret: eyJhbGc... (keep secret!)
│       ├── Database
│       └── ...
```

## 🔐 What You Need for Vercel

Copy these two values to Vercel environment variables:

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Value: Your Project URL (e.g., `https://abcdefghijklmnop.supabase.co`)

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Value: Your `anon` `public` key (starts with `eyJhbGc...`)

## 📝 Quick Copy Checklist

- [ ] Open Supabase Dashboard
- [ ] Select your project
- [ ] Go to Settings → API
- [ ] Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add both to Vercel Environment Variables
- [ ] Redeploy your Vercel project

## 🚨 Important Notes

1. **Project Selection:** Make sure you're using the correct Supabase project:
   - If you have a local/dev project and a production project, use the **production** one
   - The URL will be different for each project

2. **Key Security:**
   - The `anon` key is safe for client-side use (that's why it's called "public")
   - The `service_role` key should only be used in server-side code and never exposed to the browser

3. **Multiple Projects:**
   - If you have multiple Supabase projects, make sure you're copying keys from the correct one
   - Each project has its own unique URL and keys

## 🔍 Alternative: Check Your Local .env File

If you have a local `.env.local` file, you can check what values you're using locally:

```bash
# In your project root or frontend directory
cat .env.local | grep SUPABASE
```

This will show you the format, but you still need to get the actual production values from Supabase Dashboard.

## ❓ Still Can't Find It?

If you can't find the API settings:

1. Make sure you're logged into the correct Supabase account
2. Make sure you've selected the correct project
3. Check that you have access/permissions to view API settings
4. Try refreshing the page

---

**Next Step:** After you have the keys, add them to Vercel (see `PRODUCTION-DATABASE-FIX.md` for instructions).
