# Diagnose Loading Issues

## Issues Fixed

### 1. Supabase Client Null Handling
**Problem**: When Supabase credentials are missing or invalid, the client returns `null`, but hooks were trying to use it, causing errors and infinite loading states.

**Fixed**:
- `useAuth` now checks for null Supabase client before using it
- `useAdmin` now checks for null Supabase client before using it
- Both hooks stop loading immediately if Supabase is not available

### 2. React Query Infinite Retries
**Problem**: React Query was retrying failed queries indefinitely, keeping components in loading state.

**Fixed**:
- Added better retry logic that doesn't retry on configuration errors
- Added `throwOnError: false` to prevent errors from blocking the UI
- Improved error detection for "not configured" and "not available" errors

### 3. Auth State Change Subscriptions
**Problem**: Auth subscriptions could fail if Supabase client was null, causing memory leaks.

**Fixed**:
- Added null checks before subscribing to auth state changes
- Proper cleanup of subscriptions even if they fail to initialize

## How to Test

### 1. Check Browser Console
Open DevTools (F12) and check for:
- ✅ No "Supabase client is not available" warnings (means env vars are set)
- ✅ No infinite retry loops
- ✅ Errors should show helpful messages, not crash the app

### 2. Test Page Loading
1. **Homepage** (`/`) - Should load immediately, no infinite spinner
2. **Engines** (`/engines`) - Should show engines or empty state
3. **Parts** (`/parts`) - Should show parts or empty state
4. **Builder** (`/builder`) - Should be interactive
5. **Forums** (`/forums`) - Should load categories

### 3. Test Interaction
- Click navigation links - should work immediately
- Click buttons - should respond
- Forms should be interactive
- No elements should be "stuck" or unclickable

### 4. Check Network Tab
- Look for failed Supabase requests
- Check if requests are stuck in "pending" state
- Verify API responses are returning

## Common Issues & Solutions

### Issue: Everything is unclickable
**Cause**: Loading overlay or z-index issue blocking interaction
**Solution**: 
- Check for fixed overlays with high z-index
- Look for `pointer-events-none` on parent elements
- Check if mobile menu is stuck open

### Issue: Pages stuck in loading
**Cause**: React Query hook stuck in loading state
**Solution**:
- Check browser console for errors
- Verify environment variables are set
- Check network tab for failed requests
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Databases aren't loading
**Cause**: Supabase connection issue
**Solution**:
1. Check `.env.local` has correct Supabase URL and key
2. Verify Supabase project is active
3. Check network tab for CORS or connection errors
4. Verify RLS policies allow access

### Issue: Forums broken
**Cause**: Database function or RLS policy issue
**Solution**:
1. Check if `get_forum_categories_with_counts()` function exists
2. Verify RLS policies on forum tables
3. Check browser console for specific error messages

## Quick Fixes

### If site is completely broken:
```bash
# 1. Stop dev server (Ctrl+C)
# 2. Clear Next.js cache
cd frontend
rm -rf .next
# 3. Restart dev server
npm run dev
```

### If environment variables are missing:
```bash
# Check if .env.local exists
cd frontend
ls -la .env.local

# If missing, create it with:
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### If Supabase connection fails:
1. Go to Supabase Dashboard
2. Check project status
3. Verify API keys are correct
4. Check if project is paused (free tier)

## Debugging Steps

1. **Open Browser Console** - Look for errors
2. **Check Network Tab** - Look for failed requests
3. **Check React DevTools** - Look for component state
4. **Check React Query DevTools** - Look for query states
5. **Verify Environment Variables** - Make sure they're loaded

## Expected Behavior After Fixes

✅ Pages load within 1-2 seconds
✅ No infinite loading spinners
✅ All buttons and links are clickable
✅ Error messages are helpful (not crashes)
✅ Site works even if some data fails to load
✅ Mobile menu opens and closes properly
✅ Forms are interactive
✅ Navigation works smoothly

## Still Having Issues?

1. Check the browser console for specific error messages
2. Look at the Network tab to see which requests are failing
3. Verify your Supabase project is active and accessible
4. Try accessing Supabase directly in the browser
5. Check if other users are experiencing the same issue
