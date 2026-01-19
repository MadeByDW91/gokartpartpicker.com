# A4: Error Handling & Polish

**Agent:** A4 (Backend)  
**Status:** 🟡 In Progress

---

```markdown
You are Agent A4: Backend.

All core features are built. Now add proper error handling, error boundaries,
and user-friendly error messages throughout the application.

TASK: Implement Error Handling & Polish

## Files to Create/Update

### 1. Error Pages
- `src/app/not-found.tsx` — Custom 404 page
- `src/app/error.tsx` — Global error boundary
- `src/app/global-error.tsx` — Root error boundary (if needed)

### 2. Error Boundaries
- `src/components/ErrorBoundary.tsx` — Reusable error boundary component
- Wrap critical sections in builder, admin, etc.

### 3. Error Handling in Server Actions
Update existing server actions to:
- Return user-friendly error messages
- Log errors properly (console.error with context)
- Handle edge cases gracefully

### 4. Loading States
- Ensure all async operations show loading states
- Add error states to hooks (useEngines, useParts, etc.)

## Error Page Design

404 Page:
- Friendly message: "Oops! This page doesn't exist"
- Link back to home
- Search suggestions
- Match dark theme

Error Page:
- Friendly message: "Something went wrong"
- Error ID for support (if logged)
- Refresh button
- Report issue link

## Error Messages

Make all error messages user-friendly:
- ❌ "Database error: PGRST116" 
- ✅ "Engine not found. It may have been removed."

- ❌ "Failed to fetch"
- ✅ "Unable to load engines. Please try again."

## Success Criteria

- [ ] 404 page exists and works
- [ ] Error boundary catches React errors
- [ ] Server action errors are user-friendly
- [ ] Loading states show during async operations
- [ ] Error states display in UI
- [ ] No technical error messages shown to users
- [ ] Errors are logged for debugging

## DO NOT

- Do NOT expose database errors to users
- Do NOT show stack traces in production
- Do NOT break existing functionality
```
