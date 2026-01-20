# Security Audit Report – GoKart Part Picker

**Agent:** A11 Security Audit Agent  
**Date:** 2026-01-17  
**Scope:** Frontend, Supabase migrations, scripts, documentation

---

## Executive Summary

| Area | Rating | Notes |
|------|--------|-------|
| **Overall security posture** | Medium–High | Solid RLS, auth, and input validation; several high‑impact issues to fix before production. |
| **Critical vulnerabilities** | 1 | Supabase `service_role` JWT in committed docs. |
| **High** | 2 | No security headers; API route without auth/rate limiting. |
| **Medium** | 2 | Hardcoded IP in rate limiting; scripts’ anon-key fallback. |
| **Low** | 3 | Defense-in-depth for HTML output; `sk_live` example in rules. |

**Priority:** Resolve the critical finding (secrets in repo) and the two high findings before production.

---

## 1. Critical: Exposed Supabase `service_role` Key in Version Control

| Field | Value |
|-------|--------|
| **Severity** | Critical |
| **Location** | `.md/DEPLOYMENT-STATUS-REPORT.md`, `.md/VERIFY-VERCEL-FIX.md`, `.md/VERCEL-SETUP-STEP-BY-STEP.md`, `.md/PRODUCTION-DEPLOYMENT-QUICKSTART.md`, `.md/PRODUCTION-CHECKLIST.md`, `.md/ENV-TEMPLATE.md` |
| **Impact** | Full database bypass (RLS), read/write/delete of all data, possible account or project compromise. |
| **Proof of concept** | `git ls-files .md/` shows these files are tracked. JWTs in the form `SUPABASE_SERVICE_ROLE_KEY=eyJ...` decode to `role: "service_role"` and a Supabase project ref. |
| **Remediation** | 1) Rotate the `service_role` key in Supabase. 2) Remove or redact the key from all `.md` files and any copy‑paste guides. 3) Add `.md/` to `.gitignore` (or at least `*.md` under `.md/`) if those files must stay local. 4) Use `git filter-branch` or `git filter-repo` to purge the keys from history, or treat the repo as compromised and create a new one. 5) Use placeholders like `SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>` in docs. |
| **References** | OWASP: Hardcoded Secrets; Supabase: never commit `service_role` key. |

---

## 2. High: No Security Headers in Next.js

| Field | Value |
|-------|--------|
| **Severity** | High |
| **Location** | `frontend/next.config.ts` |
| **Impact** | Higher risk of XSS, clickjacking, and protocol downgrade; no CSP to limit impact of injection. |
| **Proof of concept** | `next.config.ts` has no `headers` and no `securityHeaders`; only `images.remotePatterns` is set. |
| **Remediation** | Add security headers in `next.config.ts` (or via middleware/edge): at least `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Strict-Transport-Security` (HSTS) in production. Prefer a nonce- or hash-based CSP that allows your scripts and inline GA/config. |
| **References** | OWASP Secure Headers; MDN CSP, X-Frame-Options, HSTS. |

---

## 3. High: `/api/amazon-product` Has No Auth or Rate Limiting

| Field | Value |
|-------|--------|
| **Severity** | High |
| **Location** | `frontend/src/app/api/amazon-product/route.ts` |
| **Impact** | Unauthenticated access; abuse as a proxy to Amazon; possible DoS via repeated calls; higher cost/blocking from third‑party proxy. |
| **Proof of concept** | `GET /api/amazon-product?asin=B001` can be called by anyone; no `Authorization` or API‑key check; no rate limiting. |
| **Remediation** | 1) Restrict to authenticated admin (or similar) by checking `supabase.auth.getUser()` (or equivalent) and rejecting unauthenticated requests. 2) Add rate limiting (e.g. per-IP or per-user) in this route or in middleware. 3) Validate `asin` format (e.g. `^[A-Z0-9]{10}$`) before calling the proxy. |
| **References** | OWASP API Security; rate limiting best practices. |

---

## 4. Medium: Rate Limit Uses Hardcoded IP

| Field | Value |
|-------|--------|
| **Severity** | Medium |
| **Location** | `frontend/src/actions/forums.ts` (e.g. `checkRateLimit(user.id, '127.0.0.1', 'create_topic', …)`, `checkRateLimit(user.id, '127.0.0.1', 'create_post', …)`) |
| **Impact** | IP-based rate limiting is ineffective; all users share the same logical “IP”; abuse from many accounts is not throttled by IP. |
| **Proof of concept** | `'127.0.0.1'` is passed as `p_ip_address` to `check_rate_limit`. |
| **Remediation** | Pass the client IP from the request: e.g. `x-forwarded-for`, `x-real-ip`, or `request.ip` (depending on host). In server actions, use `headers().get('x-forwarded-for')` or similar and take the leftmost (client) IP, with a fallback. Validate it is a valid address before calling the RPC. |
| **References** | OWASP: rate limiting; proxy header handling. |

---

## 5. Medium: Scripts Fall Back to Anon Key When Service Role Missing

| Field | Value |
|-------|--------|
| **Severity** | Medium |
| **Location** | `scripts/check-site-errors.ts`, `scripts/database-health-check.ts` |
| **Impact** | Scripts may run with anon key instead of `service_role`, causing permission errors or incomplete checks; possible confusion in CI when `SUPABASE_SERVICE_ROLE_KEY` is unset. |
| **Proof of concept** | `const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY \|\| process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY \|\| ''` |
| **Remediation** | Require `SUPABASE_SERVICE_ROLE_KEY` for these scripts: if missing, log a clear error and `process.exit(1)`. Do not fall back to the anon key for admin/health scripts. |
| **References** | Principle of least privilege; fail closed. |

---

## 6. Low: Defense-in-Depth for HTML Rendering

| Field | Value |
|-------|--------|
| **Severity** | Low |
| **Location** | `frontend/src/components/forums/ForumPostCard.tsx` (`dangerouslySetInnerHTML` with `post.content.replace(/\n/g, '<br>')`), `frontend/src/components/guides/GuideViewer.tsx`, `frontend/src/components/guides/PrintableGuide.tsx` |
| **Impact** | Forum and guide content is sanitized on write (DOMPurify in `createForumPost`/`createForumTopic`/`updateForumPost`/`updateForumTopic`). If legacy data, direct SQL, or a bug introduces unsanitized HTML, it could be rendered without an extra check. |
| **Proof of concept** | `ForumPostCard` uses `dangerouslySetInnerHTML` on `post.content` after only `replace(/\n/g, '<br>')`; no `sanitizeForDisplay` on render. |
| **Remediation** | For user-generated content (forums), run `sanitizeForDisplay` (or equivalent) at render time before `dangerouslySetInnerHTML`. For admin-only content (guides), document that it must stay admin-only; optionally add sanitization on render for defense-in-depth. |
| **References** | OWASP XSS; defense in depth. |

---

## 7. Low: Example Stripe Key in Cursor Rules

| Field | Value |
|-------|--------|
| **Severity** | Low |
| **Location** | `.cursor/rules/agent-rules.md` (e.g. `const apiKey = 'sk_live_abc123'`) |
| **Impact** | `sk_live_abc123` is a placeholder; if it were a real key it would be critical. As an example it could mislead or be copy‑pasted. |
| **Remediation** | Replace with a clearly fake example, e.g. `const apiKey = 'sk_live_EXAMPLE_DO_NOT_USE'` or `'<your-stripe-secret-key>'. |
| **References** | OWASP: secrets in code. |

---

## 8. Low: Admin UI Protection Is Client-Side Only (Layout)

| Field | Value |
|-------|--------|
| **Severity** | Low (mitigated by server-side checks) |
| **Location** | `frontend/src/app/admin/layout.tsx` |
| **Impact** | Non-admins are redirected via `useAdmin()` and `router.push` in the client. With JS disabled or a custom client, the layout might still render before redirect. Actual data access is enforced by `requireAdmin()` in server actions and by RLS when using the anon client. |
| **Proof of concept** | `if (!isAdmin) { router.push('/'); return null; }` and `useEffect` redirect are client-only. |
| **Remediation** | Optionally add a server-side check in a server `admin` layout or in `middleware` for `/admin` (e.g. `getUser` and role check) to return 403 before sending the admin UI. This improves UX and avoids briefly showing admin chrome. |
| **References** | Never rely on client-side only for authorization. |

---

## Security Checklist (Pre-Production)

### Authentication & Authorization

- [x] RLS enabled on relevant tables (profiles, engines, parts, part_categories, compatibility_rules, engine_part_compatibility, builds, build_likes, content, audit_log, build_templates, price_history, price_alerts, videos, engine_clones, guide_steps, guide_helpful, forum_*, rate_limit_log, user_bans, forum_audit_log, bulk_operations, bulk_operation_templates).
- [ ] RLS policies tested for each role (canary exists; needs periodic runs).
- [x] Admin routes and actions require admin/super_admin via `requireAdmin()` and `useAdmin()`.
- [x] No IDOR found in reviewed RLS and actions; ownership/visibility is enforced.
- [x] Session handling via Supabase SSR; no custom token storage in `localStorage` for secrets.
- [ ] Password policies: delegated to Supabase; confirm in dashboard.

### Input Validation

- [x] Forum flows use Zod (`createForumTopicSchema`, `createForumPostSchema`, etc.) and `parseInput`.
- [x] Forum content sanitized with DOMPurify (`sanitizeContent`) on create/update.
- [x] No raw SQL with string interpolation in app code; Supabase client/parameterized RPC used.
- [ ] File upload: not in scope of this audit.
- [x] Forums: rate limiting logic present (implementation weakened by hardcoded IP – see Finding 4).
- [ ] Auth endpoints: rate limiting (e.g. login) – confirm at Supabase/IdP level.

### Data Protection

- [ ] **No secrets in client code:** ❌ `.md/` contains `SUPABASE_SERVICE_ROLE_KEY` and is committed (Finding 1).
- [x] Server Supabase client uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`; no `service_role` in frontend.
- [x] Scripts use `process.env.SUPABASE_SERVICE_ROLE_KEY` (with fallback noted in Finding 5).
- [x] Affiliate/GA IDs use `NEXT_PUBLIC_*` or `process.env` appropriately.
- [ ] PII: handled by Supabase Auth and `profiles`; RLS and policies should be reviewed for PII tables.

### Infrastructure

- [ ] HTTPS: enforced by Vercel; confirm HSTS (Finding 2).
- [ ] **Security headers:** ❌ Missing in `next.config.ts` (Finding 2).
- [x] CORS: Next.js API and server actions are same-origin by default; no overly permissive CORS in reviewed code.
- [x] Generic error messages in API/actions; no stack or DB details to client.
- [ ] Logging: `console.error`/`console.log` in places; ensure logs do not capture tokens or PII in production.

### Dependencies

- [x] `npm audit` (frontend): 0 known vulnerabilities.
- [ ] Dependencies and patches: keep updated; re-run `npm audit` periodically.

### Monitoring & Logging

- [x] `audit_log`, `forum_audit_log`, and `rate_limit_log` exist.
- [x] Failed auth and rate-limit events can be logged via Supabase and `rate_limit_log`.
- [ ] Failed login and security alerts: ensure Supabase and/or app monitoring are wired and reviewed.

---

## Security Scores (1–5)

| Area | Score | Notes |
|------|-------|-------|
| Authentication & Authorization | 4/5 | Solid `requireAdmin`, RLS, and role checks; admin UI could add server-side gate. |
| Input Validation | 4/5 | Zod + DOMPurify for forums; guides are admin-originated; optional render-time sanitization. |
| Data Protection | 2/5 | `service_role` in committed docs; otherwise env usage is correct. |
| Infrastructure | 3/5 | No security headers; HSTS/CSP missing; HTTPS assumed from host. |
| Dependencies | 5/5 | `npm audit` clean. |

**Overall (pre-remediation):** 3.6/5. After addressing the critical and high findings, a 4.2–4.5/5 range is realistic.

---

## Remediation Plan

1. **Immediate (before production)**  
   - Rotate `service_role` in Supabase and update all deployment/CI secrets.  
   - Remove or redact `SUPABASE_SERVICE_ROLE_KEY` from `.md/` and other docs; add `.md/` (or selected paths) to `.gitignore` if they must stay local.  
   - Add security headers in `next.config.ts` (or middleware), including CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS.  
   - Restrict `/api/amazon-product` to authenticated (e.g. admin) and add rate limiting and ASIN validation.

2. **Short term**  
   - Use real client IP in `checkRateLimit` for forum actions.  
   - Remove anon-key fallback in `check-site-errors.ts` and `database-health-check.ts`; require `SUPABASE_SERVICE_ROLE_KEY`.  
   - Optionally run `sanitizeForDisplay` on forum (and guide) HTML at render.  
   - Replace `sk_live_abc123` in `.cursor/rules/agent-rules.md` with an obvious placeholder.

3. **Ongoing**  
   - Run RLS canary tests after schema or policy changes.  
   - Re-run `npm audit` and dependency updates on a schedule.  
   - Consider a server-side or middleware check for `/admin` for consistency with “never trust the client.”

---

## Positive Findings

- **RLS:** Consistently enabled and scoped for the audited tables; `is_admin()`/`is_super_admin()` and ownership checks in place.  
- **Admin actions:** All reviewed admin actions call `requireAdmin()` (or equivalent) and use the server Supabase client (anon key); RLS enforces DB-level access.  
- **Forums:** Zod validation, DOMPurify on write, rate limiting (with IP fix needed), and spam/heuristic checks.  
- **No raw SQL concatenation** in app code; Supabase client and RPC used.  
- **Dependencies:** No known npm vulnerabilities in the frontend.  
- **Sanitization module:** `sanitizeContent`, `sanitizeForDisplay`, `validateUrl`, and `sanitizeUrl` provide a good base for safe HTML and URLs.

---

*Report generated by A11 Security Audit Agent. Re-audit after implementing the remediation plan.*
