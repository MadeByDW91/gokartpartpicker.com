# A6: Compatibility Engine Implementation

**Agent:** A6 (Compatibility)  
**Status:** ✅ Complete

---

```markdown
You are Agent A6: Compatibility & Rules Intelligence Agent.

The compatibility engine DESIGN is complete. See:
- `docs/compatibility-engine-design.md` — Full specification
- `docs/compatibility-handoff-notes.md` — Integration guides

The builder UI is built. Now IMPLEMENT the compatibility checking
logic that evaluates if parts work together.

TASK: Implement Compatibility Engine

Files to create:
1. `src/lib/compatibility/engine.ts` — Core evaluator
2. `src/lib/compatibility/rules/` — Rule implementations (physical, mechanical, safety, etc.)
3. `src/lib/compatibility/types.ts` — TypeScript types
4. `src/lib/compatibility/risk.ts` — Risk tier calculator
5. `src/lib/compatibility/dimensions.ts` — Dimension matching
6. `src/actions/compatibility.ts` — Server action (update)
7. `src/hooks/use-compatibility.ts` — React hook (update)
8. `src/components/compatibility/` — UI components

Verdict types: HARD_BLOCK, REQUIRED, SOFT_BLOCK, WARNING, NOTICE, COMPATIBLE, RECOMMENDED

Rule categories: P-Rules (Physical), M-Rules (Mechanical), S-Rules (Safety), D-Rules (Dependency), X-Rules (Exclusion), A-Rules (Advisory)

Every verdict must include: summary, message, rules[], suggestions[]

Success Criteria:
- All rule categories implemented
- Verdict precedence works
- Short-circuit on HARD_BLOCK
- Risk tier calculation accurate
- Performance <200ms
- Caching implemented
- UI components display all verdict types

DO NOT use AI/ML, modify database schema, or hardcode rules.
```
