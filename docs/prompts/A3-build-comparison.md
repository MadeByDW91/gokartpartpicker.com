# A3: Build Comparison Tool

You are Agent A3: UI.

Users want to compare different builds side-by-side. Build a comparison tool that allows comparing up to 3 builds.

TASK: Build Comparison Tool

## Features to Implement

1. **Side-by-Side Comparison**
   - Compare 2-3 builds simultaneously
   - Show differences visually (highlight changes)
   - Compare: cost, HP/torque, parts, compatibility

2. **Comparison Metrics**
   - Total cost
   - Estimated HP/Torque
   - Part compatibility status
   - Weight differences
   - Top speed estimates
   - Number of parts

3. **Visual Highlighting**
   - Green: Better/cheaper in this build
   - Red: Worse/more expensive in this build
   - Gray: Same/equivalent

4. **Export/Share**
   - Export comparison as PDF
   - Shareable link to comparison

## Files to Create/Modify

1. **Page**: `src/app/builds/compare/page.tsx`
   - Comparison page with query params: `?builds=id1,id2,id3`
   - Build selector (search/build picker)
   - Comparison table/cards

2. **Component**: `src/components/builds/BuildComparison.tsx`
   - Main comparison component
   - Side-by-side layout (2-3 columns)
   - Comparison table

3. **Component**: `src/components/builds/ComparisonRow.tsx`
   - Individual comparison metric row
   - Shows value for each build
   - Visual highlighting (green/red/gray)

4. **Component**: `src/components/builds/BuildSelector.tsx`
   - Build search/select component
   - Multi-select for comparison
   - Show user's builds + public builds

5. **Server Action**: `src/actions/builds.ts` (update)
   - `getBuildsForComparison(buildIds: string[])` → Build[]
   - Ensure can fetch multiple builds efficiently

## Implementation Details

### Comparison Metrics

```typescript
interface ComparisonMetric {
  label: string;
  category: 'cost' | 'performance' | 'parts' | 'compatibility';
  values: (number | string | null)[];
  better?: 'higher' | 'lower'; // What value is better?
  format?: 'currency' | 'number' | 'percentage';
}

function generateComparisonMetrics(
  builds: Build[],
  performances: Performance[] // From performance calculator
): ComparisonMetric[] {
  return [
    {
      label: 'Total Cost',
      category: 'cost',
      values: builds.map(b => b.total_price),
      better: 'lower',
      format: 'currency'
    },
    {
      label: 'Estimated HP',
      category: 'performance',
      values: performances.map(p => p.hp),
      better: 'higher',
      format: 'number'
    },
    // ... more metrics
  ];
}
```

### Visual Highlighting

- **Green**: Best value (highest HP, lowest cost, etc.)
- **Red**: Worst value
- **Gray**: Same/equivalent

### Layout Options

**Desktop (3 builds):**
```
[Build 1]  [Build 2]  [Build 3]
   Cost       Cost       Cost
     HP         HP         HP
  Parts      Parts      Parts
```

**Mobile:**
Stack vertically or swipeable cards

## Success Criteria

- [ ] Compare 2-3 builds side-by-side
- [ ] All key metrics display (cost, HP, torque, parts)
- [ ] Visual highlighting works (green/red/gray)
- [ ] Build selector works (search/pick builds)
- [ ] Comparison URL is shareable
- [ ] Export to PDF works (optional)
- [ ] Mobile responsive (stack or swipeable)
- [ ] "Best value" badge shows on winning build

## Integration Points

- Link from build detail pages ("Compare Builds" button)
- Link from user's builds list
- Add to builder ("Compare with another build")
- Shareable URL format: `/builds/compare?builds=id1,id2`

## Example Comparison View

```
Build Comparison
================

Build 1: "Speed Demon"          Build 2: "Budget Racer"
$856                              $423
8.2 HP                            6.5 HP
9.5 lb-ft                         8.1 lb-ft
12 parts                          8 parts
✅ Compatible                     ✅ Compatible
35 mph                            28 mph

Best Value: Build 2 (Lowest cost per HP)
```

DO NOT modify existing build functionality - only add comparison.

Reference: `docs/VALUE-ADD-FEATURES-PLAN.md`

<!-- Agent: A3 (UI) | Status: ⏳ Ready | File: docs/prompts/A3-build-comparison.md -->
