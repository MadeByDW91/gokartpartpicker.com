# Environment Variables Setup

**⚠️ IMPORTANT: Do NOT commit `.env.local` or this file with real values to git!**

---

## Environment Variables for Vercel

Copy these to **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ybtcciyyinxywitfmlhv.supabase.co:6543
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzc5OTcsImV4cCI6MjA4NDE1Mzk5N30.wnypXNLSnPLMhdjlgf3t4RE_1AVT9Opc1V7UHj6Ojo4
SUPABASE_SERVICE_ROLE_KEY=<ROTATE_AND_SET_IN_SUPABASE_AND_VERCEL>
NEXT_PUBLIC_APP_URL=https://gokartpartpicker.com
```

### Important Notes

1. **Use port `:6543`** for connection pooling (required for production)
   - URL: `https://ybtcciyyinxywitfmlhv.supabase.co:6543`

2. **SUPABASE_SERVICE_ROLE_KEY** should **NOT** have `NEXT_PUBLIC_` prefix
   - This is a server-side only secret
   - Never expose to client-side code

3. **For Local Development** (`.env.local` - DO NOT COMMIT):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://ybtcciyyinxywitfmlhv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGNjaXl5aW54eXdpdGZtbGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzc5OTcsImV4cCI6MjA4NDE1Mzk5N30.wnypXNLSnPLMhdjlgf3t4RE_1AVT9Opc1V7UHj6Ojo4
   SUPABASE_SERVICE_ROLE_KEY=<ROTATE_AND_SET_IN_SUPABASE_AND_VERCEL>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## Where to Set These in Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Click **"Add New"**
   - Enter variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter variable value
   - Select environments: **Production**, **Preview**, **Development** (all three)
   - Click **Save**

4. **After adding all variables:**
   - Go to **Deployments** tab
   - Click the **"..."** menu on latest deployment
   - Select **"Redeploy"** (or push new commit to trigger redeploy)

---

## Still Need These?

### Optional (But Recommended)

- [ ] **NEXT_PUBLIC_GA_ID** - Google Analytics tracking ID (if using analytics)
- [ ] **NEXT_PUBLIC_PLAUSIBLE_DOMAIN** - Plausible Analytics domain (if using)

### Confirmation Needed

- [ ] **Domain name**: `gokartpartpicker.com` (you mentioned this, just confirm it's correct)
- [ ] **Supabase project region**: Which region is your Supabase project in? (doesn't affect env vars, just for reference)

---

## Verification Checklist

After setting environment variables in Vercel:

- [ ] All 4 required variables added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` uses port `:6543` (pooled connection)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does **NOT** have `NEXT_PUBLIC_` prefix
- [ ] Redeployed Vercel project to pick up new variables
- [ ] Test production site - homepage should load
- [ ] Check browser console - no Supabase connection errors
