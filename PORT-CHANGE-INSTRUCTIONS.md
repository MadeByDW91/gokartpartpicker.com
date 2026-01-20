# Port Change: 3000 → 3001

## What Changed

The development server port has been changed from **3000** to **3001** to help troubleshoot loading issues.

## Files Updated

1. **`frontend/package.json`**
   - Dev script now uses: `next dev -p 3001`

2. **`supabase/config.toml`**
   - `site_url` changed to `http://localhost:3001`
   - `additional_redirect_urls` updated to `http://localhost:3001/**`

3. **`frontend/src/actions/admin/amazon-import.ts`**
   - Default port changed from 3000 to 3001

4. **`frontend/src/actions/auth.ts`**
   - Email redirect URL default port changed from 3000 to 3001

## How to Use

### 1. Stop Current Server
```bash
# Press Ctrl+C in the terminal running the dev server
```

### 2. Kill Any Processes on Port 3000 (Optional)
```bash
# If port 3000 is still in use
lsof -ti:3000 | xargs kill -9
```

### 3. Start Dev Server on New Port
```bash
cd frontend
npm run dev
```

The server will now start on **http://localhost:3001**

### 4. Access the Site
Open your browser to:
- **http://localhost:3001** (new port)

## Why This Helps

1. **Port Conflicts**: If something else was using port 3000, this eliminates the conflict
2. **Fresh Start**: New port means fresh connection, no cached issues
3. **Easier Debugging**: Can run both ports simultaneously to compare

## If Port 3001 Doesn't Work

You can change to any other port:

```bash
# Option 1: Use environment variable
PORT=3002 npm run dev

# Option 2: Edit package.json
# Change "next dev -p 3001" to "next dev -p 3002"
```

## Reverting Back to 3000

If you want to go back to port 3000:

1. Edit `frontend/package.json`:
   ```json
   "dev": "next dev"
   ```

2. Edit `supabase/config.toml`:
   ```toml
   site_url = "http://localhost:3000"
   additional_redirect_urls = ["http://localhost:3000/**"]
   ```

3. Update code references back to 3000

## Testing

After starting the server on port 3001:

1. ✅ Check http://localhost:3001 loads
2. ✅ Verify no console errors
3. ✅ Test authentication (login/register)
4. ✅ Check if loading issue is resolved

---

*Port change completed: 2026-01-17*
