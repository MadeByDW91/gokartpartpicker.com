# A3: Shopping List Generator

You are Agent A3: UI.

Users want to export their build as a printable shopping list for purchasing parts. Build a shopping list generator.

TASK: Build Shopping List Generator

## Features to Implement

1. **Printable Shopping List**
   - Export build as formatted shopping list
   - Include: part names, prices, URLs, checkboxes
   - Group by category (Engine, Drivetrain, etc.)
   - Show total cost

2. **Export Formats**
   - PDF export
   - Print-friendly HTML
   - CSV export (optional)
   - Shareable link

3. **Shopping List Features**
   - Checkboxes to mark items as purchased
   - Quantity tracking (if multiple of same part)
   - Notes section per item
   - Supplier grouping (Harbor Freight, Amazon, etc.)

## Files to Create/Modify

1. **Page**: `src/app/builds/[id]/shopping-list/page.tsx`
   - Shopping list view
   - Print-friendly layout
   - Export buttons

2. **Component**: `src/components/builds/ShoppingList.tsx`
   - Main shopping list component
   - Category grouping
   - Checkbox functionality
   - Total cost display

3. **Component**: `src/components/builds/ShoppingListItem.tsx`
   - Individual shopping list item
   - Part name, price, URL
   - Checkbox for purchased status
   - Notes field

4. **Utility**: `src/lib/export/shopping-list.ts`
   - `generateShoppingListPDF(build)` → PDF
   - `generateShoppingListHTML(build)` → HTML
   - `generateShoppingListCSV(build)` → CSV

5. **Server Action**: `src/actions/builds.ts` (update)
   - `getBuildForShoppingList(buildId)` → Build with full part data
   - Ensure includes affiliate URLs

## Implementation Details

### Shopping List Format

```typescript
interface ShoppingListItem {
  category: string;
  partName: string;
  brand: string;
  price: number;
  url: string | null;
  purchased: boolean;
  notes: string;
}

function generateShoppingList(build: Build): ShoppingListItem[] {
  const items: ShoppingListItem[] = [];
  
  // Add engine
  if (build.engine) {
    items.push({
      category: 'Engine',
      partName: build.engine.name,
      brand: build.engine.brand,
      price: build.engine.price || 0,
      url: build.engine.affiliate_url,
      purchased: false,
      notes: ''
    });
  }
  
  // Add parts by category
  // Group parts by category
  // Return formatted list
}
```

### PDF Generation (using a library like `jsPDF` or `puppeteer`)

```typescript
async function generateShoppingListPDF(build: Build): Promise<Blob> {
  // Generate PDF with shopping list
  // Include: build name, date, items, total
  // Print-friendly formatting
}
```

### HTML Export (print-friendly)

```html
<!-- Print-friendly HTML template -->
<div class="shopping-list">
  <h1>GoKart Build Shopping List</h1>
  <h2>Build Name: [Name]</h2>
  <p>Date: [Date]</p>
  
  <section class="category">
    <h3>Engine</h3>
    <div class="item">
      <input type="checkbox"> 
      <span>Predator 212 Hemi - $299</span>
      <a href="[URL]">Buy Now</a>
    </div>
  </section>
  
  <div class="total">Total: $856</div>
</div>
```

## Success Criteria

- [ ] Shopping list displays build parts organized by category
- [ ] Checkboxes work (can mark items as purchased)
- [ ] Total cost displays at bottom
- [ ] PDF export works
- [ ] Print-friendly layout (CSS @media print)
- [ ] Shareable link works
- [ ] URLs link to affiliate/purchase pages
- [ ] Mobile responsive
- [ ] Notes field per item (optional, can be added later)

## Integration Points

- Link from build detail pages ("Generate Shopping List" button)
- Link from builder ("Export Shopping List" button)
- URL format: `/builds/[id]/shopping-list`
- Print CSS should hide UI elements, show only list

## Example Shopping List Output

```
GoKart Build Shopping List - "My Speed Build"
Generated: January 16, 2025
==============================================

Engine:
  [ ] Predator 212 Hemi - $299
      Brand: Predator
      Buy: https://www.harborfreight.com/...
      
Drivetrain:
  [ ] MaxTorque Clutch 3/4" - $45
      Brand: MaxTorque
      Buy: https://amazon.com/...
      
  [ ] #35 Chain 120 Links - $12
      Brand: KMC
      Buy: https://amazon.com/...

==============================================
Total: $356
```

DO NOT modify existing build functionality - only add shopping list.

Reference: `docs/VALUE-ADD-FEATURES-PLAN.md`

<!-- Agent: A3 (UI) | Status: ⏳ Ready | File: docs/prompts/A3-shopping-list.md -->
