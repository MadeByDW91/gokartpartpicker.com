# Templates Page Fix Summary

## Issues Found

1. **Missing `approval_status` filter** - Templates query wasn't filtering by `approval_status = 'approved'`
2. **No templates in database** - Need to seed example templates

## Fixes Applied

### 1. Fixed Template Query (`frontend/src/actions/templates.ts`)
- Added `.eq('approval_status', 'approved')` filter
- Now only shows approved, public, active templates

### 2. Created Seed Templates Migration (`supabase/migrations/20260117000003_seed_build_templates.sql`)
- Created 9 example templates covering all goals:
  - **Beginner**: Predator 212 Hemi, Predator 79cc (kids)
  - **Budget**: Predator 212 Non-Hemi
  - **Speed**: Predator 212 Hemi, Predator 224
  - **Torque**: Predator 212 Hemi, Predator 301
  - **Competition**: Predator 212 Hemi, Predator 420

## Next Steps

1. **Run the migration** in Supabase Dashboard → SQL Editor:
   - Run `20260117000003_seed_build_templates.sql`

2. **Verify templates appear**:
   - Go to `/templates` page
   - Should see 9 templates displayed

3. **Test template application**:
   - Click "Apply to Builder" on a template
   - Should load engine and parts in builder

4. **Optional: Add parts to templates**:
   - Templates currently have empty `parts: {}`
   - Admins can edit templates through `/admin/templates` to add actual parts

## Template Structure

Each template includes:
- `name`: Display name
- `description`: What the build is for
- `goal`: Category (beginner, speed, torque, budget, competition, kids)
- `engine_id`: Reference to engine (looked up by slug)
- `parts`: JSONB object `{category: part_id}` (currently empty, can be populated)
- `total_price`: Estimated total cost
- `estimated_hp`: Estimated horsepower
- `estimated_torque`: Estimated torque
- `is_public`: true (visible to all)
- `is_active`: true (shown in gallery)
- `approval_status`: 'approved' (visible to users)
