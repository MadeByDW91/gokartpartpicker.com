# A7: Build Recommendations Engine

You are Agent A7: Backend/Logic.

Users need guidance on which parts to select. Build a recommendation engine that suggests parts based on goals, compatibility, and popular combinations.

TASK: Build Recommendations Engine

## Features to Implement

1. **Goal-Based Recommendations**
   - "Maximum Speed" → Suggest high-RPM parts, lightweight components
   - "Low-End Torque" → Suggest torque converters, performance cams
   - "Reliability" → Suggest OEM-compatible, well-rated parts
   - "Budget Build" → Suggest best value parts within budget

2. **Part Compatibility Recommendations**
   - "Users with this engine also selected..."
   - "This clutch works well with these sprockets..."
   - Based on saved builds data

3. **Progressive Upgrade Paths**
   - "Start here" → "Then upgrade to" → "Finally add"
   - Guide users through logical upgrade sequences

## Files to Create/Modify

1. **Server Actions**: `src/actions/recommendations.ts`
   - `getRecommendations(engineId, category, goal)` → Part[]
   - `getPopularCombinations(engineId)` → PartCombination[]
   - `getUpgradePath(engineId, currentParts, goal)` → UpgradeStep[]

2. **Server Action**: `src/actions/builds.ts` (update)
   - Track popular part combinations from saved builds
   - Aggregate statistics (most common combinations)

3. **Database Migration** (optional)
   - Create `build_statistics` view/table to track:
     - Most popular part combinations per engine
     - Most selected parts per category
     - Part co-occurrence matrix

4. **Hook**: `src/hooks/use-recommendations.ts`
   - React hook for fetching recommendations
   - Returns: `{ recommendations, popularCombinations, upgradePath }`

5. **Component**: `src/components/builder/RecommendationsPanel.tsx`
   - Display recommendations in builder
   - Show "Suggested Parts" for selected category
   - "Popular Combinations" section
   - "Upgrade Path" guidance

## Implementation Details

### Recommendation Algorithms

#### Goal-Based Filtering
```typescript
function getRecommendationsForGoal(
  parts: Part[],
  category: PartCategory,
  goal: 'speed' | 'torque' | 'reliability' | 'budget'
): Part[] {
  let filtered = parts.filter(p => p.category === category);
  
  switch (goal) {
    case 'speed':
      // Sort by RPM rating, HP contribution (descending)
      return filtered.sort((a, b) => 
        (b.specifications?.rpm_range?.max || 0) - (a.specifications?.rpm_range?.max || 0)
      );
    
    case 'torque':
      // Sort by torque contribution, low-RPM performance
      return filtered.sort((a, b) =>
        (b.specifications?.torque_contribution || 0) - (a.specifications?.torque_contribution || 0)
      );
    
    case 'reliability':
      // Filter by ratings (if available), OEM-compatible
      return filtered.filter(p => p.specifications?.oem_compatible !== false);
    
    case 'budget':
      // Sort by value (price / performance ratio)
      return filtered.sort((a, b) => {
        const valueA = (a.specifications?.hp_contribution || 0) / (a.price || 1);
        const valueB = (b.specifications?.hp_contribution || 0) / (b.price || 1);
        return valueB - valueA;
      });
  }
}
```

#### Popular Combinations (from saved builds)
```typescript
// Query saved builds to find most common part combinations
async function getPopularCombinations(engineId: string): Promise<PartCombination[]> {
  // Get all builds with this engine
  // Extract part combinations
  // Count frequency
  // Return top combinations
}
```

#### Upgrade Path
```typescript
interface UpgradeStep {
  step: number;
  category: PartCategory;
  recommendedPart: Part;
  reason: string;
  estimatedHPGain: number;
}

function generateUpgradePath(
  engine: Engine,
  currentParts: Part[],
  goal: 'speed' | 'torque'
): UpgradeStep[] {
  // Define logical upgrade order
  // Priority: Air Filter → Exhaust → Carb → Cam → Header
  // Return steps with recommendations
}
```

## Success Criteria

- [ ] Recommendations display in builder for selected category
- [ ] Goal selector works (speed/torque/reliability/budget)
- [ ] Popular combinations show based on saved builds
- [ ] Upgrade path guidance displays
- [ ] Recommendations are relevant to selected engine
- [ ] One-click "Add to Build" from recommendations
- [ ] Mobile responsive

## Integration Points

- Integrate `RecommendationsPanel` into builder page
- Use in part selection flow
- Display on engine detail pages ("Recommended Parts")
- Show in empty state when no parts selected

## Example Recommendation Display

```
Suggested Parts for "Air Filter" (Speed Goal)
===============================================
✓ High-Flow Air Filter - +0.3 HP, $25
  Most selected with Predator 212
→ Add to Build

Performance Air Filter - +0.5 HP, $45
  Popular for speed builds
→ Add to Build

Popular Combinations:
- Predator 212 + High-Flow Air Filter + Performance Exhaust (85 builds)
- Predator 212 + Performance Air Filter + Performance Carb (42 builds)
```

DO NOT modify existing builder functionality - only add recommendations.

Reference: `docs/VALUE-ADD-FEATURES-PLAN.md`

<!-- Agent: A7 (Backend/Logic) | Status: ⏳ Ready | File: docs/prompts/A7-build-recommendations.md -->
