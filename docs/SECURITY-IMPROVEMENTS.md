# Security improvements (user data leak prevention)

Summary of changes to reduce the risk of user data (especially email) being leaked.

---

## 1. Profiles no longer world-readable (critical)

**Issue:** The `profiles` table had RLS policy "Profiles are viewable by everyone" (`USING (TRUE)`), so **anyone** (including unauthenticated) could `SELECT * FROM profiles` and get every user's **email**, username, role, etc.

**Fix (migration `20260201000001_profile_privacy_no_email_leak.sql`):**

- **View `profile_display`:** Public slice with only `id`, `username`, `avatar_url`. No email, no role. Use this for forums, builds, templates (display names/avatars).
- **Profiles RLS:** Replaced "viewable by everyone" with:
  - **Users can view own profile** — `auth.uid() = id`
  - **Admins can view all profiles** — for admin user list/search

**App changes:**

- **`getProfileDisplayMap(userIds)`** in `frontend/src/actions/profile.ts` — fetches from `profile_display` for many IDs; use for merging display info into list/detail results.
- **Forums:** `getForumTopics`, `getForumTopic`, `getForumPosts` — no longer embed `profiles`; fetch topics/posts, then `getProfileDisplayMap(user_ids)` and merge `user`.
- **Builds:** `getBuild`, `getBuildByShareId`, `getPublicBuilds`, `getBuildsForComparison` — same pattern; profile from `profile_display`.
- **Templates:** `getAdminTemplates`, `getTemplate`, `getAllTemplates`, `getPendingTemplates` — same pattern.
- **Hooks:** `usePublicBuilds`, `useBuild`, `useBuildsForComparison` — now call server actions (`getPublicBuilds`, `getBuild`, `getBuildsForComparison`) so they get merged profile from `profile_display`.

**Run migration:** Apply `supabase/migrations/20260201000001_profile_privacy_no_email_leak.sql` (Supabase Dashboard → SQL Editor or CLI).

---

## 2. Error logging (no PII/stack in logs)

**Issue:** `handleErrorWithContext` in `frontend/src/lib/api/errors.ts` was logging the full error object with `console.error`, which could end up in Vercel logs and leak stack traces or internal messages.

**Fix:** Use `secureError` from `@/lib/secure-logging` so logs are sanitized (no passwords, tokens, full stack). Only safe fields (message, context, resourceName, timestamp) are logged.

---

## 3. What was already in place

- **RLS** on engines, parts, builds, forums, etc. (owner/admin/public as designed).
- **Rate limiting** (Upstash) on login, resend verification, admin search.
- **Secure logging** (`frontend/src/lib/secure-logging.ts`) — sanitize email, user id, password, token before logging.
- **Security headers** in `next.config.ts` — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP, HSTS in production.
- **Account security** (migration `20260117000007_account_security_phase1.sql`) — login attempt tracking, lockout (5 failures in 15 min). Note: `login_attempts` stores email in plain text for lockout; consider hashing or shortening if you want to reduce exposure in a DB dump.

---

## 4. Optional hardening (consider later)

| Item | Notes |
|------|--------|
| **login_attempts.email** | Stored in plain text for lockout. If DB is compromised, emails are visible. Optional: store a hash or truncated value for lockout key only. |
| **Admin-only profile fields** | Admin search and user detail return email; those are behind `requireAdmin()` and RLS "Admins can view all profiles" — OK. |
| **Sentry** | Add for error tracking (free tier); ensure PII is not sent in breadcrumbs. |
| **Audit logs** | `forum_audit_log`, `rate_limit_log` include IP; keep access admin-only and redact in any exports. |

---

## 5. Checklist after applying migration

- [ ] Run migration `20260201000001_profile_privacy_no_email_leak.sql`.
- [ ] Verify forums: topic list, topic detail, posts show usernames/avatars (no email).
- [ ] Verify builds: public builds list and single build show profile display (username/avatar).
- [ ] Verify templates: template list and detail show profile/submitter display.
- [ ] Verify admin: user list and search still show email (admin only).
- [ ] Verify profile page and header still show own user email (own profile).

---

*Last updated: 2026-02-01. See also `docs/SCALABILITY-RUNBOOK.md` (incident response) and `docs/SCALABILITY-10K-PLAN.md` (security-first phases).*
