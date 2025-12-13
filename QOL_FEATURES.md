# QOL Features Implementation

## Repo Assessment Summary

### Framework & Architecture
- **Next.js**: 14.2.5 with App Router
- **Styling**: Tailwind CSS with custom brand tokens (`garage-orange`, `garage-cream`, `garage-dark`, etc.)
- **State Management**: Zustand (`lib/buildStore.ts`) with localStorage persistence
- **Database**: Prisma + PostgreSQL
- **Auth**: NextAuth.js v5 (Auth.js) - Credentials provider

### Current State
- ✅ Build store exists with localStorage persistence (`lib/buildStore.ts`)
- ✅ Search API exists (`/api/search`) - basic text search
- ✅ Build page exists (`/app/build/page.tsx`) with warnings
- ✅ Saved builds exist but require authentication
- ✅ Empty states exist but could be improved

### Build State Location
- **Store**: `lib/buildStore.ts` (Zustand)
- **Storage Key**: `gokart-build-storage` (localStorage)
- **Current Schema**: `{ engine: Engine | null, parts: PartWithOffer[] }`
- **No versioning**: Current implementation lacks schema versioning

---

## Implementation Plan

### Phase 1: Core QOL Features

#### 1.1 Persistent State Enhancement
- ✅ Already exists! Just needs:
  - Schema versioning for future compatibility
  - Reset confirmation dialog
  - Scroll position preservation

#### 1.2 Local Build Storage (No Accounts)
- Create `lib/localBuildStore.ts` for named builds
- Storage key: `gokart-local-builds`
- CRUD operations: create, rename, duplicate, delete
- "Last opened build" tracking

#### 1.3 Shareable Build Links
- Create `lib/buildEncoder.ts` for URL encoding/decoding
- Format: `/build?b=<base64url-encoded-json>`
- Include version field for backward compatibility
- Auto-load on page visit

#### 1.4 Skeleton Loading
- Create `components/Skeleton.tsx` reusable component
- Add `app/build/loading.tsx` for build page
- Replace spinners with skeletons

#### 1.5 Improved Empty States
- Enhance empty states with guidance
- Add primary action buttons
- Show compatible alternatives

---

## Build Schema

### Current Build State (localStorage)
```typescript
{
  engine: Engine | null
  parts: PartWithOffer[]
}
```

### Enhanced Build State (with versioning)
```typescript
{
  version: 1
  engine: Engine | null
  parts: PartWithOffer[]
  lastModified: number // timestamp
}
```

### Local Build Storage Schema
```typescript
{
  builds: Array<{
    id: string // cuid
    name: string
    createdAt: number
    lastOpened: number
    data: BuildState
  }>
  lastOpenedBuildId: string | null
}
```

### Shareable Build Link Format
```typescript
{
  v: 1 // version
  e: string | null // engine slug
  p: string[] // part slugs
  o?: Record<string, string> // partId -> vendorOfferId mapping
}
```

Encoded as base64url JSON in URL: `/build?b=<encoded>`

---

## File Structure Changes

### New Files
- `lib/buildEncoder.ts` - URL encoding/decoding
- `lib/localBuildStore.ts` - Local named builds storage
- `components/Skeleton.tsx` - Reusable skeleton component
- `components/LocalBuildsModal.tsx` - Build management UI
- `components/ShareBuildButton.tsx` - Share functionality
- `app/build/loading.tsx` - Build page skeleton

### Modified Files
- `lib/buildStore.ts` - Add versioning, reset confirmation
- `app/build/page.tsx` - Add share button, local builds, empty states
- `components/SaveBuildButton.tsx` - Integrate with local builds

---

## Compatibility Rules Structure

Future Phase 2 feature - structure defined here for reference:

```typescript
interface CompatibilityRule {
  id: string
  type: 'requires' | 'conflicts' | 'recommends' | 'warns'
  severity: 'info' | 'warn' | 'danger'
  condition: {
    partIds?: string[]
    categories?: string[]
    engineIds?: string[]
  }
  message: string
  action?: {
    type: 'add_part' | 'remove_part' | 'show_guide'
    data: any
  }
}
```

---

## URL Encoding Format

### Build Link Structure
```
/build?b=<base64url-json>
```

### Example
```json
{
  "v": 1,
  "e": "predator-212-hemi",
  "p": ["stage-1-air-filter", "mikuni-vm22"],
  "o": {
    "part-id-1": "offer-id-1"
  }
}
```

Encoded: `eyJ2IjoxLCJlIjoicHJlZGF0b3ItMjEyLWhlbWkiLCJwIjpbInN0YWdlLTEtYWlyLWZpbHRlciIsIm1pa3VuaS12bTIyIl19`

Full URL: `/build?b=eyJ2IjoxLCJlIjoicHJlZGF0b3ItMjEyLWhlbWkiLCJwIjpbInN0YWdlLTEtYWlyLWZpbHRlciIsIm1pa3VuaS12bTIyIl19`

---

## Persistence Strategy

### Current Build (Active)
- **Storage**: `localStorage['gokart-build-storage']`
- **Format**: JSON with version field
- **Auto-save**: On every state change
- **Auto-load**: On app initialization

### Local Named Builds
- **Storage**: `localStorage['gokart-local-builds']`
- **Format**: JSON array with metadata
- **Max builds**: No limit (can add limit later)
- **Last opened**: Tracked per build

### Shareable Links
- **Storage**: URL query params
- **Format**: Base64url-encoded JSON
- **Persistence**: Browser history
- **Auto-load**: On page visit with `?b=` param

---

## Phase 2 Features (✅ Implemented)

1. ✅ **Dark Mode Toggle**
   - Toggle button in bottom-right corner
   - Supports light/dark/system preference
   - Persists in localStorage
   - System preference detection with auto-update

2. ✅ **Smart Search (Fuse.js)**
   - Typo-tolerant search (threshold: 0.4)
   - Keyboard shortcut: `/` to open
   - ESC to close
   - Searches engines, parts, guides
   - Real-time results as you type

3. ✅ **Compatibility Warnings Panel**
   - Data-driven rules system
   - Severity levels: info/warn/danger
   - Shows on build page
   - Easy to extend with new rules

4. ✅ **"Why this part?" Tooltips**
   - Hover on part names to see tooltip
   - Shows: what it does, when needed, dependencies
   - Appears on parts list and build page

5. ✅ **Auto-Generated Install Checklist**
   - Groups parts by category
   - Checkboxes for tracking progress
   - Copy to clipboard
   - Print-friendly CSS

6. ✅ **Advanced Filters**
   - Min/Max HP gain
   - Min RPM delta
   - Max budget
   - Beginner-safe toggle
   - Active filter chips
   - Reset filters button

7. ✅ **Unit Conversion Tooltips**
   - Hover on torque specs (ft-lb ↔ Nm)
   - Hover on measurements (mm ↔ in)
   - Hover on weights (oz ↔ g)
   - Appears on engine torque spec tables

---

## Implementation Notes

### Dark Mode
- Uses Tailwind's `dark:` variant
- Theme preference stored in `localStorage['gokart-theme-preference']`
- System preference listener for auto mode

### Smart Search
- Fuse.js index built on client-side
- Loads all engines/parts/guides on mount
- Threshold 0.4 = ~60% character match tolerance

### Compatibility Rules
- Rules defined in `CompatibilityWarnings.tsx`
- Easy to add new rules by extending the array
- Rules check part categories, IDs, or engine IDs

### Advanced Filters
- Note: Server-side filtering for HP/RPM/budget not yet implemented
- Filters are in UI and URL params ready
- Would need API route enhancement for full functionality

### Unit Conversion
- Parses numeric values from spec strings
- Falls back to original text if parsing fails
- Tooltip appears on hover

