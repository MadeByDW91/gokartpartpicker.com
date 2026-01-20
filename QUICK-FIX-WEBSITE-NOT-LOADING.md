# Quick Fix: Website Not Loading

## Immediate Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab and look for:
- Red error messages
- Stack traces
- Any messages about Supabase, React, or Next.js

### 2. Clear Cache and Restart
```bash
# Stop dev server (Ctrl+C)
cd frontend
rm -rf .next
npm run dev
```

### 3. Check Environment Variables
```bash
cd frontend
cat .env.local
```

Should have:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Check Network Tab
Open DevTools → Network tab:
- Look for failed requests (red)
- Check if requests are stuck in "pending"
- Verify Supabase requests are working

## Common Causes

### Issue: Blank White Screen
**Cause**: JavaScript error preventing React from rendering
**Fix**: 
1. Check browser console for errors
2. Look for syntax errors in recent changes
3. Try reverting recent commits

### Issue: Infinite Loading
**Cause**: Hook stuck in loading state
**Fix**: 
1. Check if Supabase client is null
2. Verify environment variables
3. Check React Query DevTools

### Issue: "Cannot read property of null"
**Cause**: Code trying to access properties on null objects
**Fix**: 
1. Check browser console for specific error
2. Look for null checks missing in hooks
3. Verify Supabase client initialization

### Issue: Build Errors
**Cause**: TypeScript or compilation errors
**Fix**:
```bash
cd frontend
npm run build
# Fix any errors shown
```

## Debugging Checklist

- [ ] Browser console shows no errors
- [ ] Network tab shows successful requests
- [ ] Environment variables are set
- [ ] `.next` folder is cleared
- [ ] Dev server restarted
- [ ] No syntax errors in code
- [ ] Supabase project is active
- [ ] No blocking overlays or z-index issues

## If Still Not Working

1. **Check the exact error message** in browser console
2. **Check if it's a specific page** or all pages
3. **Try accessing** `http://localhost:3000` directly
4. **Check terminal** where dev server is running for errors
5. **Try a different browser** to rule out browser-specific issues

## Emergency Rollback

If nothing works, revert to last working commit:
```bash
git log --oneline -10  # Find last working commit
git checkout <commit-hash>
cd frontend
npm run dev
```
