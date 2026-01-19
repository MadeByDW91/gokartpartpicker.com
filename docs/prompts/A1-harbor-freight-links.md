# A1: Add Harbor Freight Links to Engines

**Agent:** A1 (Database) or A5 (Admin)  
**Status:** ⏳ Ready

---

```markdown
You are Agent A1: Database (or A5: Admin).

Engines need direct links to Harbor Freight product pages. The database
already has an `affiliate_url` field, but we need to populate it with
Harbor Freight links and ensure they're displayed prominently.

TASK: Add Harbor Freight Links to Engines

## Context

The user provided these example links:
- Predator 212 (6.5 HP): https://www.harborfreight.com/65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html
- 13 HP 420cc: https://www.harborfreight.com/13-hp-420cc-ohv-horizontal-shaft-gas-engine-epa-60340.html
- 22 HP 670cc V-Twin: https://www.harborfreight.com/22-hp-670cc-v-twin-horizontal-shaft-gas-engine-epa-61614.html

**Important:** These are NOT affiliate links - they are direct links to Harbor Freight.
This is per the pricing policy: engine costs use Harbor Freight prices and are NOT affiliate links.

## Files to Update

### 1. Database Migration - Add Harbor Freight Links
**File:** `supabase/migrations/20260116000007_add_harbor_freight_links.sql` ✅ **ALREADY CREATED**

**Migration exists and includes:**
- Predator 212 (6.5 HP) → Harbor Freight link
- Predator 420 (13 HP) → Harbor Freight link  
- Predator 670 V-Twin (22 HP) → Harbor Freight link

**Action:** Apply this migration to the database if not already applied.

### 2. Engine Detail Page - Display Harbor Freight Link
**File:** `src/app/engines/[slug]/page.tsx`

**Update to:**
- Display Harbor Freight link prominently if `engine.affiliate_url` exists
- Use a clear "Buy on Harbor Freight" button/link
- Open in new tab (`target="_blank" rel="noopener noreferrer"`)
- Use ExternalLink icon

**Update existing button (around line 259-275):**
- Change button text from "Buy Now" to "Buy on Harbor Freight"
- Keep the existing button styling and ExternalLink icon
- Optionally add a small helper text below: "Direct link to Harbor Freight"

**Current code shows:**
```tsx
{engine.affiliate_url && (
  <a href={engine.affiliate_url} target="_blank" rel="noopener noreferrer">
    <Button variant="secondary" size="lg" icon={<ExternalLink />}>
      Buy Now  {/* ← Change this to "Buy on Harbor Freight" */}
    </Button>
  </a>
)}
```

### 3. EngineCard Component - Add Harbor Freight Link
**File:** `src/components/EngineCard.tsx`

**Update to:**
- Show a small "View on Harbor Freight" link if `engine.affiliate_url` exists
- Place it near the price or in the card footer
- Use subtle styling (not as prominent as detail page)

### 4. Admin Engine Form - Harbor Freight Link Field
**Files:** 
- `src/components/admin/EngineForm.tsx` (if exists)
- `src/app/admin/engines/[id]/page.tsx`

**Ensure:**
- `affiliate_url` field is labeled as "Harbor Freight Link" or "Product Link"
- Help text: "Direct link to Harbor Freight product page (not an affiliate link)"
- Field accepts full Harbor Freight URLs

### 5. TypeScript Types (if needed)
**File:** `src/types/database.ts`

**Verify:**
- `Engine` interface already has `affiliate_url: string | null` ✅ (should already exist)

## Implementation Notes

### Harbor Freight URL Pattern
Harbor Freight URLs follow this pattern:
- `https://www.harborfreight.com/{description}-epa-{number}.html`
- Example: `65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html`

### Matching Engines to URLs
Use a combination of:
- Engine name (contains "Predator", "212", etc.)
- Displacement (cc)
- Horsepower (HP)
- Brand (Harbor Freight / Predator)

### Display Guidelines
- **Detail Page:** Prominent button, clear call-to-action
- **Card View:** Subtle link, doesn't dominate the card
- **Always:** Open in new tab, use ExternalLink icon
- **Label:** "Buy on Harbor Freight" or "View on Harbor Freight"

## Success Criteria

- [ ] Migration adds Harbor Freight links to known engines
- [ ] Engine detail page shows prominent "Buy on Harbor Freight" button
- [ ] EngineCard shows Harbor Freight link (if URL exists)
- [ ] Admin can edit Harbor Freight links
- [ ] Links open in new tab with proper security attributes
- [ ] All links are direct (not affiliate) as per pricing policy

## DO NOT

- Do NOT make these affiliate links (per pricing policy)
- Do NOT overwrite existing affiliate_url values without checking
- Do NOT break existing functionality
- Do NOT forget `rel="noopener noreferrer"` on external links
```
