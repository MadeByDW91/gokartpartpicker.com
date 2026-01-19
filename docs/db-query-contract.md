# Database Query Contract

> This document defines the API contract between the Frontend and Backend/Database layers.
> The Frontend MUST use these exact query patterns and MUST NOT modify database logic.

---

## Table of Contents

1. [Database Schema Overview](#database-schema-overview)
2. [Query Endpoints](#query-endpoints)
3. [Response Types](#response-types)
4. [Compatibility Rules](#compatibility-rules)
5. [Authentication Requirements](#authentication-requirements)

---

## Database Schema Overview

### Tables

#### `engines`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Engine name/model |
| brand | text | Manufacturer brand |
| displacement_cc | integer | Engine displacement in CC |
| horsepower | decimal | Rated horsepower |
| torque | decimal | Torque (lb-ft) |
| shaft_diameter | decimal | Output shaft diameter (inches) |
| shaft_length | decimal | Output shaft length (inches) |
| shaft_type | text | Shaft type (straight, tapered, threaded) |
| mount_type | text | Mounting pattern type |
| price | decimal | Price in USD |
| image_url | text | Product image URL |
| affiliate_url | text | Affiliate purchase link |
| created_at | timestamp | Record creation date |

#### `parts`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text | URL-friendly identifier (unique) |
| name | text | Part name |
| category | part_category | Part category enum (26 values) |
| category_id | uuid | FK to part_categories table |
| brand | text | Manufacturer brand |
| specifications | jsonb | Category-specific specs |
| price | decimal | Price in USD |
| image_url | text | Product image URL |
| affiliate_url | text | Affiliate purchase link |
| is_active | boolean | Visible in catalog (default: true) |
| created_at | timestamp | Record creation date |
| updated_at | timestamp | Last update date |

#### `compatibility_rules`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| rule_type | text | Type of rule (shaft_match, chain_pitch, bolt_pattern, etc.) |
| source_category | text | Source part category |
| target_category | text | Target part category |
| condition | jsonb | Rule condition logic |
| warning_message | text | User-facing warning message |

#### `builds`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner user ID (FK to auth.users) |
| name | text | Build name |
| description | text | Build description |
| engine_id | uuid | Selected engine (FK) |
| parts | jsonb | Selected parts by category |
| total_price | decimal | Calculated total price |
| is_public | boolean | Whether build is publicly visible |
| created_at | timestamp | Record creation date |
| updated_at | timestamp | Last update date |

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (FK to auth.users) |
| username | text | Display username |
| avatar_url | text | Profile avatar URL |
| created_at | timestamp | Record creation date |

---

## Query Endpoints

### Engines

#### `GET /api/engines`
Fetch all engines with optional filters.

**Query Parameters:**
- `brand` (optional): Filter by brand
- `min_hp` (optional): Minimum horsepower
- `max_hp` (optional): Maximum horsepower
- `min_cc` (optional): Minimum displacement
- `max_cc` (optional): Maximum displacement
- `shaft_type` (optional): Filter by shaft type
- `sort` (optional): Sort field (price, horsepower, displacement_cc)
- `order` (optional): Sort order (asc, desc)

**Supabase Query Pattern:**
```typescript
const { data, error } = await supabase
  .from('engines')
  .select('*')
  .order(sort, { ascending: order === 'asc' });
```

**Response Type:** `Engine[]`

---

#### `GET /api/engines/:id`
Fetch single engine by ID.

**Supabase Query Pattern:**
```typescript
const { data, error } = await supabase
  .from('engines')
  .select('*')
  .eq('id', id)
  .single();
```

**Response Type:** `Engine`

---

### Parts

#### `GET /api/parts`
Fetch all parts with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `sort` (optional): Sort field
- `order` (optional): Sort order

**Supabase Query Pattern:**
```typescript
const { data, error } = await supabase
  .from('parts')
  .select('*')
  .eq('category', category) // if provided
  .order(sort, { ascending: order === 'asc' });
```

**Response Type:** `Part[]`

---

#### `GET /api/parts/:id`
Fetch single part by ID.

**Response Type:** `Part`

---

#### `GET /api/parts/categories`
Fetch available part categories.

**Response:**
```typescript
// All 26 categories from database enum
const PART_CATEGORIES = [
  // Drive train
  'clutch', 'torque_converter', 'chain', 'sprocket',
  // Chassis
  'axle', 'wheel', 'tire', 'brake', 'throttle', 'frame',
  // Engine performance
  'carburetor', 'exhaust', 'air_filter', 'camshaft', 'valve_spring',
  'flywheel', 'ignition', 'connecting_rod', 'piston', 'crankshaft',
  'oil_system', 'header', 'fuel_system', 'gasket', 'hardware', 'other'
] as const;
```

---

### Compatibility

#### `GET /api/compatibility/check`
Check compatibility between selected parts.

**Request Body:**
```typescript
{
  engine_id?: string;
  parts: {
    [category: string]: string; // part_id
  }
}
```

**Supabase Query Pattern:**
```typescript
// Fetch all relevant compatibility rules
const { data: rules } = await supabase
  .from('compatibility_rules')
  .select('*');

// Frontend applies rules to selected parts
// Returns warnings array
```

**Response Type:**
```typescript
{
  compatible: boolean;
  warnings: {
    type: 'error' | 'warning' | 'info';
    source: string; // source part/category
    target: string; // target part/category
    message: string;
  }[]
}
```

---

### Builds

#### `GET /api/builds` (Auth Required)
Fetch user's saved builds.

**Supabase Query Pattern:**
```typescript
const { data, error } = await supabase
  .from('builds')
  .select(`
    *,
    engine:engines(*),
    profile:profiles(username, avatar_url)
  `)
  .eq('user_id', user.id)
  .order('updated_at', { ascending: false });
```

**Response Type:** `Build[]`

---

#### `GET /api/builds/public`
Fetch public/community builds.

**Supabase Query Pattern:**
```typescript
const { data, error } = await supabase
  .from('builds')
  .select(`
    *,
    engine:engines(name, brand, horsepower),
    profile:profiles(username, avatar_url)
  `)
  .eq('is_public', true)
  .order('created_at', { ascending: false })
  .limit(20);
```

---

#### `POST /api/builds` (Auth Required)
Create a new build.

**Request Body:**
```typescript
{
  name: string;
  description?: string;
  engine_id?: string;
  parts: { [category: string]: string };
  is_public?: boolean;
}
```

---

#### `PUT /api/builds/:id` (Auth Required)
Update an existing build.

---

#### `DELETE /api/builds/:id` (Auth Required)
Delete a build.

---

## Response Types

```typescript
// Engine type
interface Engine {
  id: string;
  name: string;
  brand: string;
  displacement_cc: number;
  horsepower: number;
  torque: number;
  shaft_diameter: number;
  shaft_length: number;
  shaft_type: 'straight' | 'tapered' | 'threaded';
  mount_type: string;
  price: number;
  image_url: string | null;
  affiliate_url: string | null;
  created_at: string;
}

// Part type
interface Part {
  id: string;
  name: string;
  category: PartCategory;
  brand: string;
  specifications: Record<string, unknown>;
  price: number;
  image_url: string | null;
  affiliate_url: string | null;
  created_at: string;
}

// All 26 categories - matches database enum `part_category`
type PartCategory = 
  // Drive train
  | 'clutch' | 'torque_converter' | 'chain' | 'sprocket'
  // Chassis
  | 'axle' | 'wheel' | 'tire' | 'brake' | 'throttle' | 'frame'
  // Engine performance
  | 'carburetor' | 'exhaust' | 'air_filter' | 'camshaft' | 'valve_spring'
  | 'flywheel' | 'ignition' | 'connecting_rod' | 'piston' | 'crankshaft'
  | 'oil_system' | 'header' | 'fuel_system' | 'gasket' | 'hardware' | 'other';

// Build type
interface Build {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  engine_id: string | null;
  parts: { [category: string]: string };
  total_price: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  engine?: Engine;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

// Compatibility Warning
interface CompatibilityWarning {
  type: 'error' | 'warning' | 'info';
  source: string;
  target: string;
  message: string;
}
```

---

## Compatibility Rules

### Shaft Compatibility
- **Clutch ↔ Engine**: Clutch bore must match engine shaft diameter
- **Torque Converter ↔ Engine**: TC bore must match engine shaft diameter

### Chain Compatibility  
- **Chain ↔ Sprocket**: Chain pitch must match sprocket pitch
- **Driver Sprocket ↔ Driven Sprocket**: Must use same chain pitch

### Bolt Pattern Compatibility
- **Wheel ↔ Axle**: Wheel bolt pattern must match axle hub pattern
- **Brake Disc ↔ Axle**: Brake mount must be compatible with axle

### Size Compatibility
- **Tire ↔ Wheel**: Tire size must be compatible with wheel diameter

---

## Authentication Requirements

### Public Endpoints (No Auth)
- `GET /api/engines`
- `GET /api/engines/:id`
- `GET /api/parts`
- `GET /api/parts/:id`
- `GET /api/parts/categories`
- `GET /api/compatibility/check`
- `GET /api/builds/public`

### Protected Endpoints (Auth Required)
- `GET /api/builds` - User's own builds
- `POST /api/builds` - Create build
- `PUT /api/builds/:id` - Update own build
- `DELETE /api/builds/:id` - Delete own build

### Auth Provider
Supabase Auth with the following methods:
- Email/Password signup and login
- Magic link (email)
- OAuth (Google, optional)

---

## Frontend Usage Notes

1. **Never modify database directly** - Always use the provided query patterns
2. **Handle loading states** - All queries should show loading indicators
3. **Handle errors gracefully** - Display user-friendly error messages
4. **Cache appropriately** - Use React Query or SWR for caching
5. **Validate compatibility client-side** - Use the rules from `compatibility_rules` table
6. **Display warnings prominently** - Compatibility issues should be clearly visible
