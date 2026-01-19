# Engine Clones/Compatibility System

## Overview

This system allows you to link engines that are clones or compatible with each other. Many small engines are clones of Honda GX series engines (e.g., Predator 212 is a clone of Honda GX200) and share the same parts compatibility.

## Features

### User-Facing
- **Engine Detail Pages** show compatible/clone engines
- Users can see which other engines accept the same parts
- Helps users find alternative engines for their builds

### Admin Features
- **Manage Clone Relationships** at `/admin/engines/[id]/clones`
- Add clone engines with relationship types:
  - **Clone**: Exact clone, same parts fit
  - **Compatible**: Same parts fit
  - **Similar**: Mostly compatible
- Bidirectional relationships (optional)
- Notes field for additional information

## Database Schema

### `engine_clones` Table
- `engine_id` - The main engine
- `clone_engine_id` - The clone/compatible engine
- `relationship_type` - 'clone', 'compatible', or 'similar'
- `notes` - Optional notes about the relationship
- `is_active` - Enable/disable relationships

## Common Clone Relationships

### Predator Engines
- **Predator 212** ↔ **Honda GX200** (clone)
- **Predator 79cc** ↔ **Honda GX100** (clone)
- **Predator 224** ↔ **Honda GX200** (compatible - larger displacement)

### Other Clones
- Many Chinese engines are clones of Honda GX series
- Briggs & Stratton engines may have clones
- Tillotson engines may be compatible with Honda variants

## How to Use

### Adding Clone Relationships (Admin)

1. **Navigate to:** Admin → Engines → [Select Engine] → Edit
2. **Click:** "Manage Clone Engines" button
3. **Add Clone:**
   - Select the clone engine from dropdown
   - Choose relationship type (clone/compatible/similar)
   - Add optional notes
   - Choose bidirectional (creates both directions)
   - Click "Add Clone"

### Viewing Clone Engines (Users)

1. **Go to:** Any engine detail page (e.g., `/engines/predator-212-hemi`)
2. **See:** "Compatible Engines" section showing all clone engines
3. **Click:** Any clone engine to view its details

## Benefits

1. **User Education**: Users learn which engines are compatible
2. **Part Compatibility**: Shows that parts work across multiple engines
3. **Alternative Options**: Users can find cheaper or different brand alternatives
4. **SEO**: Internal linking between related engines

## Example Use Cases

### Scenario 1: User has Predator 212
- Sees that Honda GX200 is a clone
- Knows that parts for GX200 will also fit Predator 212
- Can search for parts using either engine

### Scenario 2: User wants Honda GX200 but it's expensive
- Sees that Predator 212 is a clone
- Can use Predator 212 as a cheaper alternative
- Same parts compatibility

### Scenario 3: Admin adding new engine
- Adds Predator 212 to catalog
- Links it as clone of Honda GX200
- All existing parts for GX200 now show as compatible with Predator 212

## Seeding Clone Relationships

Run `SEED-ENGINE-CLONES.sql` to automatically create common clone relationships:
- Predator 212 ↔ Honda GX200
- Predator 79cc ↔ Honda GX100
- Predator 224 ↔ Honda GX200

The script will find engines by name and create bidirectional relationships.

## Technical Details

### Server Actions
- `getEngineClones(engineId)` - Public, fetches clones for an engine
- `getAdminEngineClones()` - Admin, fetches all relationships
- `createEngineClone()` - Admin, creates relationship
- `createBidirectionalClone()` - Admin, creates both directions
- `updateEngineClone()` - Admin, updates relationship
- `deleteEngineClone()` - Admin, deletes relationship

### Components
- `EngineClonesList` - Displays clone engines on detail page
- Admin clone management page at `/admin/engines/[id]/clones`

## Future Enhancements

- Auto-detect clones based on specifications (same shaft diameter, displacement, etc.)
- Show clone engines in builder when selecting engine
- Filter parts by "works with clones"
- Bulk import clone relationships from CSV

---

**Status:** Fully Implemented  
**Last Updated:** 2026-01-16
