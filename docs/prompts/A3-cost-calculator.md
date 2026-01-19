# A3: Cost Calculator & Budget Tracker

You are Agent A3: UI.

Users want to track build costs and stay within budget. Add real-time cost calculation and budget tracking to the builder.

TASK: Build Cost Calculator & Budget Tracker

## Features to Implement

1. **Real-time Cost Calculator**
   - Show total cost as parts are added/removed
   - Cost breakdown by category (Engine, Drivetrain, Safety, etc.)
   - Update live in builder summary

2. **Budget Tracker**
   - Allow users to set a budget
   - Warn when approaching/exceeding budget
   - Show remaining budget
   - Suggest alternatives when over budget

3. **Cost Breakdown Card**
   - Visual breakdown by category
   - Pie chart or bar chart (optional)
   - Show percentages
   - "Most expensive category" indicator

## Files to Create/Modify

1. **Component**: `src/components/builder/CostCard.tsx`
   - Display total cost
   - Show cost breakdown by category
   - Budget input/display
   - Warning indicators when over budget

2. **Component**: `src/components/builder/CostBreakdown.tsx`
   - Visual breakdown (list or chart)
   - Category grouping
   - Individual part costs

3. **Hook**: `src/hooks/use-build-cost.ts`
   - Calculate total cost from engine + parts
   - Calculate breakdown by category
   - Budget comparison logic

4. **Integration**: Update `src/components/builder/BuildSummary.tsx`
   - Add CostCard component
   - Integrate cost calculation

## Implementation Details

### Cost Calculation
```typescript
// Calculate total build cost
function calculateBuildCost(engine: Engine | null, parts: Part[]): number {
  let total = engine?.price || 0;
  parts.forEach(part => {
    total += part.price || 0;
  });
  return total;
}

// Calculate cost by category
function calculateCostByCategory(engine: Engine | null, parts: Part[]): Record<string, number> {
  const breakdown: Record<string, number> = {
    engine: engine?.price || 0,
  };
  
  parts.forEach(part => {
    const category = part.category;
    breakdown[category] = (breakdown[category] || 0) + (part.price || 0);
  });
  
  return breakdown;
}
```

### Budget Alerts
- Green: Under budget (0-80% used)
- Yellow: Approaching budget (80-95% used)
- Red: Over budget (>100% used)

### Alternative Suggestions
When over budget:
- Find most expensive parts
- Suggest cheaper alternatives from same category
- Show: "Switch to [Part Name] to save $X"

## UI Components

### CostCard
- Total cost (large, prominent)
- Budget input field (optional)
- Progress bar showing budget usage
- Remaining budget or overage amount
- Warning badge when over budget

### CostBreakdown
- List of categories with costs
- Percentages (e.g., "Engine: $299 (75%)")
- Optional: Simple chart visualization

## Success Criteria

- [ ] Total cost displays in builder summary
- [ ] Cost updates live as parts are added/removed
- [ ] Budget input/display works
- [ ] Budget warnings show when approaching/exceeding
- [ ] Cost breakdown by category displays
- [ ] Alternative suggestions show when over budget
- [ ] Mobile responsive
- [ ] Visual feedback (colors, badges) for budget status

## Integration Points

- Integrate into `src/components/builder/BuildSummary.tsx`
- Use in builder page (`/builder`)
- Display in build detail pages (`/builds/[id]`)

DO NOT modify existing builder functionality - only add cost tracking.

Reference: `docs/VALUE-ADD-FEATURES-PLAN.md`

<!-- Agent: A3 (UI) | Status: ⏳ Ready | File: docs/prompts/A3-cost-calculator.md -->
