# Supabase Security Improvements

> **Purpose:** Actionable improvements to harden Supabase Auth, Database, Storage, and project configuration.  
> **Complements:** [SECURITY-AUDIT-REPORT.md](./SECURITY-AUDIT-REPORT.md)

---

## 1. Auth configuration (`config.toml` and Dashboard)

### 1.1 Session and JWT

**Current:** `jwt_expiry = 3600` (1 hour) — good. A few additions:

**`supabase/config.toml` — recommended:**
```toml
[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/**"]
jwt_expiry = 3600
enable_signup = true
enable_anonymous_sign_ins = false
# Add:
refresh_token_rotation_enabled = true   # Rotate refresh tokens on use
refresh_token_reuse_interval = 10       # Seconds before a reused refresh token is accepted (reuse = possible theft)

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
# Optional: stricter password (Supabase Dashboard has more options)
# minimum_password_length = 12
```

**Production (Supabase Dashboard → Authentication → Settings):**
- Set **Site URL** and **Redirect URLs** to your production domain only.
- **JWT expiry:** keep 3600 or lower for sensitive actions.
- **Refresh token rotation:** ON.
- **Inactivity timeout:** e.g. 7 days so idle sessions expire.

---

### 1.2 Password and account protection

**In Dashboard → Authentication → Settings:**
- **Password:** Minimum length 10–12; consider “require character mix” if available.
- **Email confirmations:** already ON — keep it.
- **Double confirm for email change:** already ON — good.
- **Bot protection:** Enable CAPTCHA / Turnstile for signup and “forgot password” if you’re on a plan that supports it.

**Rate limits (Supabase applies these; you can tighten via Dashboard or Management API):**
- Signup / password reset: 60s per user.
- Token refresh: ~1,800/hour per IP.
- MFA: 15/hour per IP.

No code changes needed; be aware of them when designing flows.

---

### 1.3 Multi‑factor authentication (MFA)

**Dashboard → Authentication → Providers → MFA:**
- Enable **TOTP** (authenticator app).
- Optionally **phone** (SMS/OTP) if your plan supports it.

**Policy:**
- **Admins:** Require MFA for `admin` and `super_admin` (enforce in app: block access until MFA is done, or use `aal` in RLS — see 3.2).
- **All users:** Optional for now; you can make it mandatory later.

**Using `aal` in RLS for sensitive data (e.g. role changes, billing):**
```sql
-- Example: only allow role changes when AAL is at least 2 (MFA done)
USING (
  (auth.jwt() ->> 'aal') = 'aal2'
  AND is_super_admin()
)
```

---

## 2. Custom Access Token Hook (optional — role in JWT)

**Today:** RLS uses `is_admin()` / `is_super_admin()` which read `profiles.role`. That’s correct and always up to date.

**Custom Access Token Hook:** Puts `user_role` (or similar) into the JWT so RLS can use `auth.jwt() ->> 'user_role'` instead of a `profiles` lookup.  

**Tradeoffs:**
- **Pro:** Slightly faster RLS (no join to `profiles` on every row).
- **Con:** Role in JWT is fixed until next login/refresh; after an admin demotes a user, that user must sign out and back in (or you force token refresh).

**When to use:** High‑traffic, read‑heavy tables where RLS is on the hot path. For GoKart Part Picker, `is_admin()` is acceptable; only add this if you see RLS in the slow-query logs.

**If you enable it:**
1. **Dashboard → Authentication → Hooks → Custom Access Token.**
2. Hook receives `auth.users` and related data; you run a `SELECT role FROM profiles WHERE id = user_id` and return the JWT with an **extra** claim, e.g. `user_role`. Do **not** remove required claims (`sub`, `role`, `aud`, `exp`, etc.).
3. In RLS, you can optionally prefer the claim:
   ```sql
   (auth.jwt() ->> 'user_role') IN ('admin','super_admin')
   ```
   Fall back to `is_admin()` if the claim is missing (backward compatibility).

---

## 3. Row Level Security (RLS)

### 3.1 What you already have

- RLS on all relevant tables.
- `is_admin()`, `is_super_admin()`, `get_user_role()` as `SECURITY DEFINER` helpers.
- `handle_new_user` does **not** set `role` from `raw_user_meta_data`; it uses `'user'` — good.

### 3.2 Improvements

**a) Index for `is_admin()` / `is_super_admin()`**

These functions do `SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (...)`. Ensure `profiles` is indexed:

```sql
-- If not already present
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);
```

**b) Optional: MFA for sensitive writes**

For actions that change roles or other critical data, you can require `aal2`:

```sql
-- Example idea: only if you add a “sensitive_actions” or audit
-- USING ((auth.jwt() ->> 'aal') = 'aal2' AND is_super_admin())
```

**c) RLS canary**

You have `run_rls_canary_tests()`. Run it after every RLS or schema change:

```bash
# In Supabase SQL Editor or CI
SELECT * FROM run_rls_canary_tests();
```

**d) Explicit “restrictive” where it matches your model**

For tables where you want “if any policy grants, allow” (default) vs “all applicable policies must pass,” you can use:

```sql
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;  -- or similar for strict tables
```

Use only where it matches your intended semantics.

---

## 4. Storage (when you add buckets)

**Current:** Storage is enabled in `config.toml`; no buckets or RLS on `storage.objects` yet. When you implement product images (or any bucket), do the following.

### 4.1 RLS on `storage.objects`

`auth.role()` is the Postgres role (`anon`, `authenticated`, `service_role`), **not** your app’s `profiles.role`. Use `is_admin()` (or a small `SECURITY DEFINER` wrapper) for admin‑only buckets.

**Example for a `product-images` bucket (public read, admin write):**

```sql
-- Enable RLS on storage.objects (if not already)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read for product-images
CREATE POLICY "Product images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only admins can insert/update/delete (use is_admin(), not auth.role())
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND is_admin()
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND is_admin());
```

For user‑specific buckets (e.g. avatars), use `auth.uid()` and a clear path convention like `user_id/filename`.

### 4.2 Bucket and file rules

**`config.toml`:**
```toml
[storage]
enabled = true
file_size_limit = "10MB"
```

**In Dashboard → Storage → bucket → Policies / Settings:**
- Allowed MIME types: e.g. `image/jpeg`, `image/png`, `image/webp`.
- Max file size: align with `file_size_limit` (e.g. 5–10MB).
- Optionally: no public buckets for private data; use signed URLs instead.

### 4.3 Upload validation (app side)

In `uploadProductImage` (or equivalent):

- Check MIME type (and optionally magic bytes), not only extension.
- Enforce max size before sending to Storage.
- Use a strict path pattern, e.g. `product-images/engines/{uuid}/primary.jpg`, to avoid path traversal.

---

## 5. Service role and secrets

From the [SECURITY-AUDIT-REPORT](./SECURITY-AUDIT-REPORT.md):

- **Never** put `SUPABASE_SERVICE_ROLE_KEY` in frontend, `NEXT_PUBLIC_*`, or in git.
- Rotate it if it has ever been committed; remove/redact from all docs and add `.md/` to `.gitignore` (or similar) so it doesn’t happen again.
- Use it only in:
  - Backend/Edge Functions (e.g. webhooks, cron).
  - Scripts (e.g. `database-health-check`, `import-product-images`) that run in CI or on a secure host.
- In those scripts: **require** `SUPABASE_SERVICE_ROLE_KEY`; do **not** fall back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 6. Auth trigger: `handle_new_user`

Your latest `handle_new_user` (from `20260116000010_simplify_profile_trigger.sql`):

- Sets `role = 'user'` explicitly.
- Does **not** read `role` from `raw_user_meta_data`.

**Keep it that way.** Never trust `raw_user_meta_data` or `raw_app_meta_data` for `role` or other security‑sensitive fields. If you add more metadata (e.g. `plan`), validate and sanitize it.

---

## 7. Supabase project and network (Pro and above)

If you are on Pro/Team/Enterprise:

**Dashboard → Project Settings → API:**
- **API URL / anon key:** Restrict to your frontend domain(s) if the plan supports it.
- **Service role:** Never exposed to the browser; no extra Supabase‑side restriction needed if you follow §5.

**Dashboard → Project Settings → Database / Network:**
- **Network restrictions:** Restrict DB access to Vercel IPs, your office, or a VPN, if possible. This affects direct Postgres connections, not the PostgREST API over the public Internet.
- **Connection pooling:** Use the pooled (e.g. `-pooler`) endpoint in production to avoid exhausting connections.

---

## 8. Checklist (Supabase‑specific)

| Item | Where | Status |
|------|--------|--------|
| RLS on all `public` tables | Migrations | ✅ Done |
| RLS on `storage.objects` when using Storage | Migration when adding buckets | ⬜ Pending |
| `is_admin()` / `is_super_admin()` never trust `raw_user_meta_data` | `handle_new_user` | ✅ Correct |
| JWT expiry ≤ 1h | `config.toml` / Dashboard | ✅ 3600 |
| Refresh token rotation | `config.toml` / Dashboard | ⬜ Add |
| Email confirmation ON | `config.toml` | ✅ |
| Double confirm email change | `config.toml` | ✅ |
| MFA for admins (or all) | Dashboard | ⬜ Optional |
| Custom Access Token (role in JWT) | Dashboard Hooks | ⬜ Optional |
| `profiles(id, role)` index for RLS helpers | Migration | ⬜ Add if missing |
| Service role never in client or git | Env, scripts, docs | ❌ Fix per audit |
| Storage: `is_admin()` in policies, not `auth.role()` | When adding Storage | ⬜ Pending |
| Run RLS canary after RLS changes | CI / manual | ⬜ Ongoing |

---

## 9. Suggested `config.toml` diff

```diff
 [auth]
 enabled = true
 site_url = "http://localhost:3000"
 additional_redirect_urls = ["http://localhost:3000/**"]
 jwt_expiry = 3600
 enable_signup = true
 enable_anonymous_sign_ins = false
+refresh_token_rotation_enabled = true
+refresh_token_reuse_interval = 10

 [auth.email]
 enable_signup = true
 double_confirm_changes = true
 enable_confirmations = true
```

For `refresh_token_*`, confirm the keys in [Supabase config](https://supabase.com/docs/guides/cli/config#auth); they can differ by CLI version. If not supported in `config.toml`, enable “Refresh token rotation” in Dashboard → Authentication → Settings.

---

## 10. Optional: migration for RLS‑related index

Run only if `idx_profiles_id_role` does not already exist:

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_rls_profiles_index.sql
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);
COMMENT ON INDEX idx_profiles_id_role IS 'Speeds up is_admin()/is_super_admin() in RLS policies';
```

---

## References

- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks) (incl. Custom Access Token)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Auth MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [Supabase Rate Limits](https://supabase.com/docs/guides/auth/rate-limits)
- [RLS performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [Signing keys and rotation](https://supabase.com/docs/guides/auth/signing-keys)
