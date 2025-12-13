# Deployment Guide - GoKart Part Picker

This guide covers deploying the GoKart Part Picker application to various platforms.

## Pre-Deployment Checklist

1. ✅ **Test production build locally:**
   ```bash
   pnpm build
   pnpm start
   ```

2. ✅ **Set up production database:**
   - Create PostgreSQL database (Supabase, Neon, Railway, or similar)
   - Run migrations: `pnpm db:migrate`
   - Seed data: `pnpm db:seed`

3. ✅ **Environment variables needed:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., `https://gokartpartpicker.com`)

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest option for Next.js applications with built-in support.

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   Follow the prompts. For production:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings → Environment Variables
   - Add:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `NEXT_PUBLIC_BASE_URL` - Your Vercel URL (e.g., `https://your-app.vercel.app`)

5. **Configure Build Settings:**
   - Build Command: `pnpm build` (or `npm run build`)
   - Output Directory: `.next`
   - Install Command: `pnpm install` (or `npm install`)

6. **Run Database Migrations:**
   After deployment, you'll need to run migrations. You can:
   - Use Vercel's CLI: `vercel env pull` then run migrations locally pointing to production DB
   - Or use a migration service/script
   - Or run migrations via a one-time script in Vercel's deployment

#### Vercel Configuration File

Create `vercel.json` (optional, for custom settings):

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Option 2: Railway

Railway provides easy PostgreSQL + Next.js deployment.

#### Steps:

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Add PostgreSQL service:**
   - In Railway dashboard, create a PostgreSQL database
   - Railway will automatically set `DATABASE_URL`

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Set Environment Variables:**
   - `NEXT_PUBLIC_BASE_URL` - Your Railway URL

7. **Run Migrations:**
   Railway can run migrations automatically. Add to `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate",
     "build": "prisma migrate deploy && next build"
   }
   ```

### Option 3: Render

Render provides straightforward deployment with PostgreSQL.

#### Steps:

1. **Create a new Web Service** in Render dashboard
2. **Connect your repository** (GitHub/GitLab)
3. **Configure:**
   - Build Command: `pnpm install && pnpm db:generate && pnpm build`
   - Start Command: `pnpm start`
   - Environment: `Node`
   - Node Version: `18` or `20`

4. **Add PostgreSQL Database:**
   - Create a new PostgreSQL database
   - Copy the connection string to `DATABASE_URL`

5. **Set Environment Variables:**
   - `DATABASE_URL` - From PostgreSQL service
   - `NEXT_PUBLIC_BASE_URL` - Your Render URL

6. **Run Migrations:**
   Add a one-off script or use Render's shell:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

### Option 4: Self-Hosted (VPS/Docker)

For self-hosting on a VPS or with Docker.

#### Docker Setup

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN pnpm db:generate

# Build Next.js
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Update `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker
}

module.exports = nextConfig
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=gokartpartpicker
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Post-Deployment Steps

### 1. Run Database Migrations

After deployment, run migrations on your production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
pnpm db:migrate deploy

# Seed database (optional, if you want sample data)
pnpm db:seed
```

### 2. Verify Deployment

Check these endpoints:
- ✅ Homepage loads
- ✅ `/api/engines` returns data
- ✅ `/api/parts` returns data
- ✅ `/api/guides` returns data
- ✅ Build page works
- ✅ Search works

### 3. Set Up Custom Domain (Optional)

1. Add your domain in your hosting provider's dashboard
2. Update DNS records as instructed
3. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
4. Redeploy

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_BASE_URL` | Your production URL | `https://gokartpartpicker.com` |

## Troubleshooting

### Build Fails

- Check Node.js version (needs 18+)
- Ensure all dependencies are installed
- Check for TypeScript errors: `pnpm lint`

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from your hosting provider
- Ensure database exists and user has permissions
- For cloud databases, check firewall/network settings

### Migrations Not Running

- Run migrations manually after deployment
- Check Prisma client is generated: `pnpm db:generate`
- Verify database connection works

### Static Assets Not Loading

- Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
- Check build output includes static files
- Verify CDN/asset serving is configured

## Production Optimizations

1. **Enable Caching:**
   - Add caching headers in `next.config.js`
   - Use Vercel's edge caching or similar

2. **Database Connection Pooling:**
   - Use connection pooling (PgBouncer, Supabase connection pooling, etc.)

3. **Monitor Performance:**
   - Set up error tracking (Sentry, etc.)
   - Monitor database performance
   - Track API response times

4. **Security:**
   - Use HTTPS only
   - Set secure cookies if adding auth later
   - Review environment variable security

## Quick Deploy Commands

### Vercel
```bash
vercel --prod
```

### Railway
```bash
railway up
```

### Render
```bash
# Deploy via Git push (auto-deploys)
git push origin main
```

## Support

For issues:
1. Check deployment logs in your hosting provider's dashboard
2. Verify environment variables are set correctly
3. Test database connection
4. Review build logs for errors

