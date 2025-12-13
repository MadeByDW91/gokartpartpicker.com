# Quick Deployment Guide

## 🚀 Fastest Option: Vercel (Recommended)

Vercel is the easiest option for Next.js apps with zero-config deployment.

### Prerequisites
- [ ] GitHub account (recommended) or Git repository
- [ ] PostgreSQL database (Supabase, Neon, Railway, or Vercel Postgres)
- [ ] Node.js installed locally (for running migrations)

### Step 1: Set Up Database First

**Option A: Supabase (Free tier available)**
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the connection string (starts with `postgresql://`)

**Option B: Neon (Free tier available)**
1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy the connection string from dashboard

**Option C: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string from Variables tab

### Step 2: Deploy to Vercel

**Via GitHub (Recommended):**
1. Push your code to GitHub (if not already)
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

**Via CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### Step 3: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables:
- **`DATABASE_URL`** - Your PostgreSQL connection string
- **`NEXT_PUBLIC_BASE_URL`** - Your Vercel URL (e.g., `https://your-app.vercel.app`)

⚠️ **Important:** After adding variables, redeploy your project for them to take effect.

### Step 4: Run Database Migrations

After your first deployment, you need to run migrations on your production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations (this applies all pending migrations)
pnpm db:migrate:deploy

# Seed the database with sample data (optional)
pnpm db:seed
```

**Alternative:** You can also run migrations using Prisma Studio or a database client.

### Step 5: Verify Deployment

Visit your Vercel URL and check:
- ✅ Homepage loads
- ✅ `/engines` shows engine list
- ✅ `/parts` shows parts catalog
- ✅ `/api/engines` returns JSON data

🎉 **You're live!**

## 🚂 Alternative: Railway (One-Click Deploy)

Railway makes it easy with automatic database setup.

### Steps:
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Next.js
5. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable
6. **Set `NEXT_PUBLIC_BASE_URL`:**
   - Go to your service → Variables
   - Add: `NEXT_PUBLIC_BASE_URL` = `https://your-app.railway.app`
7. Railway will auto-deploy on every git push!

### Run Migrations on Railway:
```bash
# Connect to Railway CLI
railway login
railway link

# Run migrations
railway run pnpm db:migrate:deploy
railway run pnpm db:seed
```

## 🎨 Alternative: Render

### Steps:
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. **Configure:**
   - **Name:** `gokartpartpicker` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command:** `pnpm start`
   - **Node Version:** `20` (or `18`)
5. **Add PostgreSQL:**
   - Click "New +" → "PostgreSQL"
   - Copy the Internal Database URL
6. **Set Environment Variables:**
   - In your Web Service → Environment:
     - `DATABASE_URL` = (from PostgreSQL service)
     - `NEXT_PUBLIC_BASE_URL` = `https://your-app.onrender.com`
7. Click "Create Web Service"

### Run Migrations:
Use Render's Shell (in your Web Service dashboard) or via CLI:
```bash
render run pnpm db:migrate:deploy
render run pnpm db:seed
```

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to Git (GitHub/GitLab/Bitbucket)
- [ ] Production PostgreSQL database is set up
- [ ] You have the `DATABASE_URL` connection string
- [ ] Test build locally: `pnpm build` (optional but recommended)

## 🔧 Post-Deployment Steps

1. **Run migrations** on production database (see Step 4 above)
2. **Seed database** with sample data (optional): `pnpm db:seed`
3. **Test your live site:**
   - Visit homepage
   - Check `/engines`, `/parts`, `/guides`
   - Test search functionality
   - Try building a cart
4. **Set up custom domain** (optional):
   - In your hosting provider's dashboard
   - Add your domain
   - Update DNS records as instructed
   - Update `NEXT_PUBLIC_BASE_URL` to your custom domain

## 🆘 Troubleshooting

### Build Fails
- Check that Node.js version is 18+ in your hosting provider
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from hosting provider
- For cloud databases, ensure firewall allows connections
- Test connection: `pnpm db:studio` (locally with production URL)

### Migrations Not Running
- Run manually: `pnpm db:migrate:deploy`
- Check Prisma client is generated: `pnpm db:generate`
- Verify database connection works

### Pages Show Errors
- Check environment variables are set correctly
- Verify database has been migrated and seeded
- Check browser console for client-side errors
- Review hosting provider logs

## 📚 More Information

For detailed deployment instructions, Docker setup, and advanced configurations, see `DEPLOYMENT.md`

## 🎯 Quick Commands Reference

```bash
# Test build locally
pnpm build

# Run production migrations
pnpm db:migrate:deploy

# Seed database
pnpm db:seed

# Generate Prisma client
pnpm db:generate

# Open Prisma Studio (to view data)
pnpm db:studio
```

