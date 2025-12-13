# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/gokartpartpicker?schema=public"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Seed the database
   pnpm db:seed
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
   ```sql
   CREATE DATABASE gokartpartpicker;
   ```
3. Update `DATABASE_URL` in `.env` with your credentials

### Option 2: Cloud Database (e.g., Supabase, Neon, Railway)

1. Create a PostgreSQL database on your preferred provider
2. Copy the connection string
3. Update `DATABASE_URL` in `.env`

## Verification

After setup, verify everything works:

1. **Check database connection:**
   ```bash
   pnpm db:studio
   ```
   This opens Prisma Studio where you can browse your data.

2. **Test the API:**
   - Visit `http://localhost:3000/api/engines` - should return JSON array
   - Visit `http://localhost:3000/api/parts` - should return JSON array
   - Visit `http://localhost:3000/api/guides` - should return JSON array

3. **Test the pages:**
   - Homepage: `http://localhost:3000`
   - Engines: `http://localhost:3000/engines`
   - Parts: `http://localhost:3000/parts`
   - Guides: `http://localhost:3000/guides`
   - Build: `http://localhost:3000/build` (will show "No Engine Selected" until you add one)

## Troubleshooting

### Prisma Migration Issues

If migrations fail:
```bash
# Reset the database (WARNING: deletes all data)
pnpm prisma migrate reset

# Then run migrations again
pnpm db:migrate
pnpm db:seed
```

### Port Already in Use

If port 3000 is already in use:
```bash
# Use a different port
pnpm dev -- -p 3001
```

### Database Connection Errors

- Verify PostgreSQL is running
- Check `DATABASE_URL` format is correct
- Ensure database exists
- Check user permissions

## Next Steps

Once setup is complete:

1. Browse engines and select one for your build
2. Add parts to your build from the parts catalog
3. View your build calculations and warnings
4. Check out the installation guides
5. Use search to find specific parts or guides

See `docs/plan.md` for the full implementation plan and `docs/assumptions.md` for implementation decisions.

