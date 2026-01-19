# Agent Prompts Queue

> **A0 (Orchestrator) Output**  
> Copy these prompts to the appropriate agents

---

## ✅ Completed Prompts

### Phase 1: Core Data & Admin
- [x] A4: Server Actions (completed)
- [x] A5: Admin Parts CRUD (completed)

### Phase 2: Public Pages
- [x] A3: Engine Detail Pages (completed)
- [x] A6: Compatibility Engine (completed)
- [x] A5/A7: Seed Parts Data (completed)
- [x] A3: Parts List & Detail Pages (in progress)

---

## 📋 Active Prompts

### Prompt 1: A1/A5 — Update Engine Prices from Harbor Freight

**Copy to `A1: Database` or `A5: Admin` agent:**

```markdown
You are Agent A1: Database (or A5: Admin).

═══════════════════════════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════════════════════════

Engines currently don't have prices set. We need to add Harbor Freight
prices for all Predator engines. These are NOT affiliate links - just
direct prices from harborfreight.com.

See: docs/PRICING-POLICY.md for business rules.

═══════════════════════════════════════════════════════════════
TASK: Update Engine Prices from Harbor Freight
═══════════════════════════════════════════════════════════════

## Option A: SQL Migration (Recommended)

Create: `supabase/migrations/20260116000007_update_engine_prices.sql`

Update all Predator engines with current Harbor Freight prices:

1. **Predator 79cc** — Check harborfreight.com for current price
2. **Predator 212 Non-Hemi** — Check harborfreight.com for current price
3. **Predator 212 Hemi** — Check harborfreight.com for current price
4. **Predator Ghost 212** — Check harborfreight.com for current price
5. **Predator 224** — Check harborfreight.com for current price
6. **Predator 301** — Check harborfreight.com for current price
7. **Predator 420** — Check harborfreight.com for current price
8. **Predator 670** — Check harborfreight.com for current price

## Option B: Admin Interface

Update prices via admin interface at `/admin/engines/[id]`

## Price Source

Go to harborfreight.com and search for each engine:
- Search: "Predator 212cc"
- Search: "Predator 224cc"
- Search: "Predator 420cc"
- etc.

Get the current listed price (not sale price, unless it's permanent).

## SQL Template

```sql
-- Update Predator 212 Hemi price
UPDATE engines 
SET price = 149.99  -- Replace with actual Harbor Freight price
WHERE slug = 'predator-212-hemi';

-- Update Predator 224 price
UPDATE engines 
SET price = 179.99  -- Replace with actual Harbor Freight price
WHERE slug = 'predator-224';

-- Continue for all Predator engines...
```

## Affiliate URL (Optional)

You can optionally set `affiliate_url` to the direct Harbor Freight product page,
but this should NOT be an affiliate link - just a direct link for user convenience.

Example:
```sql
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/212cc-predator-hemi-engine-69730.html'
WHERE slug = 'predator-212-hemi';
```

## Success Criteria

- [ ] All Predator engines have prices
- [ ] Prices match Harbor Freight website
- [ ] Prices are in USD (DECIMAL format)
- [ ] Optional: affiliate_url set to direct Harbor Freight links (non-affiliate)
- [ ] Prices display correctly in UI

## DO NOT

- Do NOT use affiliate links for engines
- Do NOT guess prices - verify from Harbor Freight website
- Do NOT modify non-Predator engines (Honda, Briggs) unless you have source
```

---

## 📋 PROMPT 2: A3 — Parts List & Detail Pages

*(Already in NEXT-PROMPT.md - copy from there)*

---

## 📋 PROMPT 3: A3 — Builder UI

*(Ready in PROMPT-LIBRARY.md)*

---

*Last Updated: 2026-01-16*  
*Owner: A0 (Orchestrator)*
