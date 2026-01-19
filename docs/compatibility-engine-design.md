# Go-Kart Part Picker — Compatibility Engine Design

> **Version:** 1.0.0  
> **Author:** Compatibility & Rules Intelligence Agent  
> **Last Updated:** January 16, 2026  
> **Status:** Design Complete — Pending DB Architect Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Concepts](#2-core-concepts)
3. [Risk Tier Classification](#3-risk-tier-classification)
4. [Rule Types & Precedence](#4-rule-types--precedence)
5. [Compatibility Dimensions](#5-compatibility-dimensions)
6. [Rule Evaluation Flow](#6-rule-evaluation-flow)
7. [Explainability Payloads](#7-explainability-payloads)
8. [Edge Cases & Conflict Resolution](#8-edge-cases--conflict-resolution)
9. [Data Structures (Proposed)](#9-data-structures-proposed)
10. [Frontend Handoff Notes](#10-frontend-handoff-notes)
11. [DB Architect Handoff Notes](#11-db-architect-handoff-notes)

---

## 1. Executive Summary

The Compatibility Engine is the decision-making core of GoKartPartPicker. It determines:
- **What fits** — Physical and mechanical compatibility
- **What works together** — Performance and functional synergy
- **What's safe** — Risk assessment and liability protection
- **Why** — Human-readable explanations for every decision

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Safety First** | Hard blocks for dangerous combinations trump all other logic |
| **Explainability** | Every decision must have a traceable, displayable reason |
| **Graceful Degradation** | Unknown parts default to warnings, not blocks |
| **User Agency** | Soft warnings inform, hard blocks protect |
| **Performance** | Rules evaluated in O(n) time with caching |

---

## 2. Core Concepts

### 2.1 Terminology

| Term | Definition |
|------|------------|
| **Build** | User's current selection of parts (cart) |
| **Base Machine** | The go-kart chassis/frame being modified |
| **Target Part** | Part being evaluated for compatibility |
| **Installed Parts** | Parts already in the build |
| **Rule** | A single compatibility check with outcome |
| **Verdict** | Final compatibility decision for a part |
| **Payload** | JSON structure containing verdict + explanation |

### 2.2 Verdict Types

```
┌─────────────────────────────────────────────────────────────────┐
│                      VERDICT HIERARCHY                          │
├─────────────────────────────────────────────────────────────────┤
│  HARD_BLOCK     →  Cannot add to cart. Period.                  │
│  SOFT_BLOCK     →  Blocked by default, user can override        │
│  WARNING        →  Can add, but shown prominent caution         │
│  NOTICE         →  Informational, low-severity note             │
│  COMPATIBLE     →  Fully compatible, no concerns                │
│  RECOMMENDED    →  Excellent pairing, highlighted as good       │
│  REQUIRED       →  Must be added if X is in build               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Verdict Precedence (Highest to Lowest)

1. `HARD_BLOCK` — Absolute, cannot override
2. `REQUIRED` — Must add, blocks checkout if missing
3. `SOFT_BLOCK` — Blocks unless explicitly overridden
4. `WARNING` — Displayed, but addable
5. `NOTICE` — Low-priority info
6. `COMPATIBLE` — Default good state
7. `RECOMMENDED` — Positive enhancement messaging

**Rule:** The highest-severity verdict wins. A single `HARD_BLOCK` negates any number of `RECOMMENDED` verdicts.

---

## 3. Risk Tier Classification

Every part and every build configuration carries a **Risk Tier** that affects how rules are evaluated.

### 3.1 Risk Tiers Defined

| Tier | Name | Description | Typical Use Case |
|------|------|-------------|------------------|
| `0` | **Stock** | OEM replacement, factory spec | Restoring a rental kart |
| `1` | **Mild** | Minor upgrades, within safe margins | Weekend warrior, kid's kart |
| `2` | **Moderate** | Noticeable performance gains | Enthusiast, occasional racing |
| `3` | **Aggressive** | Significant modifications | Club racing, experienced drivers |
| `4` | **Extreme** | Race-only, professional | Competitive racing, professional |
| `5` | **Experimental** | Untested combinations | Custom builds, at-your-own-risk |

### 3.2 Tier Escalation Rules

```
Build Risk Tier = MAX(all installed parts risk tier)
```

**Example:**
- Stock chassis (Tier 0)
- Mild exhaust (Tier 1)  
- Aggressive engine (Tier 3)
- **Build Risk = Tier 3 (Aggressive)**

### 3.3 Tier-Based Rule Modifications

| Scenario | Stock (0) | Mild (1) | Moderate (2) | Aggressive (3) | Extreme (4) | Experimental (5) |
|----------|-----------|----------|--------------|----------------|-------------|------------------|
| Missing safety gear | HARD_BLOCK | HARD_BLOCK | WARNING | NOTICE | NOTICE | NOTICE |
| Oversized engine | HARD_BLOCK | SOFT_BLOCK | WARNING | COMPATIBLE | COMPATIBLE | COMPATIBLE |
| Untested combo | HARD_BLOCK | SOFT_BLOCK | WARNING | WARNING | NOTICE | COMPATIBLE |

### 3.4 Age/Experience Modifiers

If user profile indicates:
- **Under 16 years old**: Max tier capped at `Mild (1)`
- **Beginner (<1 year)**: Max tier capped at `Moderate (2)`
- **Liability waiver signed**: Unlocks `Extreme (4)` and `Experimental (5)`

---

## 4. Rule Types & Precedence

### 4.1 Rule Categories

#### Physical Compatibility Rules (P-Rules)
Immutable physical constraints. These cannot be overridden.

| Rule ID | Name | Description |
|---------|------|-------------|
| `P001` | Bolt Pattern Match | Mounting holes must align |
| `P002` | Shaft Diameter | Engine/axle shaft must fit |
| `P003` | Chain Pitch | Chain and sprockets must match |
| `P004` | Dimensional Fit | Part must physically fit in space |
| `P005` | Electrical Voltage | Voltage must be compatible |

#### Mechanical Compatibility Rules (M-Rules)
Performance and wear considerations.

| Rule ID | Name | Description |
|---------|------|-------------|
| `M001` | Gear Ratio Range | Final drive ratio must be achievable |
| `M002` | Power Handling | Clutch/drivetrain rated for engine output |
| `M003` | Brake Capacity | Brakes sufficient for speed/weight |
| `M004` | Suspension Travel | Components allow proper suspension arc |
| `M005` | Weight Distribution | CG remains in safe range |

#### Safety Rules (S-Rules)
Life-safety critical checks.

| Rule ID | Name | Description | Verdict |
|---------|------|-------------|---------|
| `S001` | Kill Switch Present | Engine builds require kill switch | REQUIRED |
| `S002` | Throttle Return Spring | Must have redundant return | REQUIRED |
| `S003` | Brake Redundancy | High-speed builds need backup | WARNING→REQUIRED |
| `S004` | Chain Guard | Exposed chain on kid builds | REQUIRED |
| `S005` | Roll Bar | High-power builds recommend roll bar | WARNING |

#### Dependency Rules (D-Rules)
Parts that require other parts.

| Rule ID | Name | Example |
|---------|------|---------|
| `D001` | Engine Requires Clutch | No engine without engagement system |
| `D002` | Disc Brake Requires Rotor | Caliper needs matching rotor |
| `D003` | Carburetor Requires Filter | Air filter mandatory |
| `D004` | Axle Requires Bearings | Axle needs bearing carriers |

#### Exclusion Rules (X-Rules)
Mutually exclusive parts.

| Rule ID | Name | Example |
|---------|------|---------|
| `X001` | Clutch vs Torque Converter | Choose one engagement method |
| `X002` | Drum vs Disc Brake | One brake type per axle position |
| `X003` | Live vs Dead Axle | Fundamental axle architecture choice |

#### Advisory Rules (A-Rules)
Best practices and recommendations.

| Rule ID | Name | Description | Verdict |
|---------|------|-------------|---------|
| `A001` | Matching Brands | Same-brand parts often integrate better | NOTICE |
| `A002` | Upgrade Path | This part enables future upgrades | RECOMMENDED |
| `A003` | Popular Combo | Frequently purchased together | RECOMMENDED |
| `A004` | Overkill Warning | Part exceeds build needs | NOTICE |

### 4.2 Rule Evaluation Order

```
┌─────────────────────────────────────────────────────┐
│              RULE EVALUATION PIPELINE               │
├─────────────────────────────────────────────────────┤
│  1. EXCLUSION RULES (X-Rules)                       │
│     └─ Check for mutually exclusive conflicts       │
│                                                     │
│  2. PHYSICAL RULES (P-Rules)                        │
│     └─ Does it physically fit?                      │
│                                                     │
│  3. DEPENDENCY RULES (D-Rules)                      │
│     └─ Are prerequisites met?                       │
│                                                     │
│  4. SAFETY RULES (S-Rules)                          │
│     └─ Is it safe in this configuration?            │
│                                                     │
│  5. MECHANICAL RULES (M-Rules)                      │
│     └─ Will it perform correctly?                   │
│                                                     │
│  6. ADVISORY RULES (A-Rules)                        │
│     └─ Nice-to-know information                     │
│                                                     │
│  7. AGGREGATE VERDICT                               │
│     └─ Combine all results, highest severity wins   │
└─────────────────────────────────────────────────────┘
```

**Short-Circuit Behavior:**
- If any P-Rule returns `HARD_BLOCK`, stop evaluation, return immediately
- If any S-Rule returns `HARD_BLOCK`, stop evaluation, return immediately
- Otherwise, collect all verdicts and return highest severity

---

## 5. Compatibility Dimensions

### 5.1 Dimension Matrix

Each part type has specific compatibility dimensions that must be checked:

| Part Category | Primary Dimensions | Secondary Dimensions |
|---------------|-------------------|----------------------|
| **Engine** | Mount pattern, Shaft diameter, Output (HP/CC) | RPM range, Fuel type, Cooling type |
| **Clutch** | Bore size, Engagement RPM, Torque rating | Belt width (if CVT), Weight |
| **Torque Converter** | Bore size, Belt width, Ratio range | Driver/Driven size, Engagement RPM |
| **Sprocket** | Bore size, Tooth count, Chain pitch | Hub style, Material |
| **Chain** | Pitch, Length (links), Tensile strength | O-ring/standard, Color |
| **Axle** | Diameter, Length, Keyway size | Material, Weight |
| **Wheels** | Hub bolt pattern, Rim width, Diameter | Offset, Bead type |
| **Tires** | Rim diameter, Width, Compound | Tread pattern, Speed rating |
| **Brakes** | Type (band/disc), Mount style, Rotor size | Material, Pad compound |
| **Chassis** | Wheelbase, Track width, Axle mount type | Material, Weight capacity |
| **Steering** | Spindle type, Tie rod ends, Column diameter | Wheel size, Quick-release type |

### 5.2 Dimensional Matching Logic

```
FUNCTION checkDimensionalCompatibility(targetPart, installedParts, baseMachine):
    
    requiredDimensions = getDimensionRequirements(targetPart.category)
    
    FOR EACH dimension IN requiredDimensions:
        
        sourceValue = findDimensionValue(dimension, installedParts, baseMachine)
        targetValue = targetPart.dimensions[dimension]
        
        IF sourceValue IS NULL:
            # No reference point yet, part sets the standard
            CONTINUE
        
        IF NOT dimensionMatches(sourceValue, targetValue, dimension.tolerance):
            RETURN {
                verdict: HARD_BLOCK,
                rule: "P001",
                dimension: dimension.name,
                expected: sourceValue,
                actual: targetValue,
                message: buildMismatchMessage(dimension, sourceValue, targetValue)
            }
    
    RETURN { verdict: COMPATIBLE }
```

### 5.3 Tolerance System

Not all dimensions require exact matches. Tolerance levels:

| Tolerance Type | Allowed Variance | Example |
|----------------|------------------|---------|
| `EXACT` | 0% | Shaft bore (must be precise) |
| `TIGHT` | ±1% | Chain pitch (minimal variance) |
| `STANDARD` | ±5% | Sprocket alignment |
| `LOOSE` | ±10% | Aesthetic fitment |
| `RANGE` | Defined min-max | Gear ratios, RPM ranges |

---

## 6. Rule Evaluation Flow

### 6.1 Full Evaluation Flowchart

```
                    ┌─────────────────────┐
                    │   PART SELECTED     │
                    │   FOR EVALUATION    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Get Build Context  │
                    │  • Base machine     │
                    │  • Installed parts  │
                    │  • User profile     │
                    │  • Risk tier        │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
    ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │  X-RULES    │     │  P-RULES    │     │  D-RULES    │
    │  Exclusion  │     │  Physical   │     │  Dependency │
    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   HARD_BLOCK?       │
                    └──────────┬──────────┘
                          YES/ \NO
                            /   \
           ┌───────────────┐     └────────────────┐
           │                                      │
    ┌──────▼──────┐                        ┌──────▼──────┐
    │   STOP      │                        │  S-RULES    │
    │   Return    │                        │  Safety     │
    │   HARD_BLOCK│                        └──────┬──────┘
    └─────────────┘                               │
                                           ┌──────▼──────┐
                                           │  M-RULES    │
                                           │  Mechanical │
                                           └──────┬──────┘
                                                  │
                                           ┌──────▼──────┐
                                           │  A-RULES    │
                                           │  Advisory   │
                                           └──────┬──────┘
                                                  │
                                           ┌──────▼──────┐
                                           │  AGGREGATE  │
                                           │  Highest    │
                                           │  Severity   │
                                           │  Wins       │
                                           └──────┬──────┘
                                                  │
                                           ┌──────▼──────┐
                                           │  BUILD      │
                                           │  PAYLOAD    │
                                           └─────────────┘
```

### 6.2 Implementation Pseudocode

```javascript
function evaluateCompatibility(targetPart, buildContext) {
    const results = [];
    const ruleSets = [
        { rules: exclusionRules,  shortCircuit: true  },
        { rules: physicalRules,   shortCircuit: true  },
        { rules: dependencyRules, shortCircuit: false },
        { rules: safetyRules,     shortCircuit: true  },
        { rules: mechanicalRules, shortCircuit: false },
        { rules: advisoryRules,   shortCircuit: false },
    ];
    
    for (const ruleSet of ruleSets) {
        for (const rule of ruleSet.rules) {
            if (!rule.appliesTo(targetPart.category)) continue;
            
            const result = rule.evaluate(targetPart, buildContext);
            results.push(result);
            
            if (ruleSet.shortCircuit && result.verdict === 'HARD_BLOCK') {
                return buildPayload(targetPart, results, 'HARD_BLOCK');
            }
        }
    }
    
    const finalVerdict = aggregateVerdicts(results);
    return buildPayload(targetPart, results, finalVerdict);
}

function aggregateVerdicts(results) {
    const precedence = [
        'HARD_BLOCK', 'REQUIRED', 'SOFT_BLOCK', 
        'WARNING', 'NOTICE', 'COMPATIBLE', 'RECOMMENDED'
    ];
    
    for (const verdict of precedence) {
        if (results.some(r => r.verdict === verdict)) {
            return verdict;
        }
    }
    return 'COMPATIBLE';
}
```

### 6.3 Caching Strategy

```
CACHE KEY FORMAT:
    "{baseM achine}:{installedPartsHash}:{targetPartId}:{riskTier}"

CACHE INVALIDATION:
    • When any part is added/removed from build
    • When user profile changes (age, experience)
    • When base machine changes
    • TTL: 24 hours (parts data may update)

CACHE LAYERS:
    1. Client-side (session storage) — Immediate responses
    2. CDN/Edge (Vercel/Cloudflare) — 5-minute TTL
    3. Database (computed column or materialized view) — Daily refresh
```

---

## 7. Explainability Payloads

Every compatibility decision returns a structured JSON payload designed for frontend consumption.

### 7.1 Payload Structure

```typescript
interface CompatibilityPayload {
    // Core verdict
    verdict: Verdict;
    
    // Is user action blocked?
    canAdd: boolean;
    canOverride: boolean;
    
    // Human-readable summary
    summary: string;
    
    // Detailed rule results
    rules: RuleResult[];
    
    // Suggested actions
    suggestions: Suggestion[];
    
    // Risk assessment
    riskDelta: number;  // How much this changes build risk
    newRiskTier: RiskTier;
    
    // Metadata
    evaluatedAt: ISO8601;
    cacheKey: string;
}

interface RuleResult {
    ruleId: string;
    ruleName: string;
    category: 'P' | 'M' | 'S' | 'D' | 'X' | 'A';
    verdict: Verdict;
    
    // Explanation
    message: string;
    technicalDetail?: string;
    
    // For dimensional mismatches
    dimension?: {
        name: string;
        expected: string | number;
        actual: string | number;
        unit: string;
    };
    
    // Related parts
    conflictsWith?: PartReference[];
    requires?: PartReference[];
}

interface Suggestion {
    type: 'ADD_PART' | 'REMOVE_PART' | 'SWAP_PART' | 'ACKNOWLEDGE_RISK';
    priority: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL';
    message: string;
    parts?: PartReference[];
    action?: {
        label: string;
        endpoint: string;
    };
}
```

### 7.2 Example Payloads

#### Example 1: Hard Block — Shaft Diameter Mismatch

```json
{
    "verdict": "HARD_BLOCK",
    "canAdd": false,
    "canOverride": false,
    "summary": "This clutch won't fit your engine's shaft.",
    "rules": [
        {
            "ruleId": "P002",
            "ruleName": "Shaft Diameter Match",
            "category": "P",
            "verdict": "HARD_BLOCK",
            "message": "The clutch bore (3/4\") doesn't match your engine shaft (1\").",
            "technicalDetail": "Predator 212cc engines use a 1\" (25.4mm) crankshaft. This clutch is designed for 3/4\" (19mm) shafts common on smaller engines.",
            "dimension": {
                "name": "Shaft Bore",
                "expected": "1.000",
                "actual": "0.750",
                "unit": "inches"
            }
        }
    ],
    "suggestions": [
        {
            "type": "SWAP_PART",
            "priority": "REQUIRED",
            "message": "Choose a clutch with 1\" bore instead",
            "action": {
                "label": "View Compatible Clutches",
                "endpoint": "/api/parts?category=clutch&bore=1.0"
            }
        }
    ],
    "riskDelta": 0,
    "newRiskTier": "MODERATE",
    "evaluatedAt": "2026-01-16T14:30:00Z",
    "cacheKey": "pred212:abc123:clutch456:2"
}
```

#### Example 2: Warning — Safety Recommendation

```json
{
    "verdict": "WARNING",
    "canAdd": true,
    "canOverride": false,
    "summary": "This engine upgrade should include a kill switch.",
    "rules": [
        {
            "ruleId": "S001",
            "ruleName": "Kill Switch Required",
            "category": "S",
            "verdict": "WARNING",
            "message": "Builds with engines over 6.5HP should have an accessible kill switch for safety.",
            "technicalDetail": "A kill switch allows the driver or nearby adults to immediately stop the engine in emergencies. This is especially important for youth riders."
        },
        {
            "ruleId": "A002",
            "ruleName": "Upgrade Path",
            "category": "A",
            "verdict": "RECOMMENDED",
            "message": "This Predator 212 is a popular choice that opens up many performance upgrade options."
        }
    ],
    "suggestions": [
        {
            "type": "ADD_PART",
            "priority": "RECOMMENDED",
            "message": "Add a kill switch to your build",
            "parts": [
                { "id": "ks-001", "name": "Tether Kill Switch", "price": 12.99 },
                { "id": "ks-002", "name": "Toggle Kill Switch", "price": 8.99 }
            ],
            "action": {
                "label": "Add Kill Switch",
                "endpoint": "/api/cart/add?partId=ks-001"
            }
        }
    ],
    "riskDelta": 1,
    "newRiskTier": "MODERATE",
    "evaluatedAt": "2026-01-16T14:35:00Z",
    "cacheKey": "gkm-208:def456:pred212:1"
}
```

#### Example 3: Required Dependency

```json
{
    "verdict": "REQUIRED",
    "canAdd": true,
    "canOverride": false,
    "summary": "This disc brake caliper requires a matching rotor.",
    "rules": [
        {
            "ruleId": "D002",
            "ruleName": "Disc Brake Requires Rotor",
            "category": "D",
            "verdict": "REQUIRED",
            "message": "A disc brake caliper needs a rotor to function. Add a compatible rotor to complete the brake system.",
            "requires": [
                { "id": "rotor-6in", "name": "6\" Brake Rotor", "price": 24.99 }
            ]
        }
    ],
    "suggestions": [
        {
            "type": "ADD_PART",
            "priority": "REQUIRED",
            "message": "Add the matching rotor",
            "parts": [
                { "id": "rotor-6in", "name": "6\" Brake Rotor - 3-hole pattern", "price": 24.99 }
            ],
            "action": {
                "label": "Add Rotor",
                "endpoint": "/api/cart/add?partId=rotor-6in"
            }
        }
    ],
    "riskDelta": 0,
    "newRiskTier": "MILD",
    "evaluatedAt": "2026-01-16T14:40:00Z",
    "cacheKey": "gkm-208:ghi789:caliper6:1"
}
```

### 7.3 Message Templates

For consistency, use parameterized message templates:

```javascript
const TEMPLATES = {
    // Physical
    P001: "The {partType} bolt pattern ({actual}) doesn't match your {targetType} ({expected}).",
    P002: "The {partType} bore ({actual}\") doesn't match your {targetType} shaft ({expected}\").",
    P003: "The chain pitch #{actual} doesn't match your existing #{expected} pitch drivetrain.",
    
    // Safety
    S001: "Builds with engines over {threshold}HP should have an accessible kill switch for safety.",
    S002: "High-performance builds require redundant throttle return springs.",
    
    // Dependency
    D001: "An engine requires a clutch or torque converter to transfer power to the wheels.",
    D002: "A disc brake caliper needs a rotor to function.",
    
    // Exclusion
    X001: "You already have a {installed} in your build. A {target} would conflict — choose one or the other.",
    
    // Advisory
    A003: "This {partType} is frequently purchased with your {relatedPart} — customers report great results.",
};
```

---

## 8. Edge Cases & Conflict Resolution

### 8.1 Unknown Parts

When encountering parts not in our database:

```
IF part.compatibility IS UNDEFINED:
    RETURN {
        verdict: "WARNING",
        canAdd: true,
        summary: "We don't have compatibility data for this part.",
        message: "This part may work, but we can't verify fitment. 
                  Proceed with caution and verify measurements yourself."
    }
```

### 8.2 Multiple Conflicts

When multiple hard blocks exist, return ALL of them (don't stop at first):

```json
{
    "verdict": "HARD_BLOCK",
    "summary": "This part has 3 compatibility issues that must be resolved.",
    "rules": [
        { "ruleId": "P001", "verdict": "HARD_BLOCK", "message": "..." },
        { "ruleId": "P002", "verdict": "HARD_BLOCK", "message": "..." },
        { "ruleId": "X001", "verdict": "HARD_BLOCK", "message": "..." }
    ]
}
```

### 8.3 Soft Override Flow

For `SOFT_BLOCK` verdicts that can be overridden:

```javascript
interface OverrideRequest {
    partId: string;
    ruleIds: string[];  // Rules being overridden
    acknowledgement: string;  // User's acknowledgement text
    signature: boolean;  // User confirmed understanding
}

// Store overrides for liability
interface OverrideRecord {
    userId: string;
    buildId: string;
    partId: string;
    overriddenRules: string[];
    acknowledgement: string;
    ipAddress: string;
    timestamp: ISO8601;
}
```

### 8.4 Circular Dependencies

Prevent infinite loops in dependency checking:

```javascript
function checkDependencies(part, visited = new Set()) {
    if (visited.has(part.id)) {
        console.warn(`Circular dependency detected: ${part.id}`);
        return { verdict: 'COMPATIBLE' };  // Break cycle gracefully
    }
    visited.add(part.id);
    // ... continue checking
}
```

### 8.5 Version/Year Compatibility

Some parts only fit certain model years:

```javascript
interface YearCompatibility {
    partId: string;
    baseMachineId: string;
    yearStart: number;
    yearEnd: number | null;  // null = current
    notes?: string;
}

// Example: "Fits Yerf-Dog 3203 from 2004-2007 only"
```

---

## 9. Data Structures (Proposed)

> ⚠️ **PENDING DB ARCHITECT APPROVAL** — These are proposed structures. Final schema will be determined by DB Architect.

### 9.1 Core Tables Overview

```
┌─────────────────────┐      ┌─────────────────────┐
│       parts         │      │   base_machines     │
├─────────────────────┤      ├─────────────────────┤
│ id                  │      │ id                  │
│ sku                 │      │ make                │
│ name                │      │ model               │
│ category            │      │ year_start          │
│ risk_tier           │      │ year_end            │
│ dimensions (JSONB)  │      │ specs (JSONB)       │
└─────────────────────┘      └─────────────────────┘
         │                            │
         │                            │
         ▼                            ▼
┌─────────────────────────────────────────────────┐
│              compatibility_rules                 │
├─────────────────────────────────────────────────┤
│ id                                               │
│ rule_code (e.g., "P001")                        │
│ rule_type (P/M/S/D/X/A)                         │
│ source_category                                  │
│ target_category                                  │
│ condition (JSONB - evaluation logic)            │
│ verdict_type                                     │
│ message_template                                 │
│ risk_tier_overrides (JSONB)                     │
│ active                                           │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│           part_compatibility_matrix              │
├─────────────────────────────────────────────────┤
│ part_a_id                                        │
│ part_b_id                                        │
│ relationship (compatible/requires/excludes)     │
│ verified                                         │
│ notes                                            │
└─────────────────────────────────────────────────┘
```

### 9.2 Dimensions Schema (JSONB)

```json
// Example: Clutch dimensions
{
    "bore": { "value": 1.0, "unit": "in", "tolerance": "EXACT" },
    "outer_diameter": { "value": 5.5, "unit": "in", "tolerance": "STANDARD" },
    "engagement_rpm": { "value": 1800, "unit": "rpm", "tolerance": "RANGE", "min": 1600, "max": 2000 },
    "max_torque": { "value": 8, "unit": "ft-lb", "tolerance": "LOOSE" },
    "max_hp": { "value": 6.5, "unit": "hp", "tolerance": "LOOSE" },
    "chain_pitch": { "value": 35, "unit": "chain_size", "tolerance": "EXACT" }
}
```

### 9.3 Rule Condition Schema (JSONB)

```json
// Example: Check if shaft bore matches
{
    "type": "DIMENSION_MATCH",
    "source": { "from": "INSTALLED", "category": "engine", "dimension": "shaft_diameter" },
    "target": { "dimension": "bore" },
    "tolerance": "EXACT",
    "on_mismatch": "HARD_BLOCK"
}

// Example: Check if power is within rating
{
    "type": "RANGE_CHECK",
    "source": { "from": "INSTALLED", "category": "engine", "dimension": "horsepower" },
    "target": { "dimension": "max_hp" },
    "operator": "LTE",
    "on_exceed": "WARNING",
    "message_key": "POWER_EXCEEDS_RATING"
}

// Example: Mutual exclusion
{
    "type": "EXCLUSION",
    "excludes_categories": ["torque_converter"],
    "on_conflict": "HARD_BLOCK",
    "message_key": "CLUTCH_TC_CONFLICT"
}
```

---

## 10. Frontend Handoff Notes

### 10.1 What Frontend Receives

The compatibility engine will provide a single endpoint:

```
POST /api/compatibility/check

Request:
{
    "baseMachineId": "gkm-208",
    "installedParts": ["part-123", "part-456"],
    "targetPartId": "part-789",
    "userId": "user-abc" // Optional, for personalized risk tiers
}

Response: CompatibilityPayload (see Section 7.1)
```

### 10.2 UI Rendering Guidelines

| Verdict | UI Treatment |
|---------|--------------|
| `HARD_BLOCK` | Red badge, disabled "Add to Cart", show all conflict reasons |
| `SOFT_BLOCK` | Orange badge, "Add Anyway" with confirmation modal |
| `WARNING` | Yellow badge, show inline warning, allow add |
| `NOTICE` | Gray info icon, collapsible detail |
| `COMPATIBLE` | Green checkmark or no indicator |
| `RECOMMENDED` | Green "Great Choice!" badge |
| `REQUIRED` | Purple "Needed" badge, auto-add suggestion prominent |

### 10.3 Suggested User Flows

**Hard Block Flow:**
```
User clicks "Add to Cart"
  → API returns HARD_BLOCK
  → Show modal: "This part won't fit"
  → Display all blocking reasons with dimension mismatches
  → CTA: "View Compatible Alternatives"
  → Redirect to filtered catalog
```

**Soft Block Flow:**
```
User clicks "Add to Cart"
  → API returns SOFT_BLOCK
  → Show modal: "Are you sure?"
  → Display risks and warnings
  → Checkbox: "I understand and accept the risks"
  → Button: "Add Anyway" (requires checkbox)
  → Log override for liability
```

**Required Dependency Flow:**
```
User adds disc brake caliper
  → API returns REQUIRED (needs rotor)
  → Show inline suggestion: "You'll also need..."
  → One-click "Add Both" button
  → Or dismiss to add individually
```

### 10.4 Mobile Considerations

- Payload includes `summary` (short) and `message` (detailed)
- Use `summary` for mobile inline display
- Use `message` for expanded/modal views
- All suggestions have pre-built `action` endpoints

---

## 11. DB Architect Handoff Notes

### 11.1 Schema Requirements

The compatibility engine requires the following data model support:

#### Required Tables
1. **`parts`** — Core part catalog with JSONB `dimensions` column
2. **`base_machines`** — Reference karts/chassis with JSONB `specs`
3. **`compatibility_rules`** — Rule definitions with JSONB `condition`
4. **`part_compatibility_matrix`** — Direct part-to-part relationships
5. **`user_overrides`** — Audit log of soft block overrides

#### Required Columns on `parts`
- `risk_tier` (INT, 0-5)
- `category` (ENUM or FK to categories)
- `dimensions` (JSONB)
- `requires_parts` (INT[] or junction table)
- `excludes_parts` (INT[] or junction table)

### 11.2 Performance Considerations

1. **Index `dimensions` JSONB** using GIN index for path queries
2. **Denormalize common lookups** — Consider computed columns for:
   - `shaft_diameter` (extracted from dimensions)
   - `chain_pitch` (extracted from dimensions)
   - `bore_size` (extracted from dimensions)
3. **Materialized view** for pre-computed compatibility pairs
4. **Partition `user_overrides`** by date (audit logs grow fast)

### 11.3 Suggested Indexes

```sql
-- Fast dimension lookups
CREATE INDEX idx_parts_dimensions ON parts USING GIN (dimensions);

-- Category + dimension combo queries
CREATE INDEX idx_parts_category_bore ON parts (category, (dimensions->>'bore'));

-- Rule lookups by type and category
CREATE INDEX idx_rules_lookup ON compatibility_rules (rule_type, source_category, target_category);

-- Override audit queries
CREATE INDEX idx_overrides_user_time ON user_overrides (user_id, timestamp DESC);
```

### 11.4 Open Questions for DB Architect

1. **JSONB vs Normalized?**
   - Should dimensions be a separate `part_dimensions` table?
   - Trade-off: Query flexibility vs. join complexity

2. **Rule Storage:**
   - Store rules in DB (admin-editable) or code (version-controlled)?
   - Recommendation: Hybrid — DB for overrides, code for base rules

3. **Compatibility Caching:**
   - Materialized view refreshed daily?
   - Redis cache with 24hr TTL?
   - Computed on-demand with client caching?

4. **Multi-tenancy:**
   - Will there be multiple storefronts with different rules?
   - Should rules be tenant-scoped?

---

## Appendix A: Rule Registry

Complete list of initial rules to implement:

| Code | Name | Type | Severity | Description |
|------|------|------|----------|-------------|
| P001 | Bolt Pattern | Physical | HARD_BLOCK | Mount patterns must match |
| P002 | Shaft Bore | Physical | HARD_BLOCK | Bore must fit shaft |
| P003 | Chain Pitch | Physical | HARD_BLOCK | Chain and sprockets must match |
| P004 | Physical Space | Physical | HARD_BLOCK | Part must fit in available space |
| P005 | Voltage Match | Physical | HARD_BLOCK | Electrical compatibility |
| M001 | Gear Ratio | Mechanical | WARNING | Final drive in usable range |
| M002 | Power Rating | Mechanical | WARNING | Component rated for power |
| M003 | Brake Capacity | Mechanical | SOFT_BLOCK | Brakes sufficient for speed |
| M004 | Suspension Travel | Mechanical | WARNING | Components allow full travel |
| S001 | Kill Switch | Safety | WARNING→REQUIRED | Engine needs kill switch |
| S002 | Throttle Return | Safety | REQUIRED | Redundant throttle return |
| S003 | Brake Redundancy | Safety | WARNING | Backup brake for speed |
| S004 | Chain Guard | Safety | REQUIRED | Guard for youth builds |
| D001 | Engine→Clutch | Dependency | REQUIRED | Engine needs engagement |
| D002 | Caliper→Rotor | Dependency | REQUIRED | Disc brake needs rotor |
| D003 | Carb→Filter | Dependency | WARNING | Air filter recommended |
| X001 | Clutch⊕TC | Exclusion | HARD_BLOCK | Choose one engagement method |
| X002 | Drum⊕Disc | Exclusion | HARD_BLOCK | One brake type per position |
| X003 | Live⊕Dead | Exclusion | HARD_BLOCK | Axle type is fundamental |
| A001 | Same Brand | Advisory | NOTICE | Matching brands integrate better |
| A002 | Upgrade Path | Advisory | RECOMMENDED | Enables future upgrades |
| A003 | Popular Combo | Advisory | RECOMMENDED | Frequently paired |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Bore** | Internal diameter of a hole (e.g., clutch center hole) |
| **Shaft** | External diameter of a rod (e.g., engine crankshaft) |
| **Chain Pitch** | Distance between chain pins (#35 = 3/8", #40 = 1/2", #41 = 1/2") |
| **Sprocket** | Toothed wheel that engages chain |
| **Clutch** | Centrifugal engagement device (engages at specific RPM) |
| **Torque Converter** | CVT-style variable ratio engagement device |
| **Live Axle** | Axle that drives both rear wheels together |
| **Dead Axle** | Non-driving axle (wheel hubs spin independently) |
| **Band Brake** | Drum-style brake using friction band |
| **Disc Brake** | Caliper-style brake using rotor and pads |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-16 | Compatibility Agent | Initial design |

---

*End of document*
