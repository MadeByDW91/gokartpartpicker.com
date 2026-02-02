# node_modules Improvements

You don't edit `node_modules` directly—it's generated from `package.json` and the lockfile. These improvements are about **reducing size, keeping it healthy, and making the IDE faster**.

---

## 1. Stop Cursor from indexing node_modules

Create a **`.cursorignore`** file at the project root (same folder as `README.md`) with:

```
# Dependencies - don't index (speeds up Cursor)
frontend/node_modules/
**/node_modules/

# Build outputs
frontend/.next/
frontend/out/
**/.next/
**/out/

# Lockfiles (large; remove this block if you want lockfile searchable)
**/package-lock.json
```

That reduces indexing work and can make Cursor faster. Reload the window or reopen the project for it to take effect.

---

## 2. Keep the tree clean

Run occasionally from `frontend/`:

```bash
cd frontend
npm prune
```

This removes packages that are no longer in `package.json`. Safe to run anytime.

---

## 3. Check for vulnerabilities

```bash
cd frontend
npm audit
```

Fix with `npm audit fix` when possible. If you see breaking changes, use `npm audit fix --force` only if you're ready to accept major upgrades.

---

## 4. Optional: shrink disk use and install time with pnpm

Your `node_modules` is ~539MB. If you want smaller installs and faster installs:

- **pnpm** uses a single content-addressable store and hard links, so `node_modules` is much smaller and installs are often faster.
- To try it: install pnpm (`npm install -g pnpm`), then in `frontend/` run `pnpm import` (creates `pnpm-lock.yaml` from `package-lock.json`), then `pnpm install`. Use `pnpm run dev` / `pnpm run build` instead of `npm run dev` / `npm run build`.

Only do this if you're okay standardizing on pnpm; the rest of the improvements work with npm.

---

## 5. Optional: find unused dependencies

To see if anything in `package.json` is unused:

```bash
cd frontend
npx depcheck
```

It may report false positives (e.g. config-only or dynamically imported packages). Remove only deps you're sure you don't use. Don't remove things like `react`, `next`, or Supabase packages unless you've actually replaced them.

---

## 6. Don’t commit node_modules

Your `.gitignore` already has `node_modules/`. Never commit it; rely on `package.json` + `package-lock.json` and `npm install` (or pnpm) to reproduce the tree.

---

## 7. Optional: exclude from VS Code search too

If you use VS Code (or Cursor’s search), you can exclude `node_modules` from search so "Find in Files" is faster:

- **Settings** → search for **files.exclude** → add:
  - `**/node_modules`: true
  - `**/.next`: true

(Cursor may already respect `.cursorignore` for search; this is for editor-level search if needed.)

---

## Summary

| Action                         | Done? | Command / change                          |
|--------------------------------|-------|------------------------------------------|
| Exclude node_modules from Cursor | Yes   | `.cursorignore` added                    |
| Prune extraneous packages      | Run when you like | `npm prune` in frontend              |
| Security audit                 | Run when you like | `npm audit` / `npm audit fix`       |
| Try pnpm                      | Optional | pnpm + `pnpm import` + `pnpm install` |
| Find unused deps              | Optional | `npx depcheck` in frontend           |

No changes were made inside `node_modules`; all improvements are via config and scripts.
