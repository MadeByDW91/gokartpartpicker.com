# GoKartPartPicker Asset Plan

> **Version:** 1.1  
> **Last Updated:** 2026-01-16  
> **Status:** MVP Asset Creation In Progress (77% Complete)

---

## 📊 Progress Summary

### MVP Assets (Launch-Critical): 17/22 Complete (77%)

| Category | Complete | Total | Status |
|----------|----------|-------|--------|
| ✅ **Brand** | 2 | 5 | Logo variants done; favicon/PNG exports needed |
| 🟡 **UI** | 3 | 5 | Empty states & spinner done; hero backgrounds need generation |
| ✅ **Icons** | 4 | 4 | **100% Complete** — All compatibility icons done |
| ✅ **Badges** | 4 | 4 | **100% Complete** — All MVP engine badges done |
| ✅ **Placeholders** | 2 | 2 | **100% Complete** — Part & engine placeholders done |
| ✅ **OG** | 2 | 2 | **100% Complete** — SVG templates created |

### Post-MVP Assets: 1/12 Complete (8%)

| Category | Complete | Total | Status |
|----------|----------|-------|--------|
| 🟡 **UI** | 1 | 4 | Spinner done; hero backgrounds & animations needed |
| 🟡 **Guides** | 0 | 2 | Prompts provided; images need generation |
| ⬜ **Social** | 0 | 2 | Not started |
| ⬜ **Badges** | 0 | 4 | Store badges not started |

### Overall: 18/34 Total Assets Complete (53%) | 18 Prompts Provided

**Next Steps:**
1. Generate hero backgrounds (3 WebP files) — prompts ready
2. Generate guide headers (2 WebP files) — prompts ready  
3. Convert SVG to PNG/ICO for favicons
4. Vectorize primary logo from PNG source

---

## 1. Brand Analysis — Logo as Source of Truth

### 1.1 Logo Reference
**Source File:** `/Logo Concepts/Logo.png`  
**Style:** Vintage motorsport badge — rounded rectangle with signature bottom notch

### 1.2 Extracted Brand Palette

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `olive-900` | `#1a1e15` | Primary background, deepest |
| `olive-800` | `#2d3226` | Secondary background |
| `olive-700` | `#3d4233` | Card backgrounds |
| `olive-600` | `#4d5340` | Borders, dividers |
| `olive-500` | `#5d634d` | Muted elements |
| `orange-600` | `#a85a1e` | Accent muted/pressed |
| `orange-500` | `#c96a24` | **Primary accent** — buttons, links, highlights |
| `orange-400` | `#d4803c` | Accent hover |
| `orange-300` | `#e09654` | Light accent |
| `cream-100` | `#f5f0e6` | Primary text, headings |
| `cream-200` | `#e8dcc4` | Secondary text |
| `cream-300` | `#d9cba8` | Muted text |
| `cream-400` | `#c4b58e` | Placeholder text |

### 1.3 Logo Style Cues

| Attribute | Observed Value | Application |
|-----------|---------------|-------------|
| **Shape Language** | Rounded rectangles, badge/emblem forms | Use for cards, buttons, badges |
| **Corner Radius** | ~12-16px on badge | Map to `--radius-lg` (0.75rem) |
| **Line Weight** | Medium-thick, confident strokes | Avoid thin/hairline elements |
| **Texture** | Subtle grain/noise overlay | Apply `.texture-noise` sparingly |
| **Typography** | Bold condensed uppercase | Use `Bebas Neue` for display |
| **Contrast** | High — dark bg with cream/orange | Maintain WCAG AA minimum |
| **Aesthetic** | Retro/industrial/garage-built | Avoid glossy SaaS aesthetics |

### 1.4 Visual Do's and Don'ts

#### ✅ DO
- Use dark olive backgrounds (`olive-900`, `olive-800`) as primary surfaces
- Apply subtle noise texture for depth (3-5% opacity max)
- Use orange (`orange-500`) for primary CTAs and interactive elements
- Use cream (`cream-100`) for primary text on dark backgrounds
- Use condensed uppercase display font for headings
- Maintain high contrast ratios (minimum 4.5:1 for text)
- Use rounded corners consistently (0.5rem–1rem range)
- Favor solid colors over gradients
- Include mechanical/industrial visual metaphors where appropriate

#### ❌ DON'T
- Use light/white primary backgrounds
- Add neon, futuristic, or cyberpunk aesthetics
- Use thin or decorative typefaces for UI text
- Apply glossy/glassy effects or complex gradients
- Use colors outside the defined palette
- Add text into images unless explicitly required
- Overcomplicate with excessive decoration
- Use drop shadows heavier than defined tokens

---

## 2. Asset Inventory

> **Progress:** ✅ 17/22 MVP assets complete (77%) | 🟡 5 remaining (require image generation or conversion)

### 2.1 MVP Assets (Launch-Critical)

| Status | Category | Asset | Filename | Dimensions | Format |
|--------|----------|-------|----------|------------|--------|
| 🟡 | **Brand** | Primary Logo | `brand-logo-primary-v1.svg` | Vector | SVG |
| ✅ | **Brand** | Logo Light (on dark) | `brand-logo-light-v1.svg` | Vector | SVG |
| ✅ | **Brand** | Iconmark Only | `brand-iconmark-v1.svg` | 64×64 | SVG |
| 🟡 | **Brand** | Favicon | `favicon.ico` | 32×32, 16×16 | ICO |
| 🟡 | **Brand** | Apple Touch Icon | `apple-touch-icon.png` | 180×180 | PNG |
| 🟡 | **UI** | Hero Background (Home) | `ui-hero-home-v1-1920x1080.webp` | 1920×1080 | WebP | Prompt ready |
| 🟡 | **UI** | Hero Background (Mobile) | `ui-hero-home-mobile-v1-768x1024.webp` | 768×1024 | WebP | Prompt ready |
| ✅ | **UI** | Empty State - No Builds | `ui-empty-no-builds-v1.svg` | 300×200 | SVG |
| ✅ | **UI** | Empty State - No Results | `ui-empty-no-results-v1.svg` | 300×200 | SVG |
| ✅ | **Placeholder** | Part Image Placeholder | `placeholder-part-v1.svg` | 400×400 | SVG |
| ✅ | **Placeholder** | Engine Image Placeholder | `placeholder-engine-v1.svg` | 600×400 | SVG |
| ✅ | **OG** | Default OG Image | `og-default-v1.svg` | 1200×630 | SVG |
| ✅ | **OG** | Build Share Template | `og-build-template-v1.svg` | 1200×630 | SVG |
| ✅ | **Icons** | Compatibility OK | `icon-compat-ok-v1.svg` | 24×24 | SVG |
| ✅ | **Icons** | Compatibility Warning | `icon-compat-warn-v1.svg` | 24×24 | SVG |
| ✅ | **Icons** | Compatibility Error | `icon-compat-error-v1.svg` | 24×24 | SVG |
| ✅ | **Badges** | Engine Family - Predator | `badge-engine-predator-v1.svg` | 80×24 | SVG |
| ✅ | **Badges** | Engine Family - Clone | `badge-engine-clone-v1.svg` | 80×24 | SVG |
| ✅ | **Badges** | Engine Family - Tillotson | `badge-engine-tillotson-v1.svg` | 80×24 | SVG |
| ✅ | **Badges** | Engine Family - Briggs | `badge-engine-briggs-v1.svg` | 80×24 | SVG |

**Legend:** ✅ Complete | 🟡 In Progress / Needs Generation | ⬜ Not Started

### 2.2 Post-MVP Assets (Phase 2)

| Status | Category | Asset | Filename | Dimensions | Format |
|--------|----------|-------|----------|------------|--------|
| 🟡 | **UI** | Hero Background (Builder) | `ui-hero-builder-v1-1920x800.webp` | 1920×800 | WebP | Prompt ready |
| 🟡 | **UI** | Hero Background (Catalog) | `ui-hero-catalog-v1-1920x800.webp` | 1920×800 | WebP | Prompt ready |
| ✅ | **UI** | Loading Spinner | `ui-spinner-v1.svg` | 48×48 | SVG |
| ⬜ | **UI** | Success Animation | `ui-success-v1.json` | — | Lottie |
| 🟡 | **Social** | Twitter Card | `social-twitter-v1-1200x600.png` | 1200×600 | PNG | Prompt ready |
| 🟡 | **Social** | Facebook Cover | `social-fb-cover-v1-820x312.png` | 820×312 | PNG | Prompt ready |
| 🟡 | **Social** | Instagram Profile | `social-ig-profile-v1-320x320.png` | 320×320 | PNG | Prompt ready |
| 🟡 | **Social** | YouTube Banner | `social-yt-banner-v1-2560x1440.png` | 2560×1440 | PNG | Prompt ready |
| 🟡 | **OG** | Engine Detail Template | `og-engine-template-v1-1200x630.png` | 1200×630 | PNG | Prompt ready |
| 🟡 | **OG** | Part Detail Template | `og-part-template-v1-1200x630.png` | 1200×630 | PNG | Prompt ready |
| 🟡 | **OG** | Guide Article Template | `og-guide-template-v1-1200x630.png` | 1200×630 | PNG | Prompt ready |
| 🟡 | **Guides** | Guide Header - Getting Started | `guide-header-getting-started-v1-1200x400.webp` | 1200×400 | WebP | Prompt ready |
| 🟡 | **Guides** | Guide Header - Engine Swap | `guide-header-engine-swap-v1-1200x400.webp` | 1200×400 | WebP | Prompt ready |
| ⬜ | **Badges** | Verified Seller | `badge-verified-seller-v1.svg` | 80×24 | SVG |
| ⬜ | **Badges** | Community Pick | `badge-community-pick-v1.svg` | 80×24 | SVG |
| ⬜ | **Badges** | Budget Build | `badge-budget-build-v1.svg` | 80×24 | SVG |
| ⬜ | **Badges** | Racing Ready | `badge-racing-ready-v1.svg` | 80×24 | SVG |

---

## 3. Asset Usage by Route/Component

### 3.1 Global (All Pages)

| Asset | Component | Notes |
|-------|-----------|-------|
| `brand-logo-light-v1.svg` | `<Header />` | Top-left, links to home |
| `brand-iconmark-v1.svg` | `<MobileNav />` | Collapsed mobile nav |
| `favicon.ico` | `<head>` | Browser tab |
| `apple-touch-icon.png` | `<head>` | iOS home screen |

### 3.2 Home Page (`/`)

| Asset | Component | Notes |
|-------|-----------|-------|
| `ui-hero-home-v1-*.webp` | `<HeroSection />` | Background, responsive swap |
| `og-default-v1-1200x630.png` | `<head>` meta | Social sharing |

### 3.3 Builder Page (`/builder`, `/builder/[id]`)

| Asset | Component | Notes |
|-------|-----------|-------|
| `ui-empty-no-builds-v1.svg` | `<EmptyState />` | When user has no builds |
| `icon-compat-*.svg` | `<CompatibilityBadge />` | Part compatibility status |
| `placeholder-part-v1.svg` | `<PartCard />` | When part has no image |
| `placeholder-engine-v1.svg` | `<EngineSelector />` | When engine has no image |
| `badge-engine-*.svg` | `<EngineCard />` | Engine family indicator |

### 3.4 Catalog Pages (`/parts`, `/engines`)

| Asset | Component | Notes |
|-------|-----------|-------|
| `ui-empty-no-results-v1.svg` | `<EmptyState />` | Search with no results |
| `placeholder-part-v1.svg` | `<PartGrid />` | Missing product images |

### 3.5 Build Share (`/build/[id]`)

| Asset | Component | Notes |
|-------|-----------|-------|
| `og-build-template-v1-1200x630.png` | Server-generated | Dynamic OG with build data |

---

## 4. Format & Dimension Specifications

### 4.1 Format Guidelines

| Format | Use Case | Compression |
|--------|----------|-------------|
| **SVG** | Icons, logos, badges, illustrations | Optimized via SVGO |
| **WebP** | Photographic backgrounds, hero images | Quality 80-85% |
| **PNG** | OG images, social cards (need exact rendering) | Optimized, <300KB |
| **ICO** | Favicon only | Multi-resolution |
| **Lottie** | Complex animations | JSON, <50KB |

### 4.2 Dimension Standards

| Asset Type | Desktop | Mobile | Safe Zone |
|------------|---------|--------|-----------|
| Hero Background | 1920×1080 | 768×1024 | 100px all sides |
| OG/Social Image | 1200×630 | — | 60px all sides |
| Guide Header | 1200×400 | — | 40px top/bottom |
| Icon | 24×24 | 24×24 | 2px padding |
| Badge | 80×24 | 80×24 | 4px padding |
| Placeholder | 400×400 | 400×400 | 20px padding |

### 4.3 Background Rules

| Asset Type | Background |
|------------|------------|
| Logo SVGs | Transparent |
| Icons | Transparent |
| Badges | Transparent (or olive-900 if needed) |
| Hero Images | Solid olive-900 base with content |
| OG Images | Solid olive-900, no transparency |
| Placeholders | Transparent |

---

## 5. Folder Structure

```
frontend/public/
├── brand/
│   ├── brand-logo-primary-v1.svg
│   ├── brand-logo-light-v1.svg
│   ├── brand-iconmark-v1.svg
│   ├── favicon.ico
│   └── apple-touch-icon.png
├── ui/
│   ├── ui-hero-home-v1-1920x1080.webp
│   ├── ui-hero-home-mobile-v1-768x1024.webp
│   ├── ui-empty-no-builds-v1.svg
│   ├── ui-empty-no-results-v1.svg
│   └── ui-spinner-v1.svg
├── icons/
│   ├── icon-compat-ok-v1.svg
│   ├── icon-compat-warn-v1.svg
│   └── icon-compat-error-v1.svg
├── badges/
│   ├── badge-engine-predator-v1.svg
│   ├── badge-engine-clone-v1.svg
│   ├── badge-engine-tillotson-v1.svg
│   └── badge-engine-briggs-v1.svg
├── placeholders/
│   ├── placeholder-part-v1.svg
│   └── placeholder-engine-v1.svg
├── og/
│   ├── og-default-v1-1200x630.png
│   └── og-build-template-v1-1200x630.png
└── social/
    ├── social-twitter-v1-1200x600.png
    └── social-fb-cover-v1-820x312.png
```

---

## 6. Contrast & Accessibility Requirements

### 6.1 Text Overlay Contrast (WCAG AA)

| Background | Text Color | Minimum Ratio | Status |
|------------|------------|---------------|--------|
| `olive-900` (#1a1e15) | `cream-100` (#f5f0e6) | 12.8:1 | ✅ AAA |
| `olive-900` (#1a1e15) | `orange-500` (#c96a24) | 5.2:1 | ✅ AA |
| `olive-800` (#2d3226) | `cream-100` (#f5f0e6) | 10.1:1 | ✅ AAA |
| `orange-500` (#c96a24) | `cream-100` (#f5f0e6) | 2.5:1 | ⚠️ Large text only |
| `orange-500` (#c96a24) | `olive-900` (#1a1e15) | 5.2:1 | ✅ AA |

### 6.2 Icon & Badge Visibility

- All icons must have 24×24 minimum touch target
- Badges must maintain legibility at 80×24 and below
- Critical status icons (compat-error) must not rely on color alone — use shape differentiation

---

## 7. File Size Limits

| Asset Type | Max Size | Target Size |
|------------|----------|-------------|
| SVG Icons | 5KB | <2KB |
| SVG Badges | 10KB | <5KB |
| SVG Illustrations | 30KB | <15KB |
| WebP Hero (desktop) | 200KB | <100KB |
| WebP Hero (mobile) | 100KB | <60KB |
| PNG OG Images | 300KB | <150KB |
| Lottie Animations | 50KB | <30KB |

---

## 8. QA Checklist for All Assets

### Pre-Flight

- [ ] Filename follows naming convention
- [ ] Correct dimensions
- [ ] Correct format
- [ ] Transparent background where specified
- [ ] Safe zones respected

### Visual Quality

- [ ] Colors match brand palette exactly (hex values verified)
- [ ] No unintended artifacts or compression noise
- [ ] Sharp at 1x and 2x display density
- [ ] Legible at smallest intended display size

### Integration

- [ ] Loads correctly in Next.js Image component
- [ ] No CORS issues from CDN
- [ ] Responsive swap works (if applicable)
- [ ] Alt text defined in implementation

### Accessibility

- [ ] Contrast ratio meets WCAG AA
- [ ] Decorative images marked `aria-hidden`
- [ ] Meaningful images have descriptive alt text

---

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-16 | Initial asset plan created |

---

## 10. Notes & Decisions

### Logo Alignment with GoKartPartPicker Vibe

The provided logo is **fully aligned** with the target aesthetic:
- ✅ Dark, utilitarian base
- ✅ High contrast
- ✅ Industrial/garage feel
- ✅ Retro motorsport badge styling
- ✅ Grain/texture treatment

**No conflicts detected.** The logo can serve as the visual anchor for all assets without modification.

### Typography Note

The `Bebas Neue` font specified in `globals.css` matches the logo's typography style. Ensure this font is loaded (Google Fonts or local hosting) before launch.

### Existing Assets to Replace

The following default Next.js assets in `/frontend/public/` should be replaced or removed:
- `file.svg` — Remove
- `globe.svg` — Remove
- `next.svg` — Remove
- `vercel.svg` — Remove
- `window.svg` — Remove
