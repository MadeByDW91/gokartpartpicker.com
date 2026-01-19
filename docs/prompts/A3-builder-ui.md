# A3: Builder UI

**Agent:** A3 (UI)  
**Status:** ⏳ Pending

---

```markdown
You are Agent A3: UI.

Engine and parts pages are complete. Now build the core builder
interface where users configure their go-kart build.

TASK: Build the Build Configurator

File: `src/app/builder/page.tsx`

The builder is the core feature. Users:
1. Select an engine
2. Add compatible parts by category
3. See compatibility warnings
4. Save their build (if logged in)
5. Share their build (public link)

Builder flow:
1. Select Engine (show engine cards)
2. Add Parts by category (category tabs, parts grid)
3. Review & Save (summary, save/share)

Use Zustand store: `src/store/build-store.ts`

Components to create:
- `src/components/builder/EngineSelector.tsx`
- `src/components/builder/CategoryPartsList.tsx`
- `src/components/builder/BuildSummary.tsx`
- `src/components/builder/CompatibilityBadge.tsx`

URL state support:
- `/builder` — Fresh start
- `/builder?engine=predator-212` — Pre-select engine
- `/builder?build=abc123` — Load existing build

Success Criteria:
- Engine selection works
- Parts organized by category
- Add/remove parts works
- Build summary updates live
- Compatibility warnings display
- Save build works (auth required)
- Share generates public link
- Mobile responsive

DO NOT modify server actions or database schema.
```
