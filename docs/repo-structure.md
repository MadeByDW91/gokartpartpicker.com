# Project Atlas — Repository Structure

> **Purpose:** Define the authoritative folder structure, naming conventions, and file organization for the entire project.

---

## Root Structure

```
gokartpartpicker.com/
├── .cursor/                    # Cursor IDE configuration
│   ├── rules/                  # Agent-specific rules
│   └── settings.json           # Workspace settings
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD pipelines
│   │   ├── ci.yml              # Continuous integration
│   │   ├── deploy-staging.yml  # Staging deployment
│   │   └── deploy-prod.yml     # Production deployment
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── content/                    # MDX content files
│   ├── guides/                 # How-to guides
│   │   ├── getting-started.mdx
│   │   └── engine-selection.mdx
│   ├── specs/                  # Technical specifications
│   │   └── predator-212.mdx
│   └── safety/                 # Safety notices
│       └── clutch-installation.mdx
├── docs/                       # Project documentation
│   ├── architecture/           # Architecture decisions
│   │   ├── adr-001-tech-stack.md
│   │   ├── adr-002-database.md
│   │   └── adr-003-auth.md
│   ├── agents.md               # Agent responsibilities
│   ├── plan.md                 # 30-day plan
│   ├── repo-structure.md       # This document
│   ├── security.md             # Security strategy
│   ├── deployment.md           # Deployment procedures
│   ├── compatibility-rules.md  # Rules engine docs
│   └── api-contracts.md        # API specifications
├── public/                     # Static assets (served as-is)
│   ├── images/
│   │   ├── engines/            # Engine photos
│   │   ├── parts/              # Part photos
│   │   └── logos/              # Branding
│   ├── fonts/                  # Custom fonts
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/                    # Utility scripts
│   ├── seed-dev.ts             # Development seeding
│   ├── seed-prod.ts            # Production seeding
│   ├── generate-types.ts       # Type generation
│   └── validate-rules.ts       # Rule validation
├── src/                        # Application source
│   └── [see below]
├── supabase/                   # Supabase configuration
│   ├── config.toml             # Local config
│   ├── migrations/             # SQL migrations
│   └── functions/              # Edge functions
├── tests/                      # Test files
│   ├── e2e/                    # Playwright E2E tests
│   │   ├── auth.spec.ts
│   │   ├── builder.spec.ts
│   │   └── admin.spec.ts
│   ├── integration/            # Integration tests
│   └── unit/                   # Unit tests
├── .env.example                # Environment template
├── .env.local                  # Local environment (git-ignored)
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── .prettierrc                 # Prettier configuration
├── CONVENTIONS.md              # Coding conventions
├── LICENSE                     # License file
├── README.md                   # Project readme
├── components.json             # shadcn/ui config
├── drizzle.config.ts           # Drizzle ORM config
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── playwright.config.ts        # Playwright config
├── postcss.config.js           # PostCSS config
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── vitest.config.ts            # Vitest configuration
```

---

## Source Directory (`/src`)

```
src/
├── actions/                    # Server actions
│   ├── auth.ts                 # Auth-related actions
│   ├── builds.ts               # Build CRUD actions
│   ├── engines.ts              # Engine actions
│   ├── parts.ts                # Part actions
│   └── admin/                  # Admin-only actions
│       ├── engines.ts
│       ├── parts.ts
│       └── users.ts
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/               # Public route group
│   │   ├── page.tsx            # Homepage
│   │   ├── engines/
│   │   │   ├── page.tsx        # Engine listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Engine detail
│   │   ├── parts/
│   │   │   ├── page.tsx        # Parts catalog
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Part detail
│   │   └── layout.tsx
│   ├── (builder)/              # Builder route group
│   │   ├── builder/
│   │   │   └── page.tsx        # Build configurator
│   │   ├── builds/
│   │   │   ├── page.tsx        # My builds
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Build detail
│   │   └── layout.tsx
│   ├── (content)/              # Content route group
│   │   ├── guides/
│   │   │   ├── page.tsx        # Guide listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Guide detail
│   │   └── layout.tsx
│   ├── admin/                  # Admin routes (no group)
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── engines/
│   │   │   ├── page.tsx        # Engine management
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── parts/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── rules/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                    # API routes (minimal use)
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   ├── error.tsx               # Error boundary
│   ├── loading.tsx             # Loading state
│   ├── not-found.tsx           # 404 page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/                 # React components
│   ├── ui/                     # Primitive UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── page-header.tsx
│   ├── engines/                # Engine-specific components
│   │   ├── engine-card.tsx
│   │   ├── engine-specs.tsx
│   │   └── engine-selector.tsx
│   ├── parts/                  # Parts-specific components
│   │   ├── part-card.tsx
│   │   ├── part-filters.tsx
│   │   ├── part-grid.tsx
│   │   └── compatibility-badge.tsx
│   ├── builder/                # Builder components
│   │   ├── build-configurator.tsx
│   │   ├── build-summary.tsx
│   │   ├── compatibility-check.tsx
│   │   └── part-slot.tsx
│   ├── admin/                  # Admin components
│   │   ├── data-table.tsx
│   │   ├── admin-nav.tsx
│   │   ├── stats-card.tsx
│   │   └── forms/
│   │       ├── engine-form.tsx
│   │       └── part-form.tsx
│   ├── content/                # Content components
│   │   ├── mdx-components.tsx
│   │   ├── guide-card.tsx
│   │   └── spec-table.tsx
│   └── shared/                 # Shared components
│       ├── search-input.tsx
│       ├── pagination.tsx
│       ├── empty-state.tsx
│       └── error-fallback.tsx
├── db/                         # Database layer
│   ├── index.ts                # DB client export
│   ├── schema/                 # Drizzle schemas
│   │   ├── index.ts            # Schema barrel export
│   │   ├── users.ts            # User/profile schema
│   │   ├── engines.ts          # Engine schema
│   │   ├── parts.ts            # Parts schema
│   │   ├── categories.ts       # Category schema
│   │   ├── builds.ts           # Build schema
│   │   ├── compatibility.ts    # Compatibility rules
│   │   └── content.ts          # Content metadata
│   ├── migrations/             # Generated migrations
│   ├── seed/                   # Seed data
│   │   ├── engines.ts
│   │   ├── parts.ts
│   │   └── rules.ts
│   └── queries/                # Reusable queries
│       ├── engines.ts
│       ├── parts.ts
│       └── builds.ts
├── hooks/                      # React hooks
│   ├── use-auth.ts             # Auth hook
│   ├── use-build.ts            # Build state hook
│   ├── use-compatibility.ts    # Compatibility hook
│   ├── use-debounce.ts         # Debounce utility
│   └── use-media-query.ts      # Responsive hook
├── lib/                        # Utility libraries
│   ├── auth/                   # Auth utilities
│   │   ├── client.ts           # Client-side auth
│   │   ├── server.ts           # Server-side auth
│   │   └── middleware.ts       # Auth middleware
│   ├── compatibility/          # Compatibility engine
│   │   ├── evaluator.ts        # Rule evaluator
│   │   ├── rules.ts            # Rule definitions
│   │   ├── types.ts            # Rule types
│   │   └── conflicts.ts        # Conflict detection
│   ├── validation/             # Zod schemas
│   │   ├── auth.ts             # Auth validation
│   │   ├── engines.ts          # Engine validation
│   │   ├── parts.ts            # Part validation
│   │   └── builds.ts           # Build validation
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── admin.ts            # Admin client
│   ├── utils.ts                # General utilities
│   ├── constants.ts            # App constants
│   └── errors.ts               # Error definitions
├── middleware.ts               # Next.js middleware
├── styles/                     # Additional styles
│   └── fonts.ts                # Font definitions
└── types/                      # TypeScript types
    ├── database.ts             # DB types (generated)
    ├── api.ts                  # API response types
    └── index.ts                # Common types
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| React Component | kebab-case.tsx | `engine-card.tsx` |
| Page | page.tsx in folder | `engines/[slug]/page.tsx` |
| Server Action | camelCase.ts | `engines.ts` |
| Hook | use-kebab-case.ts | `use-auth.ts` |
| Utility | kebab-case.ts | `utils.ts` |
| Type file | kebab-case.ts | `database.ts` |
| Schema | singular.ts | `engine.ts` → exports `engines` table |
| Test | \*.spec.ts or \*.test.ts | `auth.spec.ts` |
| MDX | kebab-case.mdx | `getting-started.mdx` |

### Exports

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `export function EngineCard()` |
| Hook | camelCase with `use` | `export function useAuth()` |
| Utility | camelCase | `export function formatDate()` |
| Constant | SCREAMING_SNAKE | `export const MAX_BUILD_PARTS = 20` |
| Type/Interface | PascalCase | `export type Engine = {...}` |
| Schema table | camelCase plural | `export const engines = pgTable(...)` |

### Folders

| Type | Convention | Example |
|------|------------|---------|
| Route group | (kebab-case) | `(public)`, `(auth)` |
| Dynamic route | [param] | `[slug]`, `[id]` |
| Feature folder | kebab-case | `compatibility/` |
| Component folder | kebab-case | `engine-card/` (if multi-file) |

---

## Import Conventions

### Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/db/*": ["./src/db/*"],
      "@/actions/*": ["./src/actions/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Import Order

```typescript
// 1. React/Next (framework)
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External packages
import { z } from 'zod'
import { eq } from 'drizzle-orm'

// 3. Internal aliases (alphabetical)
import { db } from '@/db'
import { engines } from '@/db/schema'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// 4. Relative imports (components in same feature)
import { EngineSpecs } from './engine-specs'

// 5. Types (last, with type keyword)
import type { Engine } from '@/types'
```

---

## Component Structure

### Standard Component Template

```typescript
// src/components/engines/engine-card.tsx

import { cn } from '@/lib/utils'
import type { Engine } from '@/types'

interface EngineCardProps {
  engine: Engine
  className?: string
  onClick?: () => void
}

export function EngineCard({ 
  engine, 
  className,
  onClick 
}: EngineCardProps) {
  return (
    <div 
      className={cn('...base styles...', className)}
      onClick={onClick}
    >
      {/* Component content */}
    </div>
  )
}
```

### Server Component (Default)

```typescript
// src/app/(public)/engines/page.tsx

import { db } from '@/db'
import { engines } from '@/db/schema'
import { EngineCard } from '@/components/engines/engine-card'

export default async function EnginesPage() {
  const allEngines = await db.select().from(engines)
  
  return (
    <div>
      {allEngines.map(engine => (
        <EngineCard key={engine.id} engine={engine} />
      ))}
    </div>
  )
}
```

### Client Component

```typescript
// src/components/builder/build-configurator.tsx
'use client'

import { useState } from 'react'
import { useBuild } from '@/hooks/use-build'

export function BuildConfigurator() {
  const [step, setStep] = useState(0)
  const { build, addPart } = useBuild()
  
  // ... client-side logic
}
```

---

## Git Conventions

### Branch Names

```
main                    # Production
staging                 # Staging environment
dev                     # Development integration

feature/atlas-123-desc  # Feature branches
fix/atlas-456-desc      # Bug fixes
chore/atlas-789-desc    # Maintenance
```

### Commit Messages

Follow Conventional Commits:

```
feat(engines): add predator 212 specifications
fix(auth): resolve session refresh loop
chore(deps): update drizzle-orm to 0.30.0
docs(readme): add setup instructions
test(builder): add compatibility E2E tests
refactor(db): extract shared query utilities
```

---

## Environment Variables

### Required Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (for migrations)
DATABASE_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Project Atlas"

# Optional
NEXT_PUBLIC_GA_ID=
SENTRY_DSN=
```

### Variable Naming

- `NEXT_PUBLIC_*` — Exposed to browser
- `SUPABASE_*` — Server-only Supabase keys
- `DATABASE_*` — Database connection
- No prefix — Server-only secrets

---

*Document Version: 1.0*  
*Last Updated: Day 0*  
*Owner: A0 (Architect)*
