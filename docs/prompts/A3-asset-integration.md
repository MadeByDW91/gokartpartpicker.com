# A3: Asset Integration

**Agent:** A3 (UI)  
**Status:** ⏳ Ready

---

```markdown
You are Agent A3: UI.

All assets are complete and in the correct folders. Now integrate them
throughout the application according to the asset plan.

TASK: Integrate Assets into Components

## Files to Update

### 1. Root Layout - Favicon & Icons
**File:** `src/app/layout.tsx`

**Updates:**
- Add favicon link: `/brand/favicon.ico` (or `/brand/favicon.svg` if ICO not available)
- Add apple-touch-icon: `/brand/apple-touch-icon.png` (or use SVG if PNG not available)
- Add OG default image metadata: `/og/og-default-v1.svg` or `.png`

**Example:**
```tsx
export const metadata: Metadata = {
  // ... existing metadata
  icons: {
    icon: '/brand/favicon.svg',
    apple: '/brand/apple-touch-icon.png',
  },
  openGraph: {
    // ... existing
    images: [
      {
        url: '/og/og-default-v1.png',
        width: 1200,
        height: 630,
        alt: 'GoKartPartPicker',
      },
    ],
  },
  twitter: {
    // ... existing
    images: ['/og/og-default-v1.png'],
  },
};
```

### 2. Header Component - Logo
**File:** `src/components/layout/Header.tsx`

**Current:** Uses `/logo.png`
**Update to:** Use `/brand/brand-logo-light-v1.svg`

**Changes:**
- Replace `<Image src="/logo.png" />` with `<Image src="/brand/brand-logo-light-v1.svg" />`
- For mobile nav, use `/brand/brand-iconmark-v1.svg` if needed
- Ensure proper sizing and alt text

### 3. Admin Layout - Logo
**File:** `src/app/admin/layout.tsx`

**Current:** Uses `/logo.png`
**Update to:** Use `/brand/brand-iconmark-v1.svg` (smaller icon for admin)

### 4. PartCard Component - Placeholder
**File:** `src/components/PartCard.tsx`

**Current:** Shows `<Package>` icon when no image
**Update to:** Use `/placeholders/placeholder-part-v1.svg`

**Changes:**
```tsx
{part.image_url ? (
  <Image src={part.image_url} alt={part.name} fill />
) : (
  <Image 
    src="/placeholders/placeholder-part-v1.svg" 
    alt="Part placeholder"
    fill
    className="object-contain p-4"
  />
)}
```

### 5. EngineCard Component - Placeholder
**File:** `src/components/EngineCard.tsx`

**Current:** Shows `<Gauge>` icon when no image
**Update to:** Use `/placeholders/placeholder-engine-v1.svg`

**Changes:**
```tsx
{engine.image_url ? (
  <Image src={engine.image_url} alt={engine.name} fill />
) : (
  <Image 
    src="/placeholders/placeholder-engine-v1.svg" 
    alt="Engine placeholder"
    fill
    className="object-contain p-4"
  />
)}
```

### 6. Engine Detail Page - Placeholder
**File:** `src/app/engines/[slug]/page.tsx`

**Current:** Shows `<Cog>` icon when no image
**Update to:** Use `/placeholders/placeholder-engine-v1.svg`

### 7. Part Detail Page - Placeholder
**File:** `src/app/parts/[slug]/page.tsx`

**Current:** Shows `<Package>` icon when no image
**Update to:** Use `/placeholders/placeholder-part-v1.svg`

### 8. Empty States

#### No Builds Empty State
**File:** `src/app/builds/page.tsx`

**Current:** Shows `<Wrench>` icon
**Update to:** Use `/ui/ui-empty-no-builds-v1.svg`

**Changes:**
```tsx
{!isLoading && builds?.length === 0 && (
  <div className="text-center py-16">
    <Image 
      src="/ui/ui-empty-no-builds-v1.svg"
      alt="No builds"
      width={300}
      height={200}
      className="mx-auto mb-6"
    />
    <h2 className="text-2xl text-cream-100 mb-2">No Builds Yet</h2>
    {/* ... rest */}
  </div>
)}
```

#### No Results Empty State
**Files:** 
- `src/app/engines/page.tsx`
- `src/app/parts/page.tsx`

**Current:** Shows icon components
**Update to:** Use `/ui/ui-empty-no-results-v1.svg`

### 9. Home Page Hero - Background Image
**File:** `src/app/page.tsx`

**Current:** Uses gradient background
**Update to:** Use hero background images with responsive swap

**Changes:**
```tsx
<section className="relative min-h-[80vh] flex items-center overflow-hidden">
  {/* Background Image */}
  <div className="absolute inset-0">
    <Image
      src="/ui/ui-hero-home-v1-1920x1080.webp"
      alt=""
      fill
      className="object-cover opacity-40"
      priority
      sizes="100vw"
    />
    {/* Mobile version */}
    <Image
      src="/ui/ui-hero-home-mobile-v1-768x1024.webp"
      alt=""
      fill
      className="object-cover opacity-40 md:hidden"
      priority
      sizes="100vw"
    />
  </div>
  {/* Overlay */}
  <div className="absolute inset-0 bg-olive-900/60" />
  {/* ... rest of content */}
</section>
```

**Note:** If hero images don't exist yet, keep gradient but add comment for future update.

### 10. Compatibility Icons
**Files:** Any component showing compatibility status

**Update to use:**
- `/icons/icon-compat-ok-v1.svg` for compatible
- `/icons/icon-compat-warn-v1.svg` for warnings
- `/icons/icon-compat-error-v1.svg` for errors

### 11. Engine Badges
**File:** `src/components/EngineCard.tsx` (and engine detail pages)

**Update to show engine family badges:**
- `/badges/badge-engine-predator-v1.svg` for Predator
- `/badges/badge-engine-clone-v1.svg` for Clone
- `/badges/badge-engine-tillotson-v1.svg` for Tillotson
- `/badges/badge-engine-briggs-v1.svg` for Briggs

**Logic:**
```tsx
const getEngineBadge = (brand: string) => {
  const brandLower = brand.toLowerCase();
  if (brandLower.includes('predator')) return '/badges/badge-engine-predator-v1.svg';
  if (brandLower.includes('clone')) return '/badges/badge-engine-clone-v1.svg';
  if (brandLower.includes('tillotson')) return '/badges/badge-engine-tillotson-v1.svg';
  if (brandLower.includes('briggs')) return '/badges/badge-engine-briggs-v1.svg';
  return null;
};
```

### 12. Loading Spinner
**Files:** Any component with loading states

**Update to use:** `/ui/ui-spinner-v1.svg` with animation

**Example:**
```tsx
<Image 
  src="/ui/ui-spinner-v1.svg"
  alt="Loading"
  width={48}
  height={48}
  className="animate-spin"
/>
```

## Asset Path Reference

All assets are in `frontend/public/`:

- **Brand:** `/brand/brand-logo-light-v1.svg`, `/brand/brand-iconmark-v1.svg`, `/brand/favicon.svg`
- **UI:** `/ui/ui-hero-home-v1-*.webp`, `/ui/ui-empty-*.svg`, `/ui/ui-spinner-v1.svg`
- **Icons:** `/icons/icon-compat-*.svg`
- **Badges:** `/badges/badge-engine-*.svg`
- **Placeholders:** `/placeholders/placeholder-*.svg`
- **OG:** `/og/og-default-v1.png` or `.svg`

## Implementation Notes

1. **Next.js Image Component:** Always use Next.js `<Image>` component for optimization
2. **Alt Text:** Provide meaningful alt text for all images
3. **Priority:** Mark hero images and logos with `priority` prop
4. **Sizing:** Use appropriate `width`/`height` or `fill` based on layout
5. **Fallbacks:** If an asset doesn't exist, keep the current implementation with a comment
6. **Responsive:** Use `sizes` prop for responsive images
7. **SVG vs PNG:** Prefer SVG for logos/icons, use PNG/WebP for photos

## Success Criteria

- [ ] Favicon and apple-touch-icon added to layout
- [ ] Header uses new brand logo SVG
- [ ] Admin layout uses iconmark
- [ ] PartCard uses placeholder SVG
- [ ] EngineCard uses placeholder SVG
- [ ] Detail pages use placeholder SVGs
- [ ] Empty states use new SVG illustrations
- [ ] Hero section uses background images (if available)
- [ ] Compatibility icons are used
- [ ] Engine badges are displayed
- [ ] Loading spinner uses new SVG
- [ ] All images have proper alt text
- [ ] No broken image links

## DO NOT

- Do NOT break existing functionality
- Do NOT use hardcoded paths outside `/public/`
- Do NOT forget to add `priority` to above-the-fold images
- Do NOT use `<img>` tags - always use Next.js `<Image>`
```
