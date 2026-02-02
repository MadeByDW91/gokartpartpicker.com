# File Structure Improvements

Recommendations to improve the project’s file structure after the purge. Apply incrementally; each section is independent.

---

## 1. Frontend: Group auth actions under one surface

**Current:** Three separate files with overlapping names:
- `actions/auth.ts` – sign up, sign out, resend verification
- `actions/auth-login.ts` – (unused or minimal?)
- `actions/auth-secure.ts` – `secureSignIn`, `getIsAdmin` (used by login)

**Improvement:** Either merge into a single `actions/auth.ts` (and delete the others), or keep one “auth” module and re-export from `actions/index.ts` so consumers always import from `@/actions` (e.g. `auth.signIn`, `auth.resendVerification`). Reduces “which auth file do I use?” confusion.

---

## 2. Frontend: Group admin actions by domain

**Current:** `actions/admin/` has 28 flat files (affiliate-analytics, amazon-import, approvals, builds, …).

**Improvement:** Group by domain in subfolders (no need to change route paths):
- `actions/admin/amazon/` – amazon-category-search, amazon-import
- `actions/admin/forums/` – forums
- `actions/admin/ingestion/` – ingestion
- `actions/admin/engines/` – engine-clones, engine-suppliers
- `actions/admin/parts/` – part-suppliers, product-prices (and parts-related)
- `actions/admin/users/` – users, security, approvals, notifications
- `actions/admin/content/` – content
- Keep single-purpose files (analytics, deployment, reports, search, etc.) in `admin/` root.

Then add small barrels (e.g. `admin/amazon/index.ts`) if you want `import { … } from '@/actions/admin/amazon'`. Optional; only do it if it improves readability.

---

## 3. Frontend: Group lib by domain

**Current:** `lib/` has many flat files: amazon-paapi, amazon-scraper, analytics, resend, video-utils, youtube-api, etc.

**Improvement:** Group related modules:
- `lib/amazon/` – amazon-paapi.ts, amazon-scraper.ts
- `lib/supabase/` – already exists (client, server)
- `lib/validation/` – already exists (schemas, forums)
- `lib/api/` – already exists (errors, types)
- `lib/performance/` – already exists (calculator)
- Optional: `lib/video/` – video-utils.ts, youtube-api.ts

Leave generic single files (utils, sanitization, error-tracking, secure-logging, resend, analytics) at `lib/` root. Update imports in one pass (e.g. `@/lib/amazon/amazon-paapi`).

---

## 4. Frontend: Consolidate types

**Current:** `types/` has admin, database, guides, templates. Some types live in `lib/api/types.ts` and `lib/validation/schemas.ts`.

**Improvement:** Prefer a single entry point for app types:
- Keep `types/database.ts` as the source of truth for DB-shaped types.
- Re-export from `types/index.ts` (e.g. `export * from './database'; export * from './admin';` …) so consumers can `import type { X } from '@/types'`.
- Leave API/validation-specific types in `lib/api` and `lib/validation`; document in a one-line comment in `types/README.md` or in this doc that “DB/domain types live in `@/types`, API/validation types in `lib`.”

---

## 5. Frontend: Make component barrels consistent (or remove)

**Current:** Some folders have `index.ts` barrels (admin, builder, ev, templates, videos); admin’s barrel only exports DataTable and EngineForm. Most code imports by file path (e.g. `@/components/admin/EngineForm`), not from the barrel.

**Improvement (choose one):**
- **Option A – Use barrels:** Expand `components/admin/index.ts` to export every public admin component, then switch imports to `from '@/components/admin'`. Do the same for builder, ev, etc. so all component folders have one public API.
- **Option B – Drop barrels:** Remove underused barrels (e.g. admin’s) and keep importing by file. Simpler and no extra indirection.

Recommendation: **Option B** unless you want a strict “only import from folder” rule; then do Option A everywhere.

---

## 6. Frontend: Colocate route-specific components with routes

**Current:** Route-specific pieces live in `components/` (e.g. `SelectEngineButton.tsx`, `SelectPartButton.tsx`, `SelectMotorButton.tsx` in app routes; `PartsPageContent.tsx` in components).

**Improvement:** Move route-only components next to the route:
- `app/engines/[slug]/SelectEngineButton.tsx` – already there
- `app/parts/[slug]/SelectPartButton.tsx` – already there
- `app/motors/[slug]/SelectMotorButton.tsx` – already there
- `app/parts/PartsPageContent.tsx` – move from `components/parts/PartsPageContent.tsx` if it’s only used by `app/parts/page.tsx` or layout. If it’s shared, leave it in components.

Reduces “is this used by one page or many?” guessing.

---

## 7. Frontend: Reduce duplicate “search” naming

**Current:** `components/admin/AdvancedFilters.tsx`, `components/admin/EnhancedSearch.tsx` and `components/search/AdvancedSearch.tsx`, `components/search/SearchModal.tsx`. “Advanced” appears in both admin and public search.

**Improvement:** Rename for clarity:
- Admin: keep `EnhancedSearch` and `AdvancedFilters` (or rename to `AdminSearch` / `AdminFilters` if you want “admin” in the name).
- Public: keep `SearchModal`; rename `AdvancedSearch` to something like `PartsSearch` or `CatalogSearch` if it’s catalog-specific, so it’s clear it’s not the same as admin search.

No need to move files; naming alone reduces confusion.

---

## 8. Root: Keep root clean

**Current:** Root has `.deployment-trigger`, `.deployment-ready`, several .md runbooks, `build.sh`, `vercel.json`, and the main folders.

**Improvement:**
- **Ignore deployment artifacts:** Add `.deployment-trigger` and `.deployment-ready` to `.gitignore` if they are generated by CI or local deploy (so they don’t show as modified/untracked). *Done in this repo.*
- **Runbooks:** Keeping `README.md`, `HOW-TO-RUN-MIGRATIONS.md`, `START-DEV-SERVER.md`, and the two improvement docs at root is fine (5–6 files). Optionally move HOW-TO and START-DEV into a `runbooks/` folder and link from README if you prefer a single “docs” folder.
- **.vscode:** Your `.gitignore` currently ignores `.vscode/`. If you want to share recommended extensions with the team, remove `.vscode/` from `.gitignore` and commit at least `extensions.json`. If it’s personal, leave it ignored.

---

## 9. Root: Clarify Admin vs frontend

**Current:** Root has `Admin/` (Python ingestion tooling), `frontend/` (Next.js app), `scripts/`, `supabase/`, and a couple of .md runbooks.

**Improvement:**
- Add a one-line note in root `README.md`: “`Admin/` is a standalone Python tool for ingestion; the main app is in `frontend/`.”
- Optional: Move `Admin/` to `tools/admin-ingestion/` or `scripts/admin-ingestion/` so it’s clear it’s tooling, not the web app. Only do this if you’re willing to update any docs or CI that reference `Admin/`.

---

## 10. Scripts: Group by purpose

**Current:** `scripts/` has agents/, videos/, and many flat .ts/.json/.csv files.

**Improvement:** Group into subfolders:
- `scripts/agents/` – already exists (product images, etc.)
- `scripts/videos/` – already exists
- `scripts/data/` – electro-company-motors.csv, electro-company-motors.json, video-import-template.csv, predator-212-hemi-videos.csv
- `scripts/output/` or `scripts/.output/` – test-found-images.json, test-products.json, test-validated-images.json (or add to .gitignore if they are local artifacts)
- Keep at root: check-site-errors, database-health-check, security-audit, verify-agent-integration, import-electro-company-motors, export-products-needing-images; detect-agent-work-areas, detect-agents.sh only if still used

Use a small `scripts/README.md` to list each script’s purpose and which env it needs.

---

## 11. Supabase: Migration naming and ordering

**Current:** Several migrations share the same timestamp prefix (e.g. two `20260116000008_*`, two `20260116000012_*`, two `20260116000013_*`, two `20260116000020_*`, etc.). Order depends on filename sort.

**Improvement:** For any new migrations, use strictly increasing timestamps (e.g. `YYYYMMDDHHMMSS_description.sql`). For existing duplicates, avoid renaming if they’re already applied in production; instead document in `HOW-TO-RUN-MIGRATIONS.md` that “migrations with the same date prefix run in filename order.” If you have a clean dev DB and no production data, you could consolidate or renumber once and document the one-time fix.

---

## Priority summary

| Priority | Area                    | Action                                              |
|---------|-------------------------|-----------------------------------------------------|
| High    | Auth actions            | Merge or re-export auth into one surface (1)       |
| High    | Component barrels       | Either expand admin barrel or remove it (5)         |
| Medium  | Admin actions           | Optional grouping by domain (2)                     |
| Medium  | Lib                     | Optional grouping (amazon/, video/) (3)            |
| Medium  | Types                   | Single `types/index.ts` re-export (4)              |
| Low     | Route components        | Colocate PartsPageContent if single-use (6)         |
| Low     | Search naming           | Rename to avoid “Advanced” overlap (7)              |
| Low     | Root cleanup            | Ignore .deployment-*; optional runbooks/ or .vscode (8) |
| Low     | Root Admin note         | Document Admin vs frontend in README (9)            |
| Low     | Scripts grouping         | data/, output/ and README (10)                     |
| Low     | Migrations              | Document ordering; fix only for new migrations (11) |

Start with (1) and (5); the rest can be done when touching those areas.
