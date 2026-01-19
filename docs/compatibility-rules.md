# Project Atlas — Compatibility Rules Engine

> **Purpose:** Define the deterministic compatibility system that evaluates part/engine relationships.

---

## Philosophy

The compatibility engine is the core intelligence of Project Atlas. It MUST be:

1. **Deterministic** — Same inputs always produce same outputs
2. **Explainable** — Every result cites the specific rule(s) that caused it
3. **Auditable** — Rules are data in the database, not hidden in code
4. **Safe** — When in doubt, warn the user
5. **No AI/ML** — Pure logic, no probabilistic decisions

---

## Rule Types

### 1. Shaft Compatibility

Validates that a part's bore matches the engine's shaft specifications.

```yaml
rule_type: shaft_compatibility
example: "Predator 212 has 3/4\" (19.05mm) shaft. Clutch must have 19.05mm bore."
result_if_fail: incompatible
```

**Conditions checked:**
- Shaft diameter matches bore diameter
- Keyway width matches (if keyed)
- Shaft length sufficient for part
- Shaft type compatible (straight vs tapered)

### 2. Mounting Compatibility

Validates physical mounting compatibility.

```yaml
rule_type: mounting_compatibility
example: "Torque converter requires minimum shaft length of 2.5 inches."
result_if_fail: incompatible
```

**Conditions checked:**
- Bolt pattern matches (if applicable)
- Physical clearance available
- Mounting hardware compatible

### 3. Performance Requirement

Validates performance limits and requirements.

```yaml
rule_type: performance_requirement
example: "Clutch rated for max 8HP. Engine produces 6.5HP. Compatible."
result_if_fail: warning
```

**Conditions checked:**
- Part HP rating >= engine HP
- Part RPM rating >= engine max RPM
- Part torque rating >= engine torque

### 4. Safety Requirement

Critical safety validations that should block builds.

```yaml
rule_type: safety_requirement
example: "Performance exhaust requires header wrap for burn prevention."
result_if_fail: warning
message: "Safety: Header wrap recommended to prevent burns."
```

**Conditions checked:**
- Required safety accessories present
- Proper guards/shields for modifications
- Fuel system safety

### 5. Part Conflict

Identifies parts that cannot be used together.

```yaml
rule_type: part_conflict
example: "Torque converter and clutch are mutually exclusive."
result_if_fail: incompatible
```

**Conditions checked:**
- Conflicting part types (clutch vs TC)
- Same-slot conflicts
- Resource conflicts (same shaft position)

### 6. Part Dependency

Identifies required companion parts.

```yaml
rule_type: part_dependency
example: "Performance carb requires rejetting or fuel tuning."
result_if_fail: warning
message: "Recommended: Rejet carburetor for this air filter."
```

**Conditions checked:**
- Required accessories
- Recommended companions
- Tuning requirements

---

## Rule Data Structure

### Database Schema

```sql
CREATE TABLE compatibility_rules (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  rule_type rule_type NOT NULL,
  
  -- What this rule applies to
  source_type entity_type NOT NULL,  -- 'engine', 'part', 'category'
  source_id UUID,                     -- NULL = all of this type
  
  -- What it checks against  
  target_type entity_type NOT NULL,
  target_id UUID,
  
  -- The logic
  condition JSONB NOT NULL,
  
  -- Outcome
  result compatibility_result NOT NULL,
  message TEXT NOT NULL,
  
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

### Condition JSON Schema

```typescript
type Condition = 
  | SimpleCondition
  | CompoundCondition

interface SimpleCondition {
  field: string        // e.g., "engine.shaft_diameter_mm"
  operator: Operator
  value: unknown
}

interface CompoundCondition {
  operator: 'AND' | 'OR' | 'NOT'
  conditions: Condition[]
}

type Operator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
```

### Example Rule: Shaft Diameter Match

```json
{
  "id": "rule-001",
  "name": "Shaft Diameter Compatibility",
  "description": "Part bore must match engine shaft diameter",
  "rule_type": "shaft_compatibility",
  "source_type": "part",
  "source_id": null,
  "target_type": "engine",
  "target_id": null,
  "condition": {
    "operator": "AND",
    "conditions": [
      {
        "field": "part.specs.bore_diameter_mm",
        "operator": "is_not_null",
        "value": null
      },
      {
        "field": "engine.shaft_diameter_mm",
        "operator": "is_not_null", 
        "value": null
      },
      {
        "operator": "OR",
        "conditions": [
          {
            "field": "part.specs.bore_diameter_mm",
            "operator": "equals",
            "value": { "$ref": "engine.shaft_diameter_mm" }
          },
          {
            "field": "part.universal",
            "operator": "equals",
            "value": true
          }
        ]
      }
    ]
  },
  "result": "incompatible",
  "message": "Part bore diameter (${part.specs.bore_diameter_mm}mm) does not match engine shaft (${engine.shaft_diameter_mm}mm)",
  "priority": 100
}
```

---

## Evaluator Algorithm

```typescript
// src/lib/compatibility/evaluator.ts

interface EvaluationResult {
  compatible: boolean
  conflicts: Conflict[]
  warnings: Warning[]
  dependencies: Dependency[]
}

interface Conflict {
  ruleId: string
  ruleName: string
  type: RuleType
  message: string
  parts: string[]  // Part IDs involved
}

export function evaluateCompatibility(
  engine: Engine,
  parts: Part[],
  rules: CompatibilityRule[]
): EvaluationResult {
  const result: EvaluationResult = {
    compatible: true,
    conflicts: [],
    warnings: [],
    dependencies: []
  }
  
  // Sort rules by priority (highest first)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)
  
  // Evaluate each rule
  for (const rule of sortedRules) {
    if (!rule.is_active) continue
    
    const ruleResult = evaluateRule(rule, engine, parts)
    
    if (!ruleResult.passed) {
      switch (rule.result) {
        case 'incompatible':
          result.compatible = false
          result.conflicts.push({
            ruleId: rule.id,
            ruleName: rule.name,
            type: rule.rule_type,
            message: interpolateMessage(rule.message, ruleResult.context),
            parts: ruleResult.affectedParts
          })
          break
          
        case 'warning':
          result.warnings.push({
            ruleId: rule.id,
            ruleName: rule.name,
            message: interpolateMessage(rule.message, ruleResult.context),
            parts: ruleResult.affectedParts
          })
          break
          
        case 'requires_modification':
          result.warnings.push({
            ruleId: rule.id,
            ruleName: rule.name,
            message: interpolateMessage(rule.message, ruleResult.context),
            parts: ruleResult.affectedParts,
            requiresModification: true
          })
          break
      }
    }
  }
  
  return result
}

function evaluateRule(
  rule: CompatibilityRule,
  engine: Engine,
  parts: Part[]
): RuleEvaluationResult {
  // Build context object for field resolution
  const context = { engine }
  
  // Determine which parts this rule applies to
  const applicableParts = parts.filter(part => 
    ruleAppliesToPart(rule, part)
  )
  
  // Evaluate condition for each applicable part
  for (const part of applicableParts) {
    const partContext = { ...context, part }
    const passed = evaluateCondition(rule.condition, partContext)
    
    if (!passed) {
      return {
        passed: false,
        context: partContext,
        affectedParts: [part.id]
      }
    }
  }
  
  // Check part-to-part rules
  if (rule.source_type === 'part' && rule.target_type === 'part') {
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const pairContext = { 
          engine, 
          part: parts[i], 
          target_part: parts[j] 
        }
        const passed = evaluateCondition(rule.condition, pairContext)
        
        if (!passed) {
          return {
            passed: false,
            context: pairContext,
            affectedParts: [parts[i].id, parts[j].id]
          }
        }
      }
    }
  }
  
  return { passed: true, context, affectedParts: [] }
}

function evaluateCondition(
  condition: Condition,
  context: EvaluationContext
): boolean {
  if ('conditions' in condition) {
    // Compound condition
    switch (condition.operator) {
      case 'AND':
        return condition.conditions.every(c => 
          evaluateCondition(c, context)
        )
      case 'OR':
        return condition.conditions.some(c => 
          evaluateCondition(c, context)
        )
      case 'NOT':
        return !evaluateCondition(condition.conditions[0], context)
    }
  }
  
  // Simple condition
  const fieldValue = resolveField(condition.field, context)
  const compareValue = resolveValue(condition.value, context)
  
  return evaluateOperator(
    condition.operator, 
    fieldValue, 
    compareValue
  )
}
```

---

## Predator Engine Rules (MVP)

### Predator 212 (Hemi & Non-Hemi)

```yaml
Engine: Predator 212
Shaft: 3/4" (19.05mm) straight
Keyway: 3/16" (4.76mm)
Shaft Length: 2.43" (61.7mm)
HP: 6.5
Max RPM: 3600 (governed)
```

**Standard Rules:**
1. Parts must have 3/4" bore OR be universal
2. Clutches must be rated for 6.5+ HP
3. Torque converters require 2.5"+ shaft length
4. Performance parts may require governor removal (warning)

### Predator 224

```yaml
Engine: Predator 224
Shaft: 3/4" (19.05mm) straight
Keyway: 3/16" (4.76mm)
Shaft Length: 2.43" (61.7mm)
HP: 7.5
Max RPM: 3600 (governed)
```

### Predator 301

```yaml
Engine: Predator 301
Shaft: 1" (25.4mm) straight
Keyway: 1/4" (6.35mm)
Shaft Length: 3.18" (80.8mm)
HP: 8
Max RPM: 3600 (governed)
```

**Key Difference:**
- 1" shaft requires different clutches/TCs than 212/224
- Parts for 212/224 are INCOMPATIBLE with 301

### Predator 420

```yaml
Engine: Predator 420
Shaft: 1" (25.4mm) straight
Keyway: 1/4" (6.35mm)
Shaft Length: 3.31" (84mm)
HP: 13
Max RPM: 3600 (governed)
```

---

## Safety Rules (Critical)

### S-001: Clutch/TC Mutual Exclusion

```json
{
  "name": "Clutch and Torque Converter Conflict",
  "rule_type": "part_conflict",
  "condition": {
    "operator": "AND",
    "conditions": [
      { "field": "part.category.slug", "operator": "equals", "value": "clutches" },
      { "field": "target_part.category.slug", "operator": "equals", "value": "torque-converters" }
    ]
  },
  "result": "incompatible",
  "message": "Cannot use both a clutch and torque converter. Choose one or the other.",
  "priority": 200
}
```

### S-002: Chain/Belt Size Match

```json
{
  "name": "Chain Pitch Must Match",
  "rule_type": "part_conflict",
  "condition": {
    "operator": "AND",
    "conditions": [
      { "field": "part.specs.chain_pitch", "operator": "is_not_null", "value": null },
      { "field": "target_part.specs.chain_pitch", "operator": "is_not_null", "value": null },
      { "field": "part.specs.chain_pitch", "operator": "not_equals", "value": { "$ref": "target_part.specs.chain_pitch" } }
    ]
  },
  "result": "incompatible",
  "message": "Chain pitch mismatch: ${part.name} uses #${part.specs.chain_pitch} but ${target_part.name} uses #${target_part.specs.chain_pitch}",
  "priority": 150
}
```

### S-003: Governor Removal Warning

```json
{
  "name": "High-RPM Parts May Require Governor Removal",
  "rule_type": "safety_requirement",
  "condition": {
    "operator": "AND",
    "conditions": [
      { "field": "part.specs.min_rpm", "operator": "greater_than", "value": 3600 }
    ]
  },
  "result": "warning",
  "message": "⚠️ This part is designed for higher RPM operation. Governor removal may be required. This voids warranty and requires additional safety precautions.",
  "priority": 100
}
```

---

## UI Integration

### Compatibility Badge

```tsx
function CompatibilityBadge({ result }: { result: CompatibilityResult }) {
  if (result === 'compatible') {
    return (
      <Badge variant="success">
        <CheckIcon /> Compatible
      </Badge>
    )
  }
  
  if (result === 'warning') {
    return (
      <Badge variant="warning">
        <WarningIcon /> Review Needed
      </Badge>
    )
  }
  
  return (
    <Badge variant="destructive">
      <XIcon /> Incompatible
    </Badge>
  )
}
```

### Conflict Display

```tsx
function ConflictList({ conflicts }: { conflicts: Conflict[] }) {
  return (
    <div className="space-y-2">
      {conflicts.map(conflict => (
        <div key={conflict.ruleId} className="p-3 bg-red-950 border border-red-800 rounded">
          <p className="font-medium text-red-200">{conflict.message}</p>
          <p className="text-sm text-red-400 mt-1">
            Rule: {conflict.ruleName}
          </p>
        </div>
      ))}
    </div>
  )
}
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('Compatibility Evaluator', () => {
  describe('shaft_compatibility', () => {
    it('marks incompatible when bore != shaft', () => {
      const engine = { shaft_diameter_mm: 19.05 }
      const parts = [{ specs: { bore_diameter_mm: 25.4 } }]
      
      const result = evaluateCompatibility(engine, parts, rules)
      
      expect(result.compatible).toBe(false)
      expect(result.conflicts[0].type).toBe('shaft_compatibility')
    })
    
    it('allows universal parts regardless of bore', () => {
      const engine = { shaft_diameter_mm: 19.05 }
      const parts = [{ universal: true }]
      
      const result = evaluateCompatibility(engine, parts, rules)
      
      expect(result.compatible).toBe(true)
    })
  })
  
  describe('part_conflict', () => {
    it('prevents clutch + torque converter', () => {
      const parts = [
        { category: { slug: 'clutches' } },
        { category: { slug: 'torque-converters' } }
      ]
      
      const result = evaluateCompatibility(engine, parts, rules)
      
      expect(result.compatible).toBe(false)
      expect(result.conflicts[0].type).toBe('part_conflict')
    })
  })
})
```

---

## Future Enhancements (Out of Scope for MVP)

- [ ] Rule versioning (track changes over time)
- [ ] A/B testing for rule message effectiveness
- [ ] User-submitted compatibility reports
- [ ] Machine learning to suggest new rules (v2+, if ever)
- [ ] Integration with vendor APIs for real-time specs

---

*Document Version: 1.0*  
*Last Updated: Day 0*  
*Owner: A6 (Compatibility)*
