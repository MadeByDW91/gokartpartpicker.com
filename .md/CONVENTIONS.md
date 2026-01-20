# Project Atlas — Coding Conventions

> This document defines the coding standards for all agents working on Project Atlas.

---

## TypeScript

### Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

### Type Definitions

```typescript
// ✅ Prefer interfaces for object shapes
interface User {
  id: string
  email: string
  name: string
}

// ✅ Use type for unions and intersections
type UserRole = 'user' | 'admin' | 'super_admin'
type UserWithRole = User & { role: UserRole }

// ✅ Export types with `type` keyword
export type { User, UserRole }

// ✅ Use `unknown` instead of `any`
function parseJSON(input: string): unknown {
  return JSON.parse(input)
}

// ❌ Never use `any`
function bad(data: any) { } // FORBIDDEN
```

### Function Signatures

```typescript
// ✅ Explicit return types
async function getUser(id: string): Promise<User | null> {
  // ...
}

// ✅ Use arrow functions for callbacks
const users = data.map((item) => transformUser(item))

// ✅ Destructure in parameters when appropriate
function updateUser({ id, name }: { id: string; name: string }) {
  // ...
}
```

---

## React

### Component Structure

```typescript
// ✅ Standard component structure
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

// Types at top
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

// Named export (no default exports)
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'base-styles',
        variant === 'primary' && 'primary-styles',
        size === 'sm' && 'small-styles',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Server vs Client Components

```typescript
// Default: Server Component (no directive needed)
export async function EngineList() {
  const engines = await db.select().from(engines)
  return <div>{/* ... */}</div>
}

// Only when needed: Client Component
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Event Handlers

```typescript
// ✅ Use handle* prefix for event handlers
function Form() {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // ...
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // ...
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

---

## Tailwind CSS

### Class Organization

Order classes by category:

```tsx
<div
  className={cn(
    // 1. Layout
    'flex items-center justify-between',
    // 2. Spacing
    'p-4 gap-2',
    // 3. Sizing
    'w-full max-w-md',
    // 4. Typography
    'text-sm font-medium',
    // 5. Colors
    'bg-neutral-900 text-neutral-100',
    // 6. Borders
    'border border-neutral-700 rounded-lg',
    // 7. Effects
    'shadow-lg',
    // 8. Transitions
    'transition-colors duration-200',
    // 9. States (hover, focus, etc.)
    'hover:bg-neutral-800 focus:ring-2',
    // 10. Responsive
    'md:flex-row lg:p-6',
    // 11. Conditional/dynamic (last)
    isActive && 'ring-2 ring-orange-500'
  )}
>
```

### Design Tokens

Use CSS variables for theme values:

```css
/* globals.css */
:root {
  --color-bg-primary: 23 23 23;      /* neutral-900 */
  --color-bg-secondary: 38 38 38;    /* neutral-800 */
  --color-text-primary: 245 245 245; /* neutral-100 */
  --color-accent: 249 115 22;        /* orange-500 */
  --color-accent-hover: 234 88 12;   /* orange-600 */
}
```

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      }
    }
  }
}
```

---

## Database (Drizzle ORM)

### Schema Definitions

```typescript
// src/db/schema/engines.ts
import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core'

export const engines = pgTable('engines', {
  // Primary key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Required fields
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  brand: varchar('brand', { length: 50 }).notNull(),
  
  // Optional fields
  description: varchar('description', { length: 5000 }),
  
  // Numeric fields
  displacementCc: integer('displacement_cc').notNull(),
  horsepower: integer('horsepower'),
  
  // Timestamps (always include)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Export type inference
export type Engine = typeof engines.$inferSelect
export type NewEngine = typeof engines.$inferInsert
```

### Queries

```typescript
// ✅ Use query builder for simple queries
const allEngines = await db.select().from(engines)

// ✅ Use conditions with drizzle helpers
import { eq, and, ilike } from 'drizzle-orm'

const engine = await db.query.engines.findFirst({
  where: eq(engines.slug, slug)
})

// ✅ Use transactions for multi-step operations
await db.transaction(async (tx) => {
  await tx.insert(builds).values(buildData)
  await tx.insert(buildParts).values(partsData)
})
```

---

## Server Actions

### Structure

```typescript
// src/actions/engines.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/server'
import { engineSchema } from '@/lib/validation/engines'
import { db } from '@/db'
import { engines } from '@/db/schema'
import type { ActionResult } from '@/types'

export async function createEngine(
  formData: FormData
): Promise<ActionResult<Engine>> {
  try {
    // 1. Verify authentication
    const session = await requireAuth()
    
    // 2. Validate input
    const raw = Object.fromEntries(formData)
    const parsed = engineSchema.safeParse(raw)
    
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors
      }
    }
    
    // 3. Perform operation
    const [engine] = await db
      .insert(engines)
      .values(parsed.data)
      .returning()
    
    // 4. Revalidate cache
    revalidatePath('/engines')
    revalidatePath('/admin/engines')
    
    // 5. Return result
    return { success: true, data: engine }
    
  } catch (error) {
    console.error('createEngine error:', error)
    return { success: false, error: 'Failed to create engine' }
  }
}
```

### Action Result Types

```typescript
// src/types/api.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

---

## Validation (Zod)

### Schema Definition

```typescript
// src/lib/validation/engines.ts
import { z } from 'zod'

export const engineSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be under 100 characters'),
  
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
    .max(100),
  
  brand: z
    .string()
    .min(1, 'Brand is required'),
  
  displacementCc: z
    .number()
    .int('Must be a whole number')
    .positive('Must be positive')
    .max(1000, 'Displacement seems too high'),
  
  description: z
    .string()
    .max(5000)
    .optional(),
})

export type EngineInput = z.infer<typeof engineSchema>
```

### Form Validation

```typescript
// Client-side validation with react-hook-form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<EngineInput>({
  resolver: zodResolver(engineSchema),
  defaultValues: {
    name: '',
    slug: '',
  }
})
```

---

## Error Handling

### Custom Errors

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const Errors = {
  NOT_FOUND: (resource: string) => 
    new AppError('NOT_FOUND', `${resource} not found`, 404),
  UNAUTHORIZED: () => 
    new AppError('UNAUTHORIZED', 'You must be logged in', 401),
  FORBIDDEN: () => 
    new AppError('FORBIDDEN', 'You do not have permission', 403),
  VALIDATION: (message: string) => 
    new AppError('VALIDATION', message, 400),
}
```

### Error Handling Pattern

```typescript
try {
  // Operation that might fail
  const result = await riskyOperation()
  return result
} catch (error) {
  if (error instanceof AppError) {
    // Known application error
    return { success: false, error: error.message }
  }
  
  // Unknown error - log and return generic message
  console.error('Unexpected error:', error)
  return { success: false, error: 'An unexpected error occurred' }
}
```

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| React Component | kebab-case.tsx | `engine-card.tsx` |
| Server Action | kebab-case.ts | `engines.ts` |
| Hook | use-kebab-case.ts | `use-auth.ts` |
| Utility | kebab-case.ts | `utils.ts` |
| Schema | singular.ts | `engine.ts` |
| Type | kebab-case.ts | `database.ts` |
| Test | *.spec.ts | `auth.spec.ts` |
| Constant | SCREAMING_SNAKE | `MAX_FILE_SIZE` |

---

## Import Order

```typescript
// 1. React/Next core
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// 2. External packages (alphabetical)
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// 3. Internal absolute imports (alphabetical by path)
import { db } from '@/db'
import { engines } from '@/db/schema'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// 4. Relative imports
import { EngineSpecs } from './engine-specs'
import { styles } from './styles'

// 5. Type imports (always last)
import type { Engine } from '@/types'
import type { ComponentProps } from 'react'
```

---

## Comments

```typescript
// ✅ Use comments to explain WHY, not WHAT
// Predator 212 has a non-standard shaft size that requires
// checking both metric and imperial compatibility rules
const isCompatible = checkShaftSize(engine, part)

// ✅ Use JSDoc for public APIs
/**
 * Evaluates compatibility between an engine and a list of parts.
 * @param engineId - The engine to check against
 * @param partIds - Array of part IDs to evaluate
 * @returns Compatibility result with any conflicts
 */
export function evaluateCompatibility(
  engineId: string,
  partIds: string[]
): CompatibilityResult {
  // ...
}

// ✅ Use TODO with ticket reference
// TODO(ATLAS-123): Add caching for compatibility results

// ❌ Avoid obvious comments
// Get the user from database
const user = await getUser(id) // This comment adds nothing
```

---

## Testing

### Unit Test Structure

```typescript
// tests/unit/compatibility.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { evaluateCompatibility } from '@/lib/compatibility/evaluator'

describe('evaluateCompatibility', () => {
  describe('when parts are compatible', () => {
    it('returns success with no conflicts', () => {
      const result = evaluateCompatibility('engine-1', ['part-1', 'part-2'])
      
      expect(result.compatible).toBe(true)
      expect(result.conflicts).toHaveLength(0)
    })
  })

  describe('when parts have conflicts', () => {
    it('returns conflicts with explanations', () => {
      const result = evaluateCompatibility('engine-1', ['part-1', 'part-3'])
      
      expect(result.compatible).toBe(false)
      expect(result.conflicts[0]).toMatchObject({
        type: 'shaft_size',
        message: expect.stringContaining('incompatible')
      })
    })
  })
})
```

### E2E Test Structure

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to register
    await page.goto('/register')
    
    // Fill form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })
})
```

---

*Last Updated: Day 0*
*Owner: A0 (Architect)*
