# A5/A7: Seed Parts Data

**Agent:** A5 (Admin) or A7 (Ingestion)  
**Status:** ✅ Complete

---

```markdown
You are Agent A5: Admin (or A7: Ingestion).

A3 is building parts pages and needs sample data to test with.
The parts table is currently empty. We need 10-15 realistic parts.

TASK: Create Sample Parts Data

Option A: SQL Seed File (Recommended)
Create: `supabase/migrations/20260116000006_seed_parts.sql`

Include 10-15 parts covering:
- Clutch (2-3 parts: MaxTorque, Hilliard)
- Torque Converter (1-2 parts: Comet 30/40)
- Chain (2-3 parts: #35, #40, #420)
- Sprocket (2-3 parts: various tooth counts)
- Brake (1-2 parts: disc, drum)

Each part needs:
- slug (URL-friendly, e.g., "maxtorque-clutch-3-4")
- name (full product name)
- category (enum value: 'clutch', 'torque_converter', etc.)
- category_id (UUID from part_categories - lookup first!)
- brand (manufacturer name)
- specifications (JSONB with category-specific specs)
- price (realistic USD)
- is_active (true)

Example parts:
1. MaxTorque Clutch 3/4" — $49.99
   - Specs: {"shaft_diameter": "0.75", "engagement_rpm": 1800, "chain_pitch": "#35"}
2. Comet 30 Series Torque Converter — $199.99
   - Specs: {"shaft_diameter": "0.75", "driver_pulley": "6", "driven_pulley": "7"}
3. #35 Chain 10ft — $24.99
   - Specs: {"pitch": "#35", "length_ft": 10, "links": 120}

IMPORTANT: First, get category IDs:
```sql
SELECT id, slug, name FROM part_categories 
WHERE slug IN ('clutch', 'torque_converter', 'chain', 'sprocket', 'brake')
ORDER BY slug;
```

Then use those UUIDs in your INSERT statements.

Success Criteria:
- 10-15 parts created
- All major categories represented
- Realistic prices and specs
- Parts visible in admin (`/admin/parts`)
- Parts queryable via `getParts()` action
- No duplicate slugs

DO NOT modify database schema or use placeholder images.
```
