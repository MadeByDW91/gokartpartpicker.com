# Enable Leaked Password Protection

## Overview

Supabase Auth can check passwords against the HaveIBeenPwned database to prevent users from using compromised passwords. This is currently disabled and should be enabled for better security.

## Steps to Enable

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard/project/ybtcciyyinxywitfmlhv

2. **Open Authentication Settings**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Policies"** or **"Settings"** tab

3. **Enable Leaked Password Protection**
   - Look for **"Leaked Password Protection"** or **"Password Security"** section
   - Toggle **"Enable leaked password protection"** to **ON**
   - This will check passwords against HaveIBeenPwned.org database

4. **Save Changes**
   - Click **"Save"** or the changes will auto-save

## What This Does

- When users sign up or change passwords, Supabase will check if the password has been found in data breaches
- If a password is found in the HaveIBeenPwned database, the user will be prompted to choose a different password
- This prevents users from using commonly compromised passwords

## Security Benefits

- **Prevents Weak Passwords**: Blocks passwords that have been exposed in data breaches
- **Industry Standard**: Uses the same database that many major services use (HaveIBeenPwned)
- **Zero Cost**: The HaveIBeenPwned API is free to use
- **Privacy**: Only password hashes (first 5 characters) are sent, not full passwords

## Note

This is a **dashboard setting** and cannot be configured via SQL migrations. It must be enabled manually in the Supabase Dashboard.

---

**Status**: ⚠️ Currently Disabled - Should be enabled for production
