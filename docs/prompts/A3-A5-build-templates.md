# A3 + A5: Build Templates / Presets

You are Agent A3 (UI) and A5 (Admin).

Users want quick-start builds for common use cases. Build a template system where admins can create preset builds and users can apply them.

TASK: Build Templates / Presets System

## Features to Implement

### For Users (A3):
1. **Template Gallery**
   - Browse preset builds by goal/use case
   - Categories: Budget Racer, Speed Demon, Beginner Build, etc.
   - Preview template (parts list, cost, performance)

2. **Apply Template**
   - One-click apply template to builder
   - Customize template before saving
   - Start with template as base

### For Admins (A5):
1. **Template Management**
   - Create/edit/delete templates
   - Set template name, description, goal
   - Select engine + parts for template
   - Mark templates as public or private

2. **Template Categories**
   - Budget builds
   - Performance builds
   - Beginner builds
   - Competition builds
   - Custom categories

## Files to Create/Modify

### A3 (UI):
1. **Page**: `src/app/templates/page.tsx`
   - Template gallery
   - Filter by goal/category
   - Template cards with preview

2. **Component**: `src/components/templates/TemplateCard.tsx`
   - Template preview card
   - Shows: name, description, goal, cost, parts count
   - "Apply to Builder" button

3. **Component**: `src/components/templates/TemplatePreview.tsx`
   - Detailed template preview modal
   - Full parts list
   - Performance estimates
   - Cost breakdown

4. **Integration**: Update `src/app/builder/page.tsx`
   - Add "Start from Template" button
   - Load template into builder state

### A5 (Admin):
1. **Page**: `src/app/admin/templates/page.tsx`
   - List all templates
   - Create/edit/delete templates
   - Template management interface

2. **Page**: `src/app/admin/templates/new/page.tsx`
   - Create new template
   - Template form (name, description, goal)
   - Engine + parts selector

3. **Page**: `src/app/admin/templates/[id]/page.tsx`
   - Edit existing template
   - Same form as create

4. **Server Actions**: `src/actions/templates.ts`
   - `getTemplates(goal?: string)` → Template[]
   - `getTemplate(id)` → Template
   - `createTemplate(data)` → Template (admin only)
   - `updateTemplate(id, data)` → Template (admin only)
   - `deleteTemplate(id)` → void (admin only)

5. **Server Actions**: `src/actions/builds.ts` (update)
   - `createBuildFromTemplate(templateId, userId)` → Build
   - Load template into builder state

## Database Schema

### Migration: `supabase/migrations/XXXXXX_add_build_templates.sql`

```sql
CREATE TABLE build_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT, -- 'speed', 'torque', 'budget', 'beginner', 'competition'
  engine_id UUID REFERENCES engines(id),
  parts JSONB NOT NULL, -- {category: part_id}
  total_price DECIMAL(10,2),
  estimated_hp DECIMAL(4,1),
  estimated_torque DECIMAL(4,1),
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_templates_goal ON build_templates(goal);
CREATE INDEX idx_templates_public ON build_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_active ON build_templates(is_active) WHERE is_active = true;
```

## Template Goals

- `speed` - Maximum speed, high-RPM parts
- `torque` - Low-end power, torque-focused
- `budget` - Best value, under $X
- `beginner` - Simple, reliable, easy
- `competition` - Full performance build
- `kids` - Safe, governed, reliable

## Success Criteria

### For Users:
- [ ] Template gallery displays all public templates
- [ ] Filter by goal works
- [ ] Template preview shows parts/cost
- [ ] "Apply to Builder" loads template into builder
- [ ] Can customize template before saving
- [ ] Mobile responsive

### For Admins:
- [ ] Template CRUD interface works
- [ ] Create template with engine + parts
- [ ] Edit/delete templates
- [ ] Mark templates as public/private
- [ ] Templates appear in gallery if public

## Integration Points

- Link from homepage ("Browse Templates")
- Link from builder ("Start from Template")
- Link from admin ("Manage Templates")
- Template cards link to builder with template pre-loaded

## Example Templates

### Budget Racer
- Goal: Budget
- Engine: Predator 212
- Parts: Basic clutch, chain, sprockets
- Cost: ~$350
- Description: "Affordable entry-level racer"

### Speed Demon
- Goal: Speed
- Engine: Predator 212
- Parts: Performance air filter, exhaust, carb
- Cost: ~$600
- Description: "Maximum speed build"

### Beginner Build
- Goal: Beginner
- Engine: Predator 212
- Parts: Basic parts, safety equipment
- Cost: ~$400
- Description: "Simple, reliable first build"

DO NOT modify existing builder functionality - only add templates.

Reference: `docs/VALUE-ADD-FEATURES-PLAN.md`

<!-- Agent: A3 (UI) + A5 (Admin) | Status: ⏳ Ready | File: docs/prompts/A3-A5-build-templates.md -->
