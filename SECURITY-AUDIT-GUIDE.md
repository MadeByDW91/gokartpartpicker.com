# Security Audit Guide

> **Purpose:** Comprehensive guide for running security audits on GoKart Part Picker

---

## Quick Start

### Run Automated Security Audit

```bash
# Run the security audit script
npx tsx scripts/security-audit.ts
```

This will check:
- ✅ Dependency vulnerabilities
- ✅ Exposed secrets in code
- ✅ SQL injection risks
- ✅ XSS vulnerabilities
- ✅ Missing input validation
- ✅ RLS policy coverage
- ✅ Environment variable configuration

---

## Manual Security Checks

### 1. Dependency Security

```bash
cd frontend
npm audit
npm audit fix
```

**What to check:**
- Critical and high severity vulnerabilities
- Outdated packages
- Known security advisories

**Action:** Fix all critical and high vulnerabilities before production.

---

### 2. Database Security (RLS)

Run in Supabase SQL Editor:

```sql
-- Check RLS is enabled on all tables
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check for tables without RLS
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename NOT IN ('_prisma_migrations'); -- Exclude system tables
```

**What to check:**
- All user-facing tables have RLS enabled
- RLS policies are comprehensive
- No tables with sensitive data missing RLS

**Action:** Enable RLS on any tables missing it.

---

### 3. Check for Exposed Secrets

```bash
# Search for potential secrets in code
grep -r "api.*key.*=" frontend/src --include="*.ts" --include="*.tsx"
grep -r "secret.*=" frontend/src --include="*.ts" --include="*.tsx"
grep -r "password.*=" frontend/src --include="*.ts" --include="*.tsx"
```

**What to check:**
- No API keys in source code
- No passwords in source code
- No tokens in source code
- All secrets in environment variables

**Action:** Move any secrets to environment variables.

---

### 4. Input Validation Check

```bash
# Check server actions for validation
grep -r "use server" frontend/src/actions --include="*.ts" | wc -l
grep -r "zod\|Zod" frontend/src/actions --include="*.ts" | wc -l
```

**What to check:**
- All server actions use Zod validation
- All user inputs are validated
- No direct database queries with user input

**Action:** Add validation to any missing endpoints.

---

### 5. XSS Protection Check

```bash
# Check for dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" frontend/src --include="*.tsx"
```

**What to check:**
- No `dangerouslySetInnerHTML` without sanitization
- User-generated content is sanitized
- DOMPurify is used where needed

**Action:** Sanitize any unsafe HTML rendering.

---

### 6. SQL Injection Check

```bash
# Check for raw SQL with interpolation
grep -r "\`.*\$\{" frontend/src --include="*.ts" --include="*.tsx"
```

**What to check:**
- No raw SQL with string interpolation
- All queries use parameterized queries
- Supabase query builder is used

**Action:** Replace any unsafe SQL queries.

---

### 7. Environment Variables Check

```bash
# Check .env files
cat frontend/.env.local | grep -v "^#" | grep "="
```

**What to check:**
- All secrets are in environment variables
- No secrets committed to git
- `.env.local` is in `.gitignore`

**Action:** Verify `.env.local` is not committed.

---

### 8. Security Headers Check

Check `next.config.ts` for security headers:

```typescript
// Should include:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security
```

**Action:** Add missing security headers.

---

## Security Testing Checklist

### Authentication & Authorization

- [ ] Test password policies
- [ ] Test account lockout
- [ ] Test session expiration
- [ ] Test email verification
- [ ] Test password reset flow
- [ ] Test RLS policies for each role
- [ ] Test admin access restrictions
- [ ] Test IDOR vulnerabilities

### Input Validation

- [ ] Test XSS payloads
- [ ] Test SQL injection attempts
- [ ] Test CSRF attacks
- [ ] Test file upload security
- [ ] Test rate limiting
- [ ] Test input length limits

### Data Protection

- [ ] Check for exposed secrets
- [ ] Verify environment variables
- [ ] Check API key security
- [ ] Verify database credentials
- [ ] Check PII handling
- [ ] Verify audit logging

### Infrastructure

- [ ] Verify HTTPS enforcement
- [ ] Check security headers
- [ ] Verify CORS configuration
- [ ] Check error messages
- [ ] Verify logging security
- [ ] Check backup encryption

---

## Using the Security Audit Agent

### Invoke the Agent

```
I need you to act as A11 - Security Audit Agent. Please run a comprehensive security audit of the codebase and provide:
1. Security audit report
2. Vulnerability list
3. Remediation recommendations
4. Security score
```

### Agent Capabilities

The Security Audit Agent (A11) can:
- Review authentication and authorization
- Check for security vulnerabilities
- Test security controls
- Provide remediation recommendations
- Generate security reports

---

## Security Score Rating

| Score | Meaning | Action Required |
|-------|---------|----------------|
| 5/5 | Excellent | No issues found |
| 4/5 | Good | Minor issues, can proceed |
| 3/5 | Fair | Medium issues, review needed |
| 2/5 | Poor | High issues, fix before production |
| 1/5 | Critical | Critical issues, do not deploy |

---

## Common Security Issues

### 1. Missing RLS Policies
**Severity:** High  
**Fix:** Enable RLS on all tables with user data

### 2. Exposed Secrets
**Severity:** Critical  
**Fix:** Move to environment variables

### 3. SQL Injection
**Severity:** Critical  
**Fix:** Use parameterized queries

### 4. XSS Vulnerabilities
**Severity:** High  
**Fix:** Sanitize user input

### 5. Missing Input Validation
**Severity:** High  
**Fix:** Add Zod validation

### 6. Dependency Vulnerabilities
**Severity:** Medium-High  
**Fix:** Run `npm audit fix`

### 7. Missing Security Headers
**Severity:** Medium  
**Fix:** Configure in `next.config.ts`

### 8. IDOR Vulnerabilities
**Severity:** High  
**Fix:** Add ownership checks in RLS

---

## Pre-Production Security Checklist

Before deploying to production:

- [ ] Run `npm audit` and fix all critical/high issues
- [ ] Verify RLS is enabled on all tables
- [ ] Check for exposed secrets in code
- [ ] Test all authentication flows
- [ ] Test RLS policies for each role
- [ ] Verify input validation on all endpoints
- [ ] Check security headers are configured
- [ ] Verify HTTPS is enforced
- [ ] Test rate limiting
- [ ] Review error messages (no info leakage)
- [ ] Check audit logging is functional
- [ ] Verify environment variables are set
- [ ] Run security audit script
- [ ] Review security audit report

---

## Regular Security Maintenance

### Weekly
- Review security logs
- Check for failed login attempts
- Monitor rate limit violations

### Monthly
- Run `npm audit`
- Review dependency updates
- Check for security advisories

### Quarterly
- Full security audit
- Penetration testing
- Review security policies
- Update security documentation

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/going-to-production#security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

---

*Last Updated: 2026-01-17*
