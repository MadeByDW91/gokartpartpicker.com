# Compatibility Engine — Handoff Notes

> **From:** Compatibility & Rules Intelligence Agent  
> **To:** Frontend Team, DB Architect  
> **Date:** January 16, 2026

---

## Quick Links

- Full Design Doc: [`compatibility-engine-design.md`](./compatibility-engine-design.md)

---

# 🎨 FRONTEND TEAM HANDOFF

## What You're Building

A compatibility layer that:
1. Shows users why parts do/don't fit
2. Blocks dangerous combinations
3. Suggests required accessories
4. Displays risk levels clearly

## The API Contract

### Endpoint

```
POST /api/compatibility/check
```

### Request

```json
{
    "baseMachineId": "gkm-208",
    "installedParts": ["part-123", "part-456"],
    "targetPartId": "part-789",
    "userId": "user-abc"
}
```

### Response Shape

```typescript
interface CompatibilityPayload {
    // What to do
    verdict: 'HARD_BLOCK' | 'SOFT_BLOCK' | 'WARNING' | 'NOTICE' | 'COMPATIBLE' | 'RECOMMENDED' | 'REQUIRED';
    canAdd: boolean;
    canOverride: boolean;
    
    // What to show
    summary: string;      // Short, mobile-friendly
    rules: RuleResult[];  // Detailed breakdown
    suggestions: Suggestion[];
    
    // Risk info
    riskDelta: number;
    newRiskTier: 'STOCK' | 'MILD' | 'MODERATE' | 'AGGRESSIVE' | 'EXTREME' | 'EXPERIMENTAL';
}
```

## UI Requirements by Verdict

### 🔴 HARD_BLOCK
- **Cannot add to cart**
- Show red error state
- Display ALL blocking reasons (not just the first)
- Provide "View Compatible Alternatives" CTA
- Example message: *"This clutch won't fit your engine's shaft."*

```jsx
// Suggested component structure
<CompatibilityError 
    summary={payload.summary}
    reasons={payload.rules.filter(r => r.verdict === 'HARD_BLOCK')}
    alternativesLink={payload.suggestions[0]?.action?.endpoint}
/>
```

### 🟠 SOFT_BLOCK
- **Blocked by default, can override**
- Show warning modal on add attempt
- Require explicit checkbox acknowledgment
- Log the override (we send to backend)
- Example: *"This engine exceeds the frame's recommended power. Continue anyway?"*

```jsx
// Override flow
<ConfirmationModal>
    <WarningIcon />
    <p>{payload.summary}</p>
    <Checkbox 
        label="I understand the risks and want to proceed"
        onChange={setAcknowledged}
    />
    <Button 
        disabled={!acknowledged}
        onClick={() => addWithOverride(partId, payload.rules.map(r => r.ruleId))}
    >
        Add Anyway
    </Button>
</ConfirmationModal>
```

### 🟡 WARNING
- **Can add, but show caution**
- Yellow/amber inline warning
- Collapsible details
- Don't block the add action

### ⚪ NOTICE
- **Low-priority info**
- Gray info icon
- Tooltip or collapsible
- Don't clutter the UI

### 🟢 COMPATIBLE
- **All good!**
- Green checkmark or no indicator
- Clean add-to-cart experience

### 🟢 RECOMMENDED  
- **Extra good!**
- "Great Choice!" badge
- Maybe show why (from `rules[].message`)

### 🟣 REQUIRED
- **Must add something else**
- "You'll also need..." inline prompt
- One-click "Add Both" UX
- Prominent suggestion display

## Suggestion Actions

Every suggestion has a pre-built action:

```json
{
    "type": "ADD_PART",
    "priority": "REQUIRED",
    "message": "Add a kill switch to your build",
    "parts": [
        { "id": "ks-001", "name": "Tether Kill Switch", "price": 12.99 }
    ],
    "action": {
        "label": "Add Kill Switch",
        "endpoint": "/api/cart/add?partId=ks-001"
    }
}
```

You can call `action.endpoint` directly or use the part IDs for custom handling.

## Risk Tier Display

Show the build's current risk tier and how it changes:

| Tier | Name | Color | Icon Suggestion |
|------|------|-------|-----------------|
| 0 | Stock | Gray | 🔧 Wrench |
| 1 | Mild | Green | 🌱 Seedling |
| 2 | Moderate | Blue | ⚡ Bolt |
| 3 | Aggressive | Orange | 🔥 Fire |
| 4 | Extreme | Red | 💀 Skull |
| 5 | Experimental | Purple | 🧪 Flask |

Show delta: *"Adding this part increases your build risk from Mild → Moderate"*

## Mobile Considerations

- Use `summary` for compact views (always <100 chars)
- Use full `message` in modals/expanded views
- Suggestions have touch-friendly `action` objects
- Risk tier icons work well as compact indicators

## Loading States

The API should respond in <200ms. Show:
- Skeleton loader on part cards while checking
- Or optimistically show "Checking compatibility..." badge

## Error Handling

If API fails:
```json
{
    "error": "EVALUATION_FAILED",
    "fallback": {
        "verdict": "WARNING",
        "canAdd": true,
        "summary": "Couldn't verify compatibility. Proceed with caution."
    }
}
```
Use the fallback payload to keep the UI functional.

---

# 🗄️ DB ARCHITECT HANDOFF

## What the Engine Needs

The compatibility engine requires these data structures. Finalize schema as you see fit — these are requirements, not prescriptions.

## Core Data Requirements

### 1. Parts Must Have Dimensions

Every part needs measurable attributes stored in a queryable format.

**Required Dimension Fields by Category:**

| Category | Required Dimensions |
|----------|---------------------|
| Engine | `shaft_diameter`, `horsepower`, `cc`, `mount_pattern` |
| Clutch | `bore`, `engagement_rpm`, `max_hp`, `chain_pitch` |
| Torque Converter | `bore`, `belt_width`, `ratio_range` |
| Sprocket | `bore`, `teeth`, `chain_pitch` |
| Chain | `pitch`, `links`, `tensile_strength` |
| Axle | `diameter`, `length`, `keyway` |
| Wheels | `bolt_pattern`, `rim_width`, `diameter` |
| Brakes | `type`, `mount_style`, `rotor_size` |

**Suggested Storage:**
```sql
-- Option A: JSONB column
ALTER TABLE parts ADD COLUMN dimensions JSONB;

-- Example data
{
    "bore": { "value": 1.0, "unit": "in" },
    "max_hp": { "value": 6.5, "unit": "hp" },
    "chain_pitch": { "value": 35, "unit": "chain_size" }
}

-- Option B: Dedicated columns (faster queries, less flexible)
ALTER TABLE parts ADD COLUMN bore_inches DECIMAL(4,3);
ALTER TABLE parts ADD COLUMN max_hp DECIMAL(4,1);
ALTER TABLE parts ADD COLUMN chain_pitch INT;
```

**My Recommendation:** JSONB with extracted computed columns for the 5-6 most queried dimensions.

### 2. Parts Need Risk Tiers

```sql
ALTER TABLE parts ADD COLUMN risk_tier INT DEFAULT 0 CHECK (risk_tier BETWEEN 0 AND 5);

-- 0: Stock (OEM replacement)
-- 1: Mild
-- 2: Moderate
-- 3: Aggressive
-- 4: Extreme
-- 5: Experimental
```

### 3. Direct Compatibility Relationships

For known-good and known-bad pairs:

```sql
CREATE TABLE part_compatibility (
    id SERIAL PRIMARY KEY,
    part_a_id INT REFERENCES parts(id),
    part_b_id INT REFERENCES parts(id),
    relationship VARCHAR(20) NOT NULL,  -- 'compatible', 'requires', 'excludes'
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(part_a_id, part_b_id)
);

-- Index for fast lookups
CREATE INDEX idx_compat_lookup ON part_compatibility (part_a_id, relationship);
CREATE INDEX idx_compat_reverse ON part_compatibility (part_b_id, relationship);
```

### 4. Base Machines (Chassis/Karts)

```sql
CREATE TABLE base_machines (
    id VARCHAR(50) PRIMARY KEY,  -- e.g., "yerf-dog-3203"
    make VARCHAR(100),
    model VARCHAR(100),
    year_start INT,
    year_end INT,  -- NULL = current production
    specs JSONB,  -- axle_diameter, wheelbase, engine_mount, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example specs JSONB:
{
    "axle_diameter": 1.0,
    "wheelbase": 58,
    "engine_mount": "4-bolt-standard",
    "brake_mount": "band-brake",
    "max_recommended_hp": 10
}
```

### 5. Rules Storage (Optional)

If you want admin-editable rules:

```sql
CREATE TABLE compatibility_rules (
    id SERIAL PRIMARY KEY,
    rule_code VARCHAR(10) UNIQUE NOT NULL,  -- "P001", "S002"
    rule_type CHAR(1) NOT NULL,  -- P/M/S/D/X/A
    name VARCHAR(100),
    source_category VARCHAR(50),
    target_category VARCHAR(50),
    condition JSONB NOT NULL,  -- Evaluation logic
    verdict_type VARCHAR(20),
    message_template TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example condition JSONB:
{
    "type": "DIMENSION_MATCH",
    "source_dimension": "shaft_diameter",
    "target_dimension": "bore",
    "on_mismatch": "HARD_BLOCK"
}
```

### 6. Override Audit Log

For liability protection when users override soft blocks:

```sql
CREATE TABLE user_overrides (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    build_id UUID,
    part_id INT REFERENCES parts(id),
    overridden_rules VARCHAR(10)[],  -- ["S001", "M002"]
    acknowledgement TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Partition by month for performance
CREATE INDEX idx_overrides_user ON user_overrides (user_id, created_at DESC);
```

## Performance Requirements

### Expected Query Patterns

1. **Lookup part dimensions by ID** — Per-request, needs <10ms
2. **Find all parts compatible with X** — Catalog filtering, needs <100ms
3. **Check if part A fits with parts B,C,D** — Cart evaluation, needs <50ms

### Recommended Indexes

```sql
-- JSONB dimension queries
CREATE INDEX idx_parts_dimensions ON parts USING GIN (dimensions);

-- Common dimension extractions (if using computed columns)
CREATE INDEX idx_parts_bore ON parts ((dimensions->>'bore')::numeric) WHERE dimensions->>'bore' IS NOT NULL;
CREATE INDEX idx_parts_chain_pitch ON parts ((dimensions->>'chain_pitch')::int) WHERE dimensions->>'chain_pitch' IS NOT NULL;

-- Category + dimension combos
CREATE INDEX idx_parts_cat_dims ON parts (category) INCLUDE (dimensions);

-- Compatibility matrix lookups
CREATE INDEX idx_compat_full ON part_compatibility (part_a_id, part_b_id, relationship);
```

## Open Questions

1. **JSONB vs Normalized for Dimensions?**
   - JSONB: Flexible, easy to extend, good for varied attributes
   - Normalized: Faster queries, enforced types, harder to extend
   - **Suggestion:** JSONB with extracted materialized columns for hot paths

2. **Caching Strategy?**
   - Option A: Materialized view of all compatible pairs (heavy, complete)
   - Option B: Redis cache per-query (light, eventual consistency)
   - Option C: Client-side cache with 24hr TTL (simplest)
   - **Suggestion:** Start with Option C, add Redis if needed

3. **Rule Storage Location?**
   - All in DB: Admin can edit, versioning complex
   - All in code: Version controlled, deploy to update
   - **Suggestion:** Hybrid — base rules in code, overrides/additions in DB

## Migration Checklist

Before compatibility engine can launch:

- [ ] `parts.dimensions` JSONB column exists
- [ ] `parts.risk_tier` column exists
- [ ] `base_machines` table created and populated
- [ ] `part_compatibility` table created
- [ ] Key dimensions indexed
- [ ] `user_overrides` table created (for soft block tracking)
- [ ] Sample data for testing (at least 1 engine, 1 clutch, 1 sprocket)

---

# 📋 SHARED CHECKLIST

## Before Integration

- [ ] Design doc reviewed by both teams
- [ ] API contract agreed upon
- [ ] Error payload format confirmed
- [ ] Risk tier colors/icons finalized

## Testing Scenarios to Cover

1. **Basic fit** — Clutch bore matches engine shaft
2. **Dimension mismatch** — Wrong bore size → HARD_BLOCK
3. **Exclusion** — Clutch + Torque Converter → HARD_BLOCK
4. **Dependency** — Disc caliper without rotor → REQUIRED
5. **Safety warning** — High HP without kill switch → WARNING
6. **Soft block override** — User acknowledges risk → Logged
7. **Unknown part** — No compatibility data → WARNING fallback
8. **Multiple issues** — Part has 3 problems → Show all

## Questions?

Ping me (Compatibility Agent) for:
- Rule logic clarification
- Edge case handling
- Payload structure changes
- New rule type requests

---

*End of handoff notes*
