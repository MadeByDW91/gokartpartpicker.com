# 🔑 Vercel Environment Variables - Exact Setup

## ⚠️ Important: Where to Add These

**These go in VERCEL, not Supabase!**

1. Go to: https://vercel.com/dashboard
2. Click your project: **gokartpartpicker-com**
3. Click **"Settings"** → **"Environment Variables"**
4. Add each variable below

---

## ✅ Required Environment Variables for Vercel

Add these **4 variables** in Vercel (select **ALL environments**: Production, Preview, Development):

### 1. NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ybtcciyyinxywitfmlhv.supabase.co:6543
```
**⚠️ Important:** Use port `:6543` for connection pooling (production requirement)

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzc5OTcsImV4cCI6MjA4NDE1Mzk5N30.wnypXNLSnPLMhdjlgf3t4RE_1AVT9Opc1V7UHj6Ojo4
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU3Nzk5NywiZXhwIjoyMDg0MTUzOTk3fQ.QGIWE_xBaYeZ-CDROa_bVEK2BgfYIt57p5vrN-kw3zM
```
**⚠️ Important:** This should **NOT** have `NEXT_PUBLIC_` prefix (server-side only)

### 4. NEXT_PUBLIC_APP_URL
```
Name: NEXT_PUBLIC_APP_URL
Value: https://gokartpartpicker.com
```
(Or use your Vercel URL: `https://gokartpartpicker-com.vercel.app`)

---

## 📋 Step-by-Step in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click project: **gokartpartpicker-com**

2. **Navigate to Environment Variables**
   - Click **"Settings"** (top navigation)
   - Click **"Environment Variables"** (left sidebar)

3. **Add Each Variable**
   - Click **"Add"** button
   - Enter **Name** (exactly as shown above)
   - Enter **Value** (exactly as shown above)
   - Select **ALL environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**
   - Repeat for all 4 variables

4. **After Adding All Variables**
   - Go to **"Deployments"** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"** (to pick up new variables)

---

## 🔍 Where to Find These Values

### From Supabase Dashboard:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**

**You'll see:**
- **Project URL:** Use this with `:6543` port → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key:** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key:** → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Important:** 
- For `NEXT_PUBLIC_SUPABASE_URL`, add `:6543` to the end for connection pooling
- Example: `https://ybtcciyyinxywitfmlhv.supabase.co:6543`

---

## ✅ Verification Checklist

After adding all variables:

- [ ] All 4 variables added in Vercel
- [ ] All variables selected for ALL environments
- [ ] `NEXT_PUBLIC_SUPABASE_URL` has `:6543` port
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does NOT have `NEXT_PUBLIC_` prefix
- [ ] Redeployed after adding variables

---

## 🐛 Common Mistakes

1. **Wrong URL format:**
   - ❌ `https://ybtcciyyinxywitfmlhv.supabase.co` (missing port)
   - ✅ `https://ybtcciyyinxywitfmlhv.supabase.co:6543` (with port)

2. **Wrong prefix:**
   - ❌ `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (shouldn't have NEXT_PUBLIC_)
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` (correct)

3. **Wrong location:**
   - ❌ Adding to Supabase (wrong place)
   - ✅ Adding to Vercel (correct place)

---

**Add these to VERCEL, not Supabase!** The screenshot you showed is Supabase's internal variables - you need to add your own in Vercel. 🔑
