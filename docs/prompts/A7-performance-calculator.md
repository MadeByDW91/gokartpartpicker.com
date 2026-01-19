# A7: Performance Calculator

You are Agent A7: Backend/Logic.

The builder interface exists. Users want to see how their build performs - HP, torque, top speed estimates.

TASK: Build Performance Calculator

The calculator should estimate build performance based on engine specs + part modifications.

## Features to Implement

1. **HP Calculation**
   - Base engine HP + part contributions
   - Formula: `base_hp + Σ(part_hp_contribution)`
   - Store HP contribution in part `specifications` JSONB field

2. **Torque Calculation**
   - Base engine torque + part contributions
   - Formula: `base_torque + Σ(part_torque_contribution)`
   - Store torque contribution in part `specifications` JSONB field

3. **Performance Estimates**
   - Top Speed: `(hp × 200) / (weight / 100) / gear_ratio`
   - Power-to-Weight Ratio: `hp / (weight / 100)`
   - Acceleration estimates (0-20mph, 0-30mph)

## Files to Create/Modify

1. **Server Action**: `src/lib/performance/calculator.ts`
   - `calculateBuildHP(engine, parts)` → number
   - `calculateBuildTorque(engine, parts)` → number
   - `estimateTopSpeed(hp, weight, gearRatio)` → number
   - `calculatePowerToWeight(hp, weight)` → number

2. **Hook**: `src/hooks/use-build-performance.ts`
   - React hook that calculates performance when build changes
   - Returns: `{ hp, torque, topSpeed, powerToWeight }`

3. **Component**: `src/components/builder/PerformanceCard.tsx`
   - Display performance metrics in builder
   - Show: Estimated HP, Torque, Top Speed, Power-to-Weight
   - Visual indicators (badges, progress bars)
   - Update live as parts are added/removed

4. **Database Migration** (if needed)
   - Ensure `parts.specifications` JSONB field can store:
     - `hp_contribution` (number)
     - `torque_contribution` (number)
     - `rpm_range` (object with min/max)

## Implementation Details

### HP Contribution Examples
- High-flow air filter: +0.1 to +0.3 HP
- Performance exhaust: +0.2 to +0.5 HP
- Performance carburetor: +0.3 to +0.8 HP
- Performance cam: +0.5 to +1.5 HP
- Header: +0.2 to +0.4 HP

### Torque Contribution Examples
- Torque converter: +15% to +30% torque multiplication (handled separately)
- Performance exhaust: +0.2 to +0.4 lb-ft
- Performance cam (low-RPM): +0.5 to +1.2 lb-ft

### Formulas
```typescript
// HP Calculation
function calculateBuildHP(engine: Engine, parts: Part[]): number {
  let totalHP = engine.horsepower;
  parts.forEach(part => {
    const contribution = part.specifications?.hp_contribution || 0;
    totalHP += contribution;
  });
  return Math.round(totalHP * 10) / 10; // Round to 1 decimal
}

// Torque Calculation
function calculateBuildTorque(engine: Engine, parts: Part[]): number {
  let totalTorque = engine.torque || (engine.horsepower * 5252 / 3600);
  parts.forEach(part => {
    const contribution = part.specifications?.torque_contribution || 0;
    totalTorque += contribution;
  });
  return Math.round(totalTorque * 10) / 10;
}

// Top Speed Estimate (simplified)
function estimateTopSpeed(hp: number, weight: number, gearRatio: number = 1): number {
  const constant = 200; // Empirical constant
  return Math.round((hp * constant) / (weight / 100) / gearRatio);
}
```

## Success Criteria

- [ ] HP calculation shows in builder summary
- [ ] Torque calculation shows in builder summary
- [ ] Top speed estimate displays
- [ ] Power-to-weight ratio shows
- [ ] Performance updates live as parts are added/removed
- [ ] Calculations are accurate (within ±5% of real-world estimates)
- [ ] Performance card is visually appealing
- [ ] Mobile responsive

## Integration Points

- Integrate `PerformanceCard` into `src/components/builder/BuildSummary.tsx`
- Use `use-build-performance` hook in builder page
- Display performance in build detail pages (`/builds/[id]`)

DO NOT modify existing builder functionality - only add performance calculations.

Reference: `docs/VALUE-ADD-FEATURES-PLAN.md`

---

<!--
Agent: A7 (Backend/Logic)
Status: ⏳ Ready
File: docs/prompts/A7-performance-calculator.md
-->
