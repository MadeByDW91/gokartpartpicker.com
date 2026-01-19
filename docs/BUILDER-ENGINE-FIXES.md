# Builder & Engine Page Error Fixes

## Issues Fixed

### 1. Missing `is_active` Filter in Hooks
**Problem**: The `useEngines` and `useParts` hooks were not filtering for active items, which could cause RLS policy issues or return inactive items.

**Fix**: Added `.eq('is_active', true)` to all queries in:
- `useEngines()` - Now only returns active engines
- `useEngine()` - Now only returns active engines
- `useEngineBrands()` - Now only includes brands from active engines
- `useParts()` - Now only returns active parts
- `usePart()` - Now only returns active parts
- `usePartBrands()` - Now only includes brands from active parts

### 2. Error Handling Improvements
**Problem**: Hooks were throwing errors without proper logging, making debugging difficult.

**Fix**: Added console.error logging for all database errors in hooks.

### 3. Builder Page Error Handling
**Problem**: Missing error handling in useEffect hooks could cause silent failures.

**Fix**: 
- Added try-catch blocks in template loading
- Added try-catch blocks in build loading
- Added error handling in engine loading from URL
- Fixed `Object.keys(selectedParts).length` to `selectedParts.size` for Map

### 4. Recommendations Panel
**Problem**: Recommendations panel was showing even when no engine was selected.

**Fix**: Added conditional rendering - only show recommendations when an engine is selected.

## Files Modified

1. `frontend/src/hooks/use-engines.ts`
   - Added `is_active` filter to all queries
   - Added error logging

2. `frontend/src/hooks/use-parts.ts`
   - Added `is_active` filter to all queries
   - Added error logging

3. `frontend/src/app/builder/page.tsx`
   - Fixed template loading (Map size check)
   - Added error handling in all useEffect hooks
   - Conditional rendering for RecommendationsPanel

## Testing Checklist

- [ ] Engines page loads without errors
- [ ] Engines display correctly
- [ ] Parts page loads without errors
- [ ] Parts display correctly
- [ ] Builder page loads without errors
- [ ] Engine selection works
- [ ] Part selection works
- [ ] Tab navigation works
- [ ] Progress bar updates correctly
- [ ] Build summary displays correctly
- [ ] Save build works
- [ ] Share build works
- [ ] Template loading works
- [ ] Build loading from URL works

## Notes

- All queries now properly filter for active items
- Error logging helps with debugging
- The builder redesign is complete with tab-based navigation
- All TypeScript errors have been resolved
