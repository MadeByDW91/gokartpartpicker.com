# Authentication & Saved Builds Implementation

## Overview

This document describes the implementation of user authentication and saved builds functionality for GoKart Part Picker.

## Features Implemented

### 1. User Authentication
- **Sign Up**: Users can create accounts with email/password
- **Log In**: Users can authenticate with email/password
- **Log Out**: Users can sign out
- **Session Management**: JWT-based sessions using NextAuth.js v5 (Auth.js)

### 2. Saved Builds
- **Create Builds**: Users can save their current build configuration
- **View Builds**: Users can see all their saved builds on `/my-builds`
- **Load Builds**: Users can load a saved build into the builder
- **Update Builds**: Users can update existing saved builds
- **Delete Builds**: Users can delete saved builds
- **Build Limit**: Hard limit of 10 builds per user (enforced server-side)

## Technical Implementation

### Database Schema

#### User Model
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  builds       SavedBuild[]
}
```

#### SavedBuild Model
```prisma
model SavedBuild {
  id          String   @id @default(cuid())
  userId      String
  name        String   @db.VarChar(60)
  description String?  @db.Text
  data        Json     // Full build configuration
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(...)
}
```

### Authentication Setup

**NextAuth.js v5 (Auth.js) Configuration:**
- Location: `lib/auth.ts`
- Provider: Credentials (email/password)
- Session Strategy: JWT
- Secret: `AUTH_SECRET` environment variable

**Auth Pages:**
- `/login` - Login page
- `/signup` - Sign up page

**Auth Helpers:**
- `lib/auth-helpers.ts` - Server-side auth utilities
  - `getCurrentUser()` - Get current session user
  - `requireAuth()` - Require authentication (throws if not authenticated)
  - `getCurrentUserFromDb()` - Get full user from database

### API Routes

#### Authentication
- `POST /api/auth/signup` - Create new user account
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

#### Builds
- `GET /api/builds` - List user's builds
- `POST /api/builds` - Create new build (enforces 10 build limit)
- `GET /api/builds/[id]` - Get build by ID (ownership check)
- `PUT /api/builds/[id]` - Update build (ownership check)
- `DELETE /api/builds/[id]` - Delete build (ownership check)

### Pages

#### `/login`
- Email/password login form
- Redirects to `/build` on success
- Link to signup page

#### `/signup`
- Registration form (name optional, email/password required)
- Password minimum 8 characters
- Redirects to login on success

#### `/my-builds`
- Lists all user's saved builds
- Shows build count (X of 10)
- Load, Update, Delete actions
- Empty state with CTA
- Redirects to login if not authenticated

#### `/build` (Updated)
- Added "Save Build" button
- Loads saved builds via `?load=buildId` query parameter
- Shows current saved build ID if loaded from saved build

### Components

#### `SessionProvider`
- Wraps app with NextAuth SessionProvider
- Location: `components/SessionProvider.tsx`

#### `AuthNav`
- Navigation component showing auth status
- Shows "Log In" / "Sign Up" when not authenticated
- Shows user email and "My Builds" / "Log Out" when authenticated
- Location: `components/AuthNav.tsx`

#### `SaveBuildButton`
- Save/Update build button with modal
- Handles both create and update
- Shows error messages (including build limit)
- Redirects to login if not authenticated
- Location: `components/SaveBuildButton.tsx`

### Build Store Updates

**New Methods:**
- `loadBuild(engine, parts, savedBuildId)` - Load build data into store
- `setSavedBuildId(id)` - Set current saved build ID
- `currentSavedBuildId` - Track which saved build is currently loaded

### Security Features

1. **Password Hashing**: bcryptjs with salt rounds of 10
2. **Ownership Checks**: All build operations verify user ownership
3. **Server-Side Validation**: Zod schemas validate all inputs
4. **Build Limit Enforcement**: Server-side check prevents exceeding 10 builds
5. **Protected Routes**: API routes require authentication

### Environment Variables

Add to `.env`:
```
AUTH_SECRET="your-secret-key-here"
```

Generate secret:
```bash
openssl rand -base64 32
```

## Migration

Run the migration to add User and SavedBuild models:
```bash
npm run db:migrate
```

## Testing Checklist

### Authentication
- [ ] Sign up with new email
- [ ] Sign up with existing email (should fail)
- [ ] Log in with correct credentials
- [ ] Log in with incorrect credentials (should fail)
- [ ] Log out
- [ ] Session persists across page refreshes

### Saved Builds
- [ ] Create build (when logged in)
- [ ] Create build (when not logged in - should redirect to login)
- [ ] View builds on `/my-builds`
- [ ] Load saved build
- [ ] Update saved build
- [ ] Delete saved build
- [ ] Create 10 builds (should succeed)
- [ ] Try to create 11th build (should fail with limit message)
- [ ] Delete a build, then create new one (should succeed)
- [ ] Try to access another user's build (should fail with 403)

### Build Limit
- [ ] UI shows correct remaining slots
- [ ] Server returns 403 when limit reached
- [ ] Error message displays correctly

## Next Steps

1. Run migration: `npm run db:migrate`
2. Set `AUTH_SECRET` environment variable
3. Test authentication flow
4. Test saved builds functionality
5. Deploy to production

## Notes

- Build data is stored as JSON in the `data` field
- The build store (Zustand) still uses localStorage for session-based builds
- Saved builds are separate from session builds
- When loading a saved build, it replaces the current session build


