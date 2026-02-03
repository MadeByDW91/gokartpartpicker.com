# Apply the supplier links fix (no CLI)

Use this when you get **"Failed to create supplier links"** or **"relation part_supplier_links does not exist"**, and you don't want to use the Supabase CLI.

This script creates the `part_supplier_links` table if it doesn't exist, then sets up RLS so admins can create and edit supplier links.

## Steps

1. **Open Supabase**  
   Go to [supabase.com/dashboard](https://supabase.com/dashboard) and open your project.

2. **Open SQL Editor**  
   In the left sidebar, click **SQL Editor**.

3. **New query**  
   Click **New query** (or the + tab).

4. **Paste the fix**  
   Open this file in your project:
   - `supabase/QUICK-FIX-SUPPLIER-LINKS-RLS.sql`  
   Select all (Cmd+A / Ctrl+A), copy, then paste into the SQL Editor.

5. **Run it**  
   Click **Run** (or press Cmd+Enter / Ctrl+Enter).

6. **Check the result**  
   At the bottom you should see something like “Success. No rows returned.” That’s normal.

7. **Try the app again**  
   In your app, add or edit a part and save supplier links. It should work.

---

**Note:** Safe to run more than once. If you already applied it, running again just updates the function and policies.
