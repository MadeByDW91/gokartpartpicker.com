# A5: Admin Phase 1 - Essential Business Tools

**Agent:** A5 (Admin)  
**Status:** ⏳ Ready  
**Phase:** 1 of 3

---

```markdown
You are Agent A5: Admin.

Build the essential business tools that enable efficient catalog management.
These are the highest-priority features for running the business.

TASK: Admin Phase 1 - Essential Business Tools

## Features to Build (In Order)

### 1. Bulk Import/Export (HIGHEST PRIORITY)
**Why:** Critical for scaling catalog management

**Files to Create:**
- `src/app/admin/parts/import/page.tsx` — Import interface
- `src/app/admin/parts/export/page.tsx` — Export interface
- `src/app/admin/engines/import/page.tsx` — Import interface
- `src/app/admin/engines/export/page.tsx` — Export interface
- `src/components/admin/CSVImporter.tsx` — Reusable CSV import component
- `src/actions/admin/import.ts` — Import server actions
- `src/actions/admin/export.ts` — Export server actions

**Import Features:**
- CSV file upload (drag & drop or file picker)
- Template download button (with all column headers)
- Validation before import (show errors)
- Preview table (first 10 rows)
- Progress indicator during import
- Error reporting (which rows failed and why)
- Success summary (X items imported, Y errors)

**Export Features:**
- Export all parts to CSV
- Export all engines to CSV
- Export filtered results (if on filtered page)
- Include all fields
- Download button

**CSV Template Format (Parts):**
```csv
name,slug,description,price,image_url,affiliate_url,category_id,brand,is_active
Predator 212, predator-212, 6.5 HP engine, 149.99, https://..., https://..., 1, Harbor Freight, true
```

**CSV Template Format (Engines):**
```csv
name,slug,description,price,image_url,affiliate_url,brand,horsepower,displacement_cc,shaft_size_mm,is_active
Predator 212, predator-212, 6.5 HP engine, 149.99, https://..., https://..., Harbor Freight, 6.5, 212, 19.05, true
```

### 2. Affiliate Link Generator (HIGH PRIORITY)
**Why:** Revenue optimization - makes adding affiliate links easy

**Files to Create:**
- `src/app/admin/affiliate/page.tsx` — Affiliate dashboard
- `src/components/admin/AffiliateLinkGenerator.tsx` — Link generator component
- `src/actions/admin/affiliate.ts` — Affiliate server actions

**Features:**
- **Link Generator Form:**
  - Input: Product URL or Product ID
  - Select: Affiliate program (Amazon, eBay, etc.)
  - Generate button → Output affiliate link
  - Copy to clipboard button
  
- **Affiliate Program Settings:**
  - Store affiliate tag IDs (Amazon tag, eBay tag, etc.)
  - Edit tags (store in env vars or database table)
  - List of programs (Amazon, eBay, etc.)

- **Bulk Apply:**
  - Select multiple parts/engines from list
  - Apply affiliate program to selected items
  - Update affiliate_url field

**Link Generation Rules:**
- Amazon: `https://www.amazon.com/dp/{ASIN}?tag={TAG}`
- eBay: `https://www.ebay.com/itm/{ITEM_ID}?mkcid=1&mkrid={TAG}`
- Manual URL: Add `?tag={TAG}` or `&tag={TAG}`

### 3. Missing Data Report (MEDIUM PRIORITY)
**Why:** Helps identify what needs attention

**Files to Create:**
- `src/app/admin/reports/missing-data/page.tsx` — Missing data report
- `src/actions/admin/reports.ts` — Report server actions

**Features:**
- **Report Sections:**
  - Parts missing prices
  - Parts missing images
  - Parts missing descriptions
  - Parts missing affiliate links
  - Engines missing prices
  - Engines missing images
  - Engines missing descriptions
  - Engines missing affiliate links

- **UI:**
  - Tabs or sections for each category
  - Table showing items with missing data
  - Filter by category
  - Quick action: "Edit" button → goes to edit page
  - Export report to CSV
  - Count badges showing how many items

### 4. Bulk Operations Toolbar (MEDIUM PRIORITY)
**Why:** Efficiency for common tasks

**Files to Create:**
- `src/components/admin/BulkActions.tsx` — Bulk action toolbar
- Update existing list pages to support bulk selection

**Features:**
- **Selection:**
  - Checkbox column in parts/engines list tables
  - "Select All" checkbox in table header
  - Selected count indicator

- **Bulk Actions (when items selected):**
  - Dropdown menu appears
  - Actions:
    - Update price (modal with new price input)
    - Change category (modal with category select)
    - Activate/Deactivate toggle
    - Update affiliate program (modal with program select)
    - Delete (confirmation modal required)

- **UI:**
  - Toolbar appears at top when items selected
  - Shows "X items selected"
  - Progress indicator during bulk operation
  - Success/error feedback

## Implementation Notes

### CSV Import Flow:
1. User clicks "Import" button
2. Upload CSV file (or download template first)
3. Parse CSV and validate:
   - Required fields present
   - Data types correct (price is number, etc.)
   - Foreign keys valid (category_id exists)
4. Show preview table with errors highlighted
5. User clicks "Confirm Import"
6. Import with progress bar
7. Show results: "Successfully imported 45 items. 2 errors (see below)"

### Affiliate Link Generator:
- Store affiliate tags in environment variables:
  - `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`
  - `NEXT_PUBLIC_EBAY_AFFILIATE_TAG`
- Or create `affiliate_programs` table in database
- Validate URLs before generating links

### Bulk Operations:
- Add checkbox column to existing list tables
- Use state to track selected items (array of IDs)
- Show bulk action toolbar only when items selected
- Confirmation modal for destructive actions (delete)

## Success Criteria

- [ ] CSV import works for parts (with validation)
- [ ] CSV import works for engines (with validation)
- [ ] CSV export works for parts
- [ ] CSV export works for engines
- [ ] Template download works
- [ ] Affiliate link generator works (Amazon & eBay)
- [ ] Bulk apply affiliate links works
- [ ] Missing data report shows accurate data
- [ ] Bulk operations work on parts list
- [ ] Bulk operations work on engines list
- [ ] All features match admin theme (dark, olive/orange)
- [ ] Error handling is user-friendly
- [ ] Loading states show during operations

## DO NOT

- Do NOT break existing CRUD functionality
- Do NOT skip validation on imports
- Do NOT allow bulk delete without confirmation
- Do NOT expose affiliate tags in client-side code (use server actions)
```
