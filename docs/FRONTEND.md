# GoKartPartPicker Frontend Documentation

This document describes the frontend architecture, routes, and components for the GoKartPartPicker application.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom theme tokens
- **State Management**: Zustand (for build state)
- **Data Fetching**: TanStack Query (React Query)
- **Database/Auth**: Supabase
- **Icons**: Lucide React

---

## Routes

### Public Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home page with hero, features, and CTAs |
| `/engines` | `app/engines/page.tsx` | Engine listing with filters and search |
| `/engines/[id]` | `app/engines/[id]/page.tsx` | Single engine detail page |
| `/parts` | `app/parts/page.tsx` | Parts listing with category tabs and filters |
| `/parts/[id]` | `app/parts/[id]/page.tsx` | Single part detail page |
| `/builder` | `app/builder/page.tsx` | Interactive build tool with compatibility checking |
| `/auth/login` | `app/auth/login/page.tsx` | Login page (password + magic link) |
| `/auth/register` | `app/auth/register/page.tsx` | Registration page |
| `/auth/callback` | `app/auth/callback/route.ts` | OAuth/magic link callback handler |

### Protected Routes (Auth Required)

| Route | File | Description |
|-------|------|-------------|
| `/builds` | `app/builds/page.tsx` | User's saved builds list |
| `/builds/[id]` | `app/builds/[id]/page.tsx` | Single build detail page |

---

## Components

### Layout Components

| Component | File | Description |
|-----------|------|-------------|
| `Header` | `components/layout/Header.tsx` | Main navigation with auth state |
| `Footer` | `components/layout/Footer.tsx` | Site footer with links |

### UI Components

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `Button` | `components/ui/Button.tsx` | `variant`, `size`, `loading`, `icon` | Primary button component |
| `Input` | `components/ui/Input.tsx` | `label`, `error`, `icon` | Form input field |
| `Select` | `components/ui/Select.tsx` | `label`, `error`, `options`, `placeholder` | Dropdown select |
| `Card` | `components/ui/Card.tsx` | `variant`, `hoverable` | Card container with header/content/footer |
| `Badge` | `components/ui/Badge.tsx` | `variant`, `size` | Status badges |
| `Skeleton` | `components/ui/Skeleton.tsx` | `className` | Loading skeleton components |

### Domain Components

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `EngineCard` | `components/EngineCard.tsx` | `engine`, `onAddToBuild`, `isSelected`, `showAddButton` | Engine product card |
| `PartCard` | `components/PartCard.tsx` | `part`, `onAddToBuild`, `isSelected`, `showAddButton`, `compact` | Part product card |
| `BuildCard` | `components/BuildCard.tsx` | `build`, `onDelete`, `onEdit`, `showActions` | Saved build card |
| `CompatibilityWarning` | `components/CompatibilityWarning.tsx` | `warning`, `onDismiss` | Single compatibility warning |
| `CompatibilityWarningList` | `components/CompatibilityWarning.tsx` | `warnings` | List of warnings with summary |

### Providers

| Component | File | Description |
|-----------|------|-------------|
| `QueryProvider` | `components/providers/QueryProvider.tsx` | TanStack Query provider |

---

## Hooks

### Data Fetching Hooks

All data hooks follow the contract defined in `db-query-contract.md`.

| Hook | File | Returns | Description |
|------|------|---------|-------------|
| `useEngines` | `hooks/use-engines.ts` | `Engine[]` | Fetch engines with filters |
| `useEngine` | `hooks/use-engines.ts` | `Engine` | Fetch single engine by ID |
| `useEngineBrands` | `hooks/use-engines.ts` | `string[]` | Fetch unique engine brands |
| `useParts` | `hooks/use-parts.ts` | `Part[]` | Fetch parts with filters |
| `usePart` | `hooks/use-parts.ts` | `Part` | Fetch single part by ID |
| `usePartsByCategory` | `hooks/use-parts.ts` | `Part[]` | Fetch parts by category |
| `usePartBrands` | `hooks/use-parts.ts` | `string[]` | Fetch unique part brands |
| `useUserBuilds` | `hooks/use-builds.ts` | `Build[]` | Fetch user's builds (auth) |
| `usePublicBuilds` | `hooks/use-builds.ts` | `Build[]` | Fetch public/community builds |
| `useBuild` | `hooks/use-builds.ts` | `Build` | Fetch single build by ID |
| `useCreateBuild` | `hooks/use-builds.ts` | Mutation | Create new build |
| `useUpdateBuild` | `hooks/use-builds.ts` | Mutation | Update existing build |
| `useDeleteBuild` | `hooks/use-builds.ts` | Mutation | Delete build |
| `useCompatibilityRules` | `hooks/use-compatibility.ts` | `CompatibilityRule[]` | Fetch compatibility rules |

### Auth Hooks

| Hook | File | Returns | Description |
|------|------|---------|-------------|
| `useAuth` | `hooks/use-auth.ts` | `{ user, session, loading, signIn, signUp, signOut, ... }` | Auth state and methods |
| `useRequireAuth` | `hooks/use-auth.ts` | `{ user, loading }` | Redirect if not authenticated |

### Utility Functions

| Function | File | Description |
|----------|------|-------------|
| `checkCompatibility` | `hooks/use-compatibility.ts` | Client-side compatibility checking |

---

## State Management

### Build Store (Zustand)

Location: `store/build-store.ts`

The build store manages the current build state during the builder experience.

```typescript
interface BuildState {
  selectedEngine: Engine | null;
  selectedParts: Map<PartCategory, Part>;
  warnings: CompatibilityWarning[];
  buildName: string;
  buildDescription: string;
  
  // Actions
  setEngine: (engine: Engine | null) => void;
  setPart: (category: PartCategory, part: Part | null) => void;
  removePart: (category: PartCategory) => void;
  clearBuild: () => void;
  setWarnings: (warnings: CompatibilityWarning[]) => void;
  
  // Computed
  getTotalPrice: () => number;
  getPartIds: () => BuildParts;
  hasIncompatibilities: () => boolean;
}
```

The store is persisted to localStorage to preserve builds across sessions.

---

## Types

Location: `types/database.ts`

Key types:

- `Engine` - Engine product type
- `Part` - Part product type
- `PartCategory` - Union of all part categories
- `Build` - Saved build type
- `Profile` - User profile type
- `CompatibilityWarning` - Compatibility issue type
- `CompatibilityRule` - Rule from database

---

## Design System

### Theme Tokens

Location: `app/globals.css`

The design system is based on the GoKartPartPicker logo with a vintage/industrial motorsport aesthetic.

**Colors:**

| Token | Value | Usage |
|-------|-------|-------|
| `--olive-900` | `#1a1e15` | Primary background |
| `--olive-800` | `#2d3226` | Secondary background |
| `--olive-700` | `#3d4233` | Card background |
| `--olive-600` | `#4d5340` | Borders |
| `--orange-500` | `#c96a24` | Primary accent |
| `--orange-400` | `#d4803c` | Accent hover |
| `--cream-100` | `#f5f0e6` | Primary text |
| `--cream-300` | `#d9cba8` | Secondary text |
| `--cream-400` | `#c4b58e` | Muted text |

**Status Colors:**

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#4a7c59` | Compatible/success |
| `--warning` | `#d4803c` | Warnings |
| `--error` | `#a63d40` | Errors/incompatible |
| `--info` | `#5a7d9a` | Information |

**Typography:**

| Variable | Font | Usage |
|----------|------|-------|
| `--font-display` | Bebas Neue | Headings, titles |
| `--font-body` | DM Sans | Body text |
| `--font-mono` | JetBrains Mono | Code/specs |

### CSS Utilities

- `.text-display` - Display/heading typography
- `.card` / `.card-accent` - Card styling
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-ghost` - Button variants
- `.input` - Form input styling
- `.badge-*` - Status badge variants
- `.compat-warning-*` - Compatibility warning banners
- `.skeleton` - Loading skeleton
- `.animate-fade-in` / `.animate-slide-in` - Animations
- `.stagger-children` - Staggered child animations
- `.racing-stripe` - Decorative racing stripe

---

## Compatibility Checking

The frontend implements client-side compatibility checking based on rules from the database.

### Checked Compatibility:

1. **Shaft Compatibility**
   - Engine shaft diameter ↔ Clutch bore
   - Engine shaft diameter ↔ Torque converter bore

2. **Chain Compatibility**
   - Chain pitch ↔ Sprocket pitch

3. **Wheel/Tire Compatibility**
   - Tire wheel diameter ↔ Wheel diameter

4. **Axle Compatibility**
   - Wheel bolt pattern ↔ Axle hub bolt pattern

### Warning Types:

- `error` - Incompatible parts, will not work together
- `warning` - May have issues, user should verify
- `info` - Informational, suggestions

---

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Running the Development Server

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## File Structure

```
frontend/
├── public/
│   └── logo.png
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── builds/
│   │   │   ├── [id]/page.tsx
│   │   │   └── page.tsx
│   │   ├── builder/page.tsx
│   │   ├── engines/
│   │   │   ├── [id]/page.tsx
│   │   │   └── page.tsx
│   │   ├── parts/
│   │   │   ├── [id]/page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── BuildCard.tsx
│   │   ├── CompatibilityWarning.tsx
│   │   ├── EngineCard.tsx
│   │   └── PartCard.tsx
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-builds.ts
│   │   ├── use-compatibility.ts
│   │   ├── use-engines.ts
│   │   └── use-parts.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   ├── store/
│   │   └── build-store.ts
│   ├── types/
│   │   └── database.ts
│   └── middleware.ts
├── package.json
└── tsconfig.json
```
