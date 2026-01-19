# GoKartPartPicker Assets Checklist

> **Version:** 1.0  
> **Last Updated:** 2026-01-16  
> **Status:** MVP Planning Phase

---

## Legend

- **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked
- **Priority:** 🔴 Critical (MVP) | 🟠 Important (Launch) | 🟢 Nice-to-have (Post-Launch)

---

## 1. Brand Assets

### 1.1 Logo Variants

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ⬜ | 🔴 | Primary Logo (full) | `brand-logo-primary-v1.svg` | Vector | SVG | Transparent | Clean paths, <10KB, matches source PNG exactly |
| ✅ | 🔴 | Logo Light (for dark bg) | `brand-logo-light-v1.svg` | Vector | SVG | Transparent | Cream text, orange accents on transparent |
| ✅ | 🔴 | Iconmark Only | `brand-iconmark-v1.svg` | 64×64 | SVG | Transparent | Badge shape only, no text, recognizable at 32px |
| ⬜ | 🟠 | Logo Dark (for light bg) | `brand-logo-dark-v1.svg` | Vector | SVG | Transparent | Olive text/fills on transparent, reserved for print |
| ⬜ | 🟢 | Logo Monochrome | `brand-logo-mono-v1.svg` | Vector | SVG | Transparent | Single color (cream or white), for overlays |

**Path:** `/frontend/public/brand/`

### 1.2 Favicons & App Icons

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ⬜ | 🔴 | Favicon (multi-res) | `favicon.ico` | 16×16, 32×32 | ICO | Transparent | Iconmark visible at 16px, clean edges |
| ⬜ | 🔴 | Favicon PNG (32px) | `favicon-32x32.png` | 32×32 | PNG | Transparent | Sharp at 1x, no antialiasing artifacts |
| ⬜ | 🔴 | Favicon PNG (16px) | `favicon-16x16.png` | 16×16 | PNG | Transparent | Recognizable silhouette |
| ⬜ | 🔴 | Apple Touch Icon | `apple-touch-icon.png` | 180×180 | PNG | `#1a1e15` | Solid olive bg, iconmark centered, iOS safe |
| ⬜ | 🟠 | Android Chrome (192px) | `android-chrome-192x192.png` | 192×192 | PNG | `#1a1e15` | PWA manifest icon |
| ⬜ | 🟠 | Android Chrome (512px) | `android-chrome-512x512.png` | 512×512 | PNG | `#1a1e15` | PWA splash icon |
| ⬜ | 🟢 | Safari Pinned Tab | `safari-pinned-tab.svg` | Vector | SVG | Transparent | Monochrome silhouette, single path |

**Path:** `/frontend/public/brand/`

---

## 2. Website UI Assets

### 2.1 Hero Backgrounds

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ⬜ | 🔴 | Hero Home (Desktop) | `ui-hero-home-v1-1920x1080.webp` | 1920×1080 | WebP | Solid olive | Dark, atmospheric, subtle mechanical elements, <100KB, 100px safe zone all sides |
| ⬜ | 🔴 | Hero Home (Mobile) | `ui-hero-home-mobile-v1-768x1024.webp` | 768×1024 | WebP | Solid olive | Portrait crop of desktop, <60KB, maintains focal point |
| ⬜ | 🟠 | Hero Builder (Desktop) | `ui-hero-builder-v1-1920x800.webp` | 1920×800 | WebP | Solid olive | Workbench/garage theme, <80KB |
| ⬜ | 🟠 | Hero Catalog (Desktop) | `ui-hero-catalog-v1-1920x800.webp` | 1920×800 | WebP | Solid olive | Parts grid/organized storage theme, <80KB |

**Path:** `/frontend/public/ui/`

### 2.2 Empty States & Illustrations

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ✅ | 🔴 | Empty - No Builds | `ui-empty-no-builds-v1.svg` | 300×200 | SVG | Transparent | Illustrated wrench/toolbox, uses brand colors, <15KB |
| ✅ | 🔴 | Empty - No Results | `ui-empty-no-results-v1.svg` | 300×200 | SVG | Transparent | Search/magnifier with X, brand colors, <15KB |
| ⬜ | 🟠 | Empty - Cart | `ui-empty-cart-v1.svg` | 300×200 | SVG | Transparent | Empty cart/basket illustration |
| ⬜ | 🟢 | Empty - Favorites | `ui-empty-favorites-v1.svg` | 300×200 | SVG | Transparent | Heart or star outline |

**Path:** `/frontend/public/ui/`

### 2.3 Loading & Feedback

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ✅ | 🟠 | Loading Spinner | `ui-spinner-v1.svg` | 48×48 | SVG | Transparent | Animated via CSS, orange accent, <3KB |
| ⬜ | 🟢 | Success Animation | `ui-success-v1.json` | — | Lottie | Transparent | Checkmark animation, <30KB, 1-2s duration |
| ⬜ | 🟢 | Error Animation | `ui-error-v1.json` | — | Lottie | Transparent | X mark animation, <30KB |

**Path:** `/frontend/public/ui/`

---

## 3. Builder Page Assets

### 3.1 Compatibility Icons

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ✅ | 🔴 | Compat OK | `icon-compat-ok-v1.svg` | 24×24 | SVG | Transparent | Green checkmark, `#4a7c59`, 2px stroke, <2KB |
| ✅ | 🔴 | Compat Warning | `icon-compat-warn-v1.svg` | 24×24 | SVG | Transparent | Orange triangle/exclamation, `#d4803c`, <2KB |
| ✅ | 🔴 | Compat Error | `icon-compat-error-v1.svg` | 24×24 | SVG | Transparent | Red X/circle, `#a63d40`, distinct shape from OK, <2KB |
| ✅ | 🟠 | Compat Unknown | `icon-compat-unknown-v1.svg` | 24×24 | SVG | Transparent | Gray question mark, `#5d634d`, <2KB |

**Path:** `/frontend/public/icons/`

### 3.2 Part Category Icons

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ⬜ | 🟠 | Icon - Engine | `icon-cat-engine-v1.svg` | 24×24 | SVG | Transparent | Engine block silhouette, cream color |
| ⬜ | 🟠 | Icon - Clutch | `icon-cat-clutch-v1.svg` | 24×24 | SVG | Transparent | Clutch disc shape |
| ⬜ | 🟠 | Icon - Sprocket | `icon-cat-sprocket-v1.svg` | 24×24 | SVG | Transparent | Gear/sprocket teeth |
| ⬜ | 🟠 | Icon - Chain | `icon-cat-chain-v1.svg` | 24×24 | SVG | Transparent | Chain link segment |
| ⬜ | 🟠 | Icon - Axle | `icon-cat-axle-v1.svg` | 24×24 | SVG | Transparent | Axle shaft |
| ⬜ | 🟠 | Icon - Wheel | `icon-cat-wheel-v1.svg` | 24×24 | SVG | Transparent | Wheel/tire outline |
| ⬜ | 🟠 | Icon - Brake | `icon-cat-brake-v1.svg` | 24×24 | SVG | Transparent | Brake disc |
| ⬜ | 🟠 | Icon - Exhaust | `icon-cat-exhaust-v1.svg` | 24×24 | SVG | Transparent | Exhaust pipe/header |
| ⬜ | 🟠 | Icon - Fuel | `icon-cat-fuel-v1.svg` | 24×24 | SVG | Transparent | Fuel tank/pump |
| ⬜ | 🟠 | Icon - Frame | `icon-cat-frame-v1.svg` | 24×24 | SVG | Transparent | Frame/chassis outline |

**Path:** `/frontend/public/icons/`

---

## 4. Catalog Assets

### 4.1 Placeholder Images

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ✅ | 🔴 | Part Placeholder | `placeholder-part-v1.svg` | 400×400 | SVG | Transparent | Generic part silhouette, subtle grid, brand colors, <10KB |
| ✅ | 🔴 | Engine Placeholder | `placeholder-engine-v1.svg` | 600×400 | SVG | Transparent | Engine block outline, recognizable at 150px wide |
| ⬜ | 🟠 | User Avatar Placeholder | `placeholder-avatar-v1.svg` | 100×100 | SVG | Transparent | Helmet or wrench icon, neutral |

**Path:** `/frontend/public/placeholders/`

---

## 5. Engine Family Badges

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ✅ | 🔴 | Badge - Predator | `badge-engine-predator-v1.svg` | 80×24 | SVG | Transparent | "PREDATOR" text, orange accent, brand font, <5KB |
| ✅ | 🔴 | Badge - Clone | `badge-engine-clone-v1.svg` | 80×24 | SVG | Transparent | "CLONE" text, indicates non-branded |
| ✅ | 🔴 | Badge - Tillotson | `badge-engine-tillotson-v1.svg` | 80×24 | SVG | Transparent | "TILLOTSON" text |
| ✅ | 🔴 | Badge - Briggs | `badge-engine-briggs-v1.svg` | 80×24 | SVG | Transparent | "BRIGGS" text |
| ⬜ | 🟠 | Badge - Honda | `badge-engine-honda-v1.svg` | 80×24 | SVG | Transparent | "HONDA" text |
| ⬜ | 🟠 | Badge - Kohler | `badge-engine-kohler-v1.svg` | 80×24 | SVG | Transparent | "KOHLER" text |
| ⬜ | 🟠 | Badge - Subaru | `badge-engine-subaru-v1.svg` | 80×24 | SVG | Transparent | "SUBARU" text |
| ⬜ | 🟢 | Badge - Other | `badge-engine-other-v1.svg` | 80×24 | SVG | Transparent | "OTHER" generic fallback |

**Path:** `/frontend/public/badges/`

---

## 6. Guides & Tools Assets

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ⬜ | 🟠 | Guide Header - Getting Started | `guide-header-getting-started-v1-1200x400.webp` | 1200×400 | WebP | Solid olive | Welcoming garage scene, text overlay safe zone 40px |
| ⬜ | 🟠 | Guide Header - Engine Swap | `guide-header-engine-swap-v1-1200x400.webp` | 1200×400 | WebP | Solid olive | Engine installation theme |
| ⬜ | 🟠 | Guide Header - First Build | `guide-header-first-build-v1-1200x400.webp` | 1200×400 | WebP | Solid olive | Fresh kart frame theme |
| ⬜ | 🟢 | Guide Header - Maintenance | `guide-header-maintenance-v1-1200x400.webp` | 1200×400 | WebP | Solid olive | Tools and parts layout |
| ⬜ | 🟢 | Guide Header - Upgrades | `guide-header-upgrades-v1-1200x400.webp` | 1200×400 | WebP | Solid olive | Performance parts theme |

**Path:** `/frontend/public/ui/`

---

## 7. Social & OG Images

### 7.1 Open Graph Images

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ✅ | 🔴 | OG Default | `og-default-v1.svg` | 1200×630 | SVG | `#1a1e15` | Logo centered, tagline below, 60px safe zone |
| ✅ | 🔴 | OG Build Template | `og-build-template-v1.svg` | 1200×630 | SVG | `#1a1e15` | Template with placeholders for dynamic build data |
| ⬜ | 🟠 | OG Engine Detail | `og-engine-template-v1-1200x630.png` | 1200×630 | PNG | `#1a1e15` | Template for engine pages |
| ⬜ | 🟠 | OG Part Detail | `og-part-template-v1-1200x630.png` | 1200×630 | PNG | `#1a1e15` | Template for part pages |
| ⬜ | 🟢 | OG Guide | `og-guide-template-v1-1200x630.png` | 1200×630 | PNG | `#1a1e15` | Template for guide articles |

**Path:** `/frontend/public/og/`

### 7.2 Social Media Assets

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ⬜ | 🟠 | Twitter Card | `social-twitter-v1-1200x600.png` | 1200×600 | PNG | `#1a1e15` | Optimized for Twitter/X summary card |
| ⬜ | 🟠 | Facebook Cover | `social-fb-cover-v1-820x312.png` | 820×312 | PNG | `#1a1e15` | Safe zone for profile overlap |
| ⬜ | 🟢 | Instagram Profile | `social-ig-profile-v1-320x320.png` | 320×320 | PNG | `#1a1e15` | Iconmark centered, circular crop safe |
| ⬜ | 🟢 | YouTube Banner | `social-yt-banner-v1-2560x1440.png` | 2560×1440 | PNG | `#1a1e15` | Safe zone 1546×423 centered |

**Path:** `/frontend/public/social/`

---

## 8. Store Assets (If Applicable)

| Status | Priority | Asset | Filename | Size | Format | Background | Acceptance Criteria |
|--------|----------|-------|----------|------|--------|------------|---------------------|
| ⬜ | 🟢 | Badge - Verified Seller | `badge-verified-seller-v1.svg` | 80×24 | SVG | Transparent | Checkmark + "VERIFIED" |
| ⬜ | 🟢 | Badge - Community Pick | `badge-community-pick-v1.svg` | 80×24 | SVG | Transparent | Star + "COMMUNITY PICK" |
| ⬜ | 🟢 | Badge - Budget Build | `badge-budget-build-v1.svg` | 80×24 | SVG | Transparent | Dollar sign + "BUDGET" |
| ⬜ | 🟢 | Badge - Racing Ready | `badge-racing-ready-v1.svg` | 80×24 | SVG | Transparent | Flag + "RACING READY" |
| ⬜ | 🟢 | Badge - In Stock | `badge-in-stock-v1.svg` | 60×20 | SVG | Transparent | Green dot + "IN STOCK" |
| ⬜ | 🟢 | Badge - Low Stock | `badge-low-stock-v1.svg` | 60×20 | SVG | Transparent | Orange dot + "LOW STOCK" |
| ⬜ | 🟢 | Badge - Out of Stock | `badge-out-of-stock-v1.svg` | 60×20 | SVG | Transparent | Red dot + "OUT OF STOCK" |

**Path:** `/frontend/public/badges/`

---

## 9. Final QA Checklist

### Pre-Launch Verification

| Status | Check | Notes |
|--------|-------|-------|
| ⬜ | All MVP (🔴) assets completed | |
| ⬜ | All filenames follow naming convention | lowercase, hyphen-separated, versioned |
| ⬜ | All SVGs optimized via SVGO | Target <5KB for icons, <15KB for illustrations |
| ⬜ | All WebP images compressed | Quality 80-85%, target sizes met |
| ⬜ | All PNG OG images <300KB | |
| ⬜ | Favicon displays correctly in all browsers | Chrome, Firefox, Safari, Edge |
| ⬜ | Apple Touch Icon renders properly | Test on iOS device |
| ⬜ | OG images render correctly on Twitter | Use Twitter Card Validator |
| ⬜ | OG images render correctly on Facebook | Use Facebook Debugger |
| ⬜ | OG images render correctly on LinkedIn | Use LinkedIn Post Inspector |

### Contrast & Accessibility

| Status | Check | Notes |
|--------|-------|-------|
| ⬜ | Cream text on olive-900: ratio ≥ 4.5:1 | Should be ~12.8:1 |
| ⬜ | Orange text on olive-900: ratio ≥ 4.5:1 | Should be ~5.2:1 |
| ⬜ | Compat icons distinguishable without color | Shape differentiation |
| ⬜ | All icons meet 24×24 minimum touch target | |
| ⬜ | Badge text legible at actual display size | |

### Integration Testing

| Status | Check | Notes |
|--------|-------|-------|
| ⬜ | All images load via Next.js Image component | |
| ⬜ | Responsive hero image swap works | Desktop/mobile breakpoint |
| ⬜ | Empty states display correctly | Test each empty state scenario |
| ⬜ | Placeholder images render in catalog | Test with missing product images |
| ⬜ | Engine badges display on engine cards | |
| ⬜ | Compat icons display in builder | |

### File Cleanup

| Status | Check | Notes |
|--------|-------|-------|
| ✅ | Remove `file.svg` from /public | Next.js default |
| ✅ | Remove `globe.svg` from /public | Next.js default |
| ✅ | Remove `next.svg` from /public | Next.js default |
| ✅ | Remove `vercel.svg` from /public | Next.js default |
| ✅ | Remove `window.svg` from /public | Next.js default |

---

## 10. Summary Counts

| Category | MVP (🔴) | Launch (🟠) | Post-Launch (🟢) | Total | ✅ Complete |
|----------|----------|-------------|------------------|-------|-------------|
| Brand | 5 | 4 | 2 | 11 | 2 |
| UI | 5 | 4 | 3 | 12 | 3 |
| Icons | 4 | 11 | 0 | 15 | 4 |
| Badges | 4 | 4 | 9 | 17 | 4 |
| Placeholders | 2 | 1 | 0 | 3 | 2 |
| OG/Social | 2 | 5 | 4 | 11 | 2 |
| Guides | 0 | 3 | 2 | 5 | 0 |
| **Total** | **22** | **32** | **20** | **74** | **17** |

### Progress: 17/74 (23%) — All MVP SVGs Complete

---

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-16 | Initial checklist created |
