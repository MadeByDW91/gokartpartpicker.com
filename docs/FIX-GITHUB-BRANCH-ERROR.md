# Fix: "Branch 'main' not found" Error in Supabase

## Problem

Supabase GitHub integration shows error:
```
Branch "main" not found in MadeByDW1/gokartpartpicker.com
```

## Solutions

### Solution 1: Check Your Actual Branch Name

Your repository might use `master` instead of `main`. Here's how to check:

1. **On GitHub:**
   - Go to `https://github.com/MadeByDW1/gokartpartpicker.com` (or your actual username)
   - Look at the branch dropdown (top left, shows current branch)
   - Common branch names: `main`, `master`, `develop`

2. **In Supabase Settings:**
   - Go to Supabase Dashboard → Settings → Integrations → GitHub
   - Change "Production branch name" from `main` to `master` (or whatever your default branch is)
   - Save settings

### Solution 2: Verify Repository Name

The repository name might be slightly different:

1. **Check exact repository name:**
   - Go to your GitHub repository
   - Look at the URL: `https://github.com/USERNAME/REPO-NAME`
   - Verify it matches exactly what's in Supabase settings

2. **Common issues:**
   - Username mismatch: `MadeByDW1` vs `MadeByDW91`
   - Repository name: `gokartpartpicker.com` vs `gokartpartpicker` (no .com)
   - Case sensitivity: `GoKartPartPicker` vs `gokartpartpicker`

3. **Fix in Supabase:**
   - Disconnect GitHub integration
   - Reconnect and select the correct repository
   - Make sure the repository name matches exactly

### Solution 3: Create the Branch on GitHub

If your repository doesn't have a `main` branch yet:

1. **On GitHub:**
   - Go to your repository
   - Click "Branch: master" (or current branch)
   - Type `main` and press Enter to create it
   - Or rename `master` to `main`:
     - Settings → Branches → Default branch → Rename to `main`

2. **Or initialize locally and push:**
   ```bash
   git init
   git checkout -b main
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/MadeByDW1/gokartpartpicker.com.git
   git push -u origin main
   ```

### Solution 4: Use Your Default Branch

Instead of `main`, use whatever your default branch is:

1. **Find your default branch:**
   - Go to GitHub repository
   - Look at the branch dropdown (shows default branch)
   - Common: `master`, `main`, `develop`

2. **Update Supabase:**
   - Change "Production branch name" to match your default branch
   - Save settings

## Quick Fix Steps

1. ✅ Go to your GitHub repository
2. ✅ Check what your default branch is called (`main`, `master`, etc.)
3. ✅ Go to Supabase Dashboard → Settings → Integrations → GitHub
4. ✅ Change "Production branch name" to match your actual branch name
5. ✅ Save settings
6. ✅ Error should disappear

## Verify It's Fixed

After updating the branch name:

1. The error message should disappear
2. You should see a green checkmark or success message
3. Try creating a test PR to verify preview database creation works

## Still Having Issues?

If the error persists:

1. **Disconnect and reconnect:**
   - Disconnect GitHub integration in Supabase
   - Reconnect and carefully select the correct repository
   - Make sure repository name matches exactly

2. **Check repository permissions:**
   - Ensure Supabase has access to your repository
   - Check GitHub → Settings → Applications → Authorized OAuth Apps
   - Verify Supabase is authorized

3. **Verify repository exists:**
   - Make sure the repository exists on GitHub
   - Check you have access to it
   - Verify the repository name is correct

---

**Most Common Fix:** Change branch name from `main` to `master` (or vice versa) to match your actual GitHub default branch.
