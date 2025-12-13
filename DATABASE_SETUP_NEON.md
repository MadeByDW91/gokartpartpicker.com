# Setting Up Neon Database for GoKart Part Picker

## Step-by-Step Guide

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up" (you can use GitHub, Google, or email)
3. Complete the signup process

### Step 2: Create a Project
1. After logging in, click "Create a project"
2. **Project Name:** `gokartpartpicker` (or any name you prefer)
3. **Region:** Choose closest to you (e.g., `US East (Ohio)` for best Vercel compatibility)
4. **PostgreSQL Version:** Use the default (latest, usually 15 or 16)
5. Click "Create project"

### Step 3: Get Connection String
1. Once your project is created, you'll see the dashboard
2. Look for the **Connection string** section
3. You'll see something like:
   ```
   postgres://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Copy this connection string** - you'll need it for Vercel

### Step 4: Add to Vercel Environment Variables
1. Go to: https://vercel.com/dillons-projects-48dc60f7/gokartpartpicker.com/settings/environment-variables
2. Click "Add New"
3. Add these variables:

   **Variable 1:**
   - **Key:** `DATABASE_URL`
   - **Value:** (paste your Neon connection string)
   - **Environment:** Select all (Production, Preview, Development)
   - Click "Save"

   **Variable 2:**
   - **Key:** `NEXT_PUBLIC_BASE_URL`
   - **Value:** `https://gokartpartpicker-qm9frixfj-dillons-projects-48dc60f7.vercel.app`
   - **Environment:** Select all
   - Click "Save"

4. After adding variables, **Vercel will automatically redeploy** (or you can manually trigger a redeploy)

### Step 5: Run Migrations

After Vercel redeploys, run migrations on your Neon database:

```bash
# Set your Neon DATABASE_URL
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npm run db:migrate:deploy

# Seed the database
npm run db:seed
```

### Step 6: Verify

1. Visit your live site: https://gokartpartpicker-qm9frixfj-dillons-projects-48dc60f7.vercel.app
2. Check that pages load:
   - Homepage
   - `/engines` - should show engine list
   - `/parts` - should show parts catalog
   - `/guides` - should show guides

## Neon Free Tier Limits

- **Storage:** 0.5 GB (plenty for MVP)
- **Projects:** 1 project
- **Compute:** 0.5 vCPU, 1 GB RAM
- **Perfect for:** Development and small production apps

## Troubleshooting

### Connection Issues
- Make sure you copied the full connection string
- Verify the connection string includes `?sslmode=require`
- Check that your Neon project is active

### Migration Errors
- Ensure `DATABASE_URL` is set correctly in Vercel
- Make sure you're using the production connection string
- Check Neon dashboard for any project issues

## Next Steps After Setup

Once database is set up:
1. ✅ Your app will be fully functional
2. ✅ All data will persist
3. ✅ You can start using the app
4. ✅ Consider setting up a custom domain


