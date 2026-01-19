# GoKartPartPicker Image Generation Prompts

> **Version:** 1.0  
> **Last Updated:** 2026-01-16  
> **Status:** Ready for Asset Generation

---

## Usage Instructions

Each section below contains:
1. **Output filename** — exact filename to save as
2. **Target folder** — path relative to `/frontend/public/`
3. **Resolution/Aspect** — exact dimensions
4. **Background rules** — what the background should be
5. **Safe area notes** — margins to keep clear for overlays
6. **PRIMARY PROMPT** — copy/paste into your image generator
7. **NEGATIVE PROMPT** — copy/paste to exclude unwanted elements
8. **Variants** — optional alternative prompts (max 2)

### Brand Color Reference (Use Exact Values)

| Name | Hex | RGB |
|------|-----|-----|
| Olive-900 (Dark BG) | `#1a1e15` | rgb(26, 30, 21) |
| Olive-800 | `#2d3226` | rgb(45, 50, 38) |
| Olive-700 | `#3d4233` | rgb(61, 66, 51) |
| Orange-500 (Accent) | `#c96a24` | rgb(201, 106, 36) |
| Cream-100 (Text) | `#f5f0e6` | rgb(245, 240, 230) |

---

## 1. Hero Backgrounds

---

### 1.1 Hero Home — Desktop

**Output:** `ui-hero-home-v1-1920x1080.webp`  
**Folder:** `/ui/`  
**Resolution:** 1920×1080 (16:9)  
**Background:** Solid dark olive `#1a1e15`  
**Safe Area:** 100px all sides (text/UI overlay zone)

#### PRIMARY PROMPT

```
Dark atmospheric garage workshop background, vintage motorsport aesthetic, go-kart racing theme. Deep olive-green tinted darkness (#1a1e15 base). Subtle visible elements: worn concrete floor, partial silhouette of go-kart chassis, faded tool pegboard, industrial shelving in shadow. Dramatic side lighting from left creating long shadows. Film grain texture overlay. Muted orange accent lighting hitting metal surfaces. No text, no logos. Cinematic depth of field with sharp foreground fading to soft background. Utilitarian, authentic, garage-built feel. Dark enough for cream and orange text overlay.
```

#### NEGATIVE PROMPT

```
bright, neon, colorful, glossy, clean, sterile, modern, futuristic, cyberpunk, cartoon, illustration, people, faces, hands, text, logos, watermarks, signatures, white background, light background, overexposed, HDR, oversaturated, plastic, shiny, chrome, reflective, lens flare, bokeh circles
```

#### VARIANT A — More Abstract

```
Abstract industrial texture background, dark olive-green base (#1a1e15). Layered textures: brushed metal, weathered concrete, tire rubber marks, chain-link shadow pattern. Subtle orange rust accents. Heavy film grain. Geometric composition with diagonal lines suggesting speed. No recognizable objects. Dark atmospheric, moody. Suitable for text overlay.
```

---

### 1.2 Hero Home — Mobile

**Output:** `ui-hero-home-mobile-v1-768x1024.webp`  
**Folder:** `/ui/`  
**Resolution:** 768×1024 (3:4 portrait)  
**Background:** Solid dark olive `#1a1e15`  
**Safe Area:** 80px sides, 120px top, 100px bottom

#### PRIMARY PROMPT

```
Dark atmospheric garage workshop background, portrait orientation, vintage motorsport aesthetic. Deep olive-green darkness (#1a1e15 base). Vertical composition: concrete floor texture at bottom, shadowy tool wall mid-frame, dark ceiling area at top for logo placement. Partial go-kart wheel visible in lower third. Dramatic overhead lighting creating pools of shadow. Film grain texture. Faint orange accent on metal edges. No text, no logos. Cinematic, utilitarian, authentic garage-built feel. Very dark overall for mobile UI overlay.
```

#### NEGATIVE PROMPT

```
bright, neon, colorful, glossy, clean, modern, futuristic, horizontal composition, landscape orientation, people, text, logos, watermarks, white areas, overexposed, HDR, cartoon, illustration
```

---

### 1.3 Hero Builder — Desktop

**Output:** `ui-hero-builder-v1-1920x800.webp`  
**Folder:** `/ui/`  
**Resolution:** 1920×800 (wide banner)  
**Background:** Solid dark olive `#1a1e15`  
**Safe Area:** 80px all sides

#### PRIMARY PROMPT

```
Dark workbench scene from above, bird's eye view, vintage garage workshop. Deep olive-green darkness (#1a1e15 base). Wooden workbench with visible wood grain texture. Scattered go-kart parts in shadow: sprockets, chain segments, small bolts arranged loosely. Oil stains on wood. Single hanging work light creating cone of warm orange-tinted illumination on center area. Surrounding darkness. Film grain. Industrial, organized chaos aesthetic. No text, no complete assemblies. Moody, utilitarian. Dark enough for UI overlay.
```

#### NEGATIVE PROMPT

```
bright, clean, organized, sterile, modern, white, neon, people, hands, text, logos, complete vehicles, colorful, saturated, cartoon, illustration, overhead fluorescent lighting
```

---

### 1.4 Hero Catalog — Desktop

**Output:** `ui-hero-catalog-v1-1920x800.webp`  
**Folder:** `/ui/`  
**Resolution:** 1920×800 (wide banner)  
**Background:** Solid dark olive `#1a1e15`  
**Safe Area:** 80px all sides

#### PRIMARY PROMPT

```
Dark industrial parts storage, metal shelving grid pattern, vintage warehouse aesthetic. Deep olive-green darkness (#1a1e15 base). Rows of metal shelving receding into darkness with subtle depth. Silhouettes of boxed parts and organized bins. Grid pattern from shelving creating geometric composition. Single orange-tinted work light in distance. Dust particles in light beam. Concrete floor visible at bottom. Film grain texture. No specific readable labels. Dark, systematic, warehouse feel. Suitable for text overlay.
```

#### NEGATIVE PROMPT

```
bright, colorful, clean, modern, retail store, white shelving, neon lighting, people, text, logos, specific products visible, cartoon, illustration, overexposed
```

---

## 2. OG & Social Images

---

### 2.1 OG Default

**Output:** `og-default-v1-1200x630.png`  
**Folder:** `/og/`  
**Resolution:** 1200×630 (1.91:1)  
**Background:** Solid `#1a1e15`  
**Safe Area:** 60px all sides (critical for cropping on various platforms)

#### PRIMARY PROMPT

```
Dark promotional banner for go-kart parts website, 1200x630 pixels. Solid dark olive-green background (#1a1e15). Centered composition with subtle atmospheric elements: faint tire track marks, light dust texture, subtle grid pattern at 5% opacity. Vignette darkening at edges. Bottom third slightly lighter for tagline area. Film grain texture at low opacity. Dramatic, cinematic feel. No text rendered in image. No logos. Space for logo in center-upper area and tagline below. Professional, motorsport aesthetic.
```

#### NEGATIVE PROMPT

```
text, typography, logos, watermarks, people, products, bright colors, neon, gradients, glossy, 3D rendered, cartoon, illustration, busy, cluttered, multiple focal points
```

#### VARIANT A — With Subtle Kart Silhouette

```
Dark promotional banner, 1200x630. Dark olive background (#1a1e15). Very subtle, low-opacity (15%) go-kart silhouette in lower right corner, partially cropped. Rest of composition is atmospheric texture: concrete dust, film grain, subtle vignette. Center area completely clear for logo placement. Moody, professional motorsport aesthetic. No text.
```

---

### 2.2 OG Build Template

**Output:** `og-build-template-v1-1200x630.png`  
**Folder:** `/og/`  
**Resolution:** 1200×630  
**Background:** Solid `#1a1e15`  
**Safe Area:** 60px all sides, left 400px reserved for dynamic content

#### PRIMARY PROMPT

```
Dark template banner for build showcase, 1200x630 pixels. Dark olive background (#1a1e15). Compositional zones: left third clear and darkest (for dynamic text overlay), right two-thirds with subtle atmospheric workshop elements at very low opacity (20%): workbench edge, tool shadows, faint grid pattern. Orange accent line (3px) running vertically at 380px from left edge. Film grain. Bottom 80px slightly darker for footer info. Professional, technical documentation feel. No text, no logos.
```

#### NEGATIVE PROMPT

```
text, logos, watermarks, specific products, people, bright areas, colorful, neon, cartoon, cluttered, busy patterns, high contrast
```

---

### 2.3 Social Twitter Card

**Output:** `social-twitter-v1-1200x600.png`  
**Folder:** `/social/`  
**Resolution:** 1200×600 (2:1)  
**Background:** Solid `#1a1e15`  
**Safe Area:** 50px all sides

#### PRIMARY PROMPT

```
Dark social media banner, 1200x600, Twitter/X optimized. Solid dark olive-green (#1a1e15). Centered composition with room for logo. Subtle background texture: concrete grain, faint diagonal speed lines at 5% opacity in corners. Slight vignette. Film grain at low opacity. Clean, minimal, professional. Orange accent elements possible as subtle corner details. No text, no logos. Motorsport, racing aesthetic.
```

#### NEGATIVE PROMPT

```
text, logos, people, products, bright, neon, busy, cluttered, cartoon, illustration, gradients, glossy
```

---

## 3. Empty State Illustrations

---

### 3.1 Empty State — No Builds

**Output:** `ui-empty-no-builds-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 300×200 (vector)  
**Background:** Transparent  
**Safe Area:** 20px padding all sides

#### PRIMARY PROMPT

```
Minimalist line illustration of an empty toolbox or workbench, vector style. Clean single-weight strokes (2-3px). Colors: cream (#f5f0e6) for main outlines, orange (#c96a24) for accent details like a single wrench or bolt. Empty/open toolbox lid. Subtle dotted lines suggesting "add parts here". Simple, friendly, not sad or negative. Industrial aesthetic. Transparent background. No text. Suitable for dark olive background display.
```

#### NEGATIVE PROMPT

```
realistic, photographic, complex, detailed, sad faces, emoji, cartoon characters, gradients, shadows, 3D, multiple colors, busy, cluttered
```

#### VARIANT A — Wrench + Blueprint

```
Minimalist line illustration of a wrench resting on blank blueprint paper, vector style. 2px cream (#f5f0e6) strokes. Single orange (#c96a24) accent on wrench handle. Blueprint paper suggested by simple rectangle with corner fold. Grid pattern at very low opacity on paper. Clean, technical, inviting. Transparent background.
```

---

### 3.2 Empty State — No Results

**Output:** `ui-empty-no-results-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 300×200 (vector)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT

```
Minimalist line illustration of a magnifying glass with no results, vector style. Clean 2-3px strokes. Cream color (#f5f0e6) for magnifying glass outline. Orange (#c96a24) for a small "X" or empty indicator inside lens. Optional: small scattered parts symbols around (sprocket, bolt) at very low opacity suggesting "nothing found". Simple, clear, not frustrating. Transparent background. No text.
```

#### NEGATIVE PROMPT

```
sad face, emoji, cartoon character, realistic, complex, gradients, shadows, 3D, busy, broken glass, negative imagery
```

---

### 3.3 Empty State — Cart

**Output:** `ui-empty-cart-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 300×200 (vector)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT

```
Minimalist line illustration of empty shopping cart or parts bin, vector style. 2px cream (#f5f0e6) strokes for cart outline. Orange (#c96a24) accent on wheel or handle. Cart is clearly empty, viewed from 3/4 angle. Simple grid or mesh pattern for cart body. Industrial/hardware store aesthetic, not grocery. Transparent background. No text. Clean and inviting, not sad.
```

#### NEGATIVE PROMPT

```
grocery cart, sad, broken, realistic, complex, shadows, 3D, cartoon face, emoji, gradients
```

---

## 4. Compatibility Icons

---

### 4.1 Compatibility — OK

**Output:** `icon-compat-ok-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT

```
Simple checkmark icon, 24x24 pixels, vector. Single 2px stroke weight. Color: muted green (#4a7c59). Circle outline with checkmark inside, or standalone checkmark. Clean, minimal, technical. Not rounded/bubbly. Sharp, precise corners appropriate for industrial/technical UI. Transparent background.
```

#### NEGATIVE PROMPT

```
thick strokes, filled shape, gradient, shadow, glow, emoji style, cartoon, rounded bubbly, 3D
```

---

### 4.2 Compatibility — Warning

**Output:** `icon-compat-warn-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT

```
Warning triangle icon with exclamation mark, 24x24 pixels, vector. 2px stroke weight. Color: orange (#d4803c). Equilateral triangle outline with centered exclamation mark (line + dot). Sharp corners, not rounded. Technical, industrial style. Distinct shape from checkmark (OK) and X (Error). Transparent background.
```

#### NEGATIVE PROMPT

```
filled shape, rounded corners, gradient, shadow, emoji, cartoon, 3D, thick strokes
```

---

### 4.3 Compatibility — Error

**Output:** `icon-compat-error-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT

```
Error X icon inside octagon or circle, 24x24 pixels, vector. 2px stroke weight. Color: muted red (#a63d40). Octagon shape (stop sign form) with X inside, OR circle with X. Distinct shape from triangle (warning) and checkmark (OK). Sharp, technical aesthetic. Transparent background.
```

#### NEGATIVE PROMPT

```
filled shape, rounded soft, gradient, shadow, emoji, skull, cartoon, 3D
```

---

### 4.4 Compatibility — Unknown

**Output:** `icon-compat-unknown-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT

```
Question mark icon inside circle, 24x24 pixels, vector. 2px stroke weight. Color: muted olive (#5d634d). Simple circle outline with centered question mark. Clean, minimal, neutral. Technical style. Transparent background.
```

#### NEGATIVE PROMPT

```
filled, gradient, shadow, emoji, cartoon face, 3D, colorful
```

---

## 5. Placeholder Images

---

### 5.1 Part Placeholder

**Output:** `placeholder-part-v1.svg`  
**Folder:** `/placeholders/`  
**Resolution:** 400×400 (vector, square)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT

```
Generic mechanical part placeholder icon, 400x400, vector. Subtle grid background pattern (olive #3d4233 at 30% opacity). Centered generic part silhouette: could be abstract sprocket or bolt shape. Outline only, 2-3px stroke, cream color (#f5f0e6). Very minimal, suggests "part image missing". Industrial, technical aesthetic. Transparent overall background. No text.
```

#### NEGATIVE PROMPT

```
specific part, realistic, photographic, text, "no image", sad face, complex, busy, colorful
```

---

### 5.2 Engine Placeholder

**Output:** `placeholder-engine-v1.svg`  
**Folder:** `/placeholders/`  
**Resolution:** 600×400 (vector, 3:2)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT

```
Generic small engine silhouette placeholder, 600x400, vector. Subtle technical grid background (olive #3d4233 at 30% opacity). Centered simplified engine block outline: rectangular base, cylinder head suggestion, pull-start handle shape. 2-3px cream (#f5f0e6) strokes. Abstract enough to be universal (not specific brand). Industrial blueprint aesthetic. Transparent background. No text.
```

#### NEGATIVE PROMPT

```
specific engine brand, realistic, photographic, text, labels, complex details, colored, car engine, large engine
```

---

### 5.3 Avatar Placeholder

**Output:** `placeholder-avatar-v1.svg`  
**Folder:** `/placeholders/`  
**Resolution:** 100×100 (vector, square)  
**Background:** Transparent  
**Safe Area:** 10px padding

#### PRIMARY PROMPT

```
User avatar placeholder, 100x100, vector. Racing helmet silhouette or wrench icon, simple outline style. 2px cream (#f5f0e6) stroke on transparent. Circle crop safe (main element within 80x80 center). Neutral, professional, motorsport themed. No face features. Industrial aesthetic.
```

#### NEGATIVE PROMPT

```
face, eyes, realistic, photographic, generic person silhouette, cartoon, emoji, colorful
```

---

## 6. Engine Family Badges

---

### 6.1 Badge — Predator

**Output:** `badge-engine-predator-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 80×24 (vector)  
**Background:** Transparent  
**Safe Area:** 4px padding

#### PRIMARY PROMPT

```
Text badge "PREDATOR", 80x24 pixels, vector. Dark olive background (#2d3226) with rounded rectangle shape (4px radius). Orange (#c96a24) left accent bar (4px wide). Cream (#f5f0e6) condensed uppercase text "PREDATOR". 1px olive-600 (#4d5340) border. Clean, technical, motorsport label aesthetic. Badge/tag style.
```

#### NEGATIVE PROMPT

```
decorative, fancy, script font, gradient, glow, shadow, 3D, cartoon, logo, icon imagery
```

---

### 6.2 Badge — Clone

**Output:** `badge-engine-clone-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 80×24 (vector)  
**Background:** Transparent  
**Safe Area:** 4px padding

#### PRIMARY PROMPT

```
Text badge "CLONE", 80x24 pixels, vector. Dark olive background (#2d3226) with rounded rectangle (4px radius). Cream (#f5f0e6) left accent bar (4px wide) — differentiated from Predator. Cream (#f5f0e6) condensed uppercase text "CLONE". 1px olive-600 border. Neutral, generic indicator badge. Technical label style.
```

#### NEGATIVE PROMPT

```
decorative, gradient, glow, 3D, logo imagery, cartoon
```

---

### 6.3 Badge — Tillotson

**Output:** `badge-engine-tillotson-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 80×24 (vector)  
**Background:** Transparent  
**Safe Area:** 4px padding

#### PRIMARY PROMPT

```
Text badge "TILLOTSON", 80x24 pixels, vector. Dark olive background (#2d3226) with rounded rectangle. Orange (#c96a24) left accent bar. Cream (#f5f0e6) condensed uppercase text "TILLOTSON" (smaller font to fit). 1px border. Racing/competition engine indicator. Technical badge style.
```

#### NEGATIVE PROMPT

```
official Tillotson logo, decorative, gradient, 3D
```

---

### 6.4 Badge — Briggs

**Output:** `badge-engine-briggs-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 80×24 (vector)  
**Background:** Transparent  
**Safe Area:** 4px padding

#### PRIMARY PROMPT

```
Text badge "BRIGGS", 80x24 pixels, vector. Dark olive background (#2d3226) with rounded rectangle. Orange-300 (#e09654) left accent bar — slightly different tone. Cream condensed uppercase text "BRIGGS". 1px border. Classic engine family indicator. Technical badge.
```

#### NEGATIVE PROMPT

```
Briggs & Stratton official logo, red, decorative, gradient
```

---

## 7. Guide Header Images

---

### 7.1 Guide — Getting Started

**Output:** `guide-header-getting-started-v1-1200x400.webp`  
**Folder:** `/ui/`  
**Resolution:** 1200×400 (3:1)  
**Background:** Solid `#1a1e15`  
**Safe Area:** 40px top/bottom, 60px sides (for title overlay)

#### PRIMARY PROMPT

```
Dark workshop welcome scene, 1200x400 banner. Deep olive background (#1a1e15). Welcoming composition: clean workbench surface in foreground, organized tool wall in soft focus background. Warm orange accent light from right side illuminating the workspace invitingly. Film grain texture. Sense of possibility, fresh start. Not cluttered, not intimidating. Space for "Getting Started" title overlay on left third. Moody but optimistic. No text.
```

#### NEGATIVE PROMPT

```
bright, messy, intimidating, complex machinery, people, text, logos, finished vehicles, neon, cartoon
```

---

### 7.2 Guide — Engine Swap

**Output:** `guide-header-engine-swap-v1-1200x400.webp`  
**Folder:** `/ui/`  
**Resolution:** 1200×400 (3:1)  
**Background:** Solid `#1a1e15`  
**Safe Area:** 40px top/bottom

#### PRIMARY PROMPT

```
Dark atmospheric engine installation scene, 1200x400. Deep olive background (#1a1e15). Low angle view of small engine (Predator-style clone) being positioned, hands NOT visible. Engine highlighted by warm orange work light. Surrounding darkness. Chain hoist or engine stand partially visible. Technical, serious, focused mood. Film grain. Space for title text on right side. No text in image.
```

#### NEGATIVE PROMPT

```
hands, people, faces, bright, clean, modern, text, logos, car engine, large machinery
```

---

### 7.3 Guide — First Build

**Output:** `guide-header-first-build-v1-1200x400.webp`  
**Folder:** `/ui/`  
**Resolution:** 1200×400 (3:1)  
**Background:** Solid `#1a1e15`  
**Safe Area:** 40px top/bottom

#### PRIMARY PROMPT

```
Dark dramatic shot of bare go-kart frame/chassis, 1200x400. Deep olive background (#1a1e15). Clean tubular steel frame on work stand, no engine, no wheels — skeleton awaiting parts. Dramatic side lighting creating strong shadows. Potential and promise aesthetic. Film grain texture. Orange accent light hitting metal tubes. Industrial concrete floor. No text, no logos. Space for title overlay.
```

#### NEGATIVE PROMPT

```
complete kart, racing action, people, bright, colorful, text, logos, cluttered, busy background
```

---

## 8. UI Loading & Feedback

---

### 8.1 Loading Spinner

**Output:** `ui-spinner-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 48×48 (vector)  
**Background:** Transparent  
**Safe Area:** 4px padding

#### PRIMARY PROMPT

```
Simple loading spinner, 48x48, vector SVG. Circular arc design (not complete circle). 3px stroke weight. Orange color (#c96a24). Approximately 270 degrees of arc with 90 degree gap. Clean, minimal, technical. Will be animated via CSS rotation. Transparent background. No center element.
```

#### NEGATIVE PROMPT

```
complex, multiple elements, dots, bars, gradient, glow, 3D, filled circle
```

---

## 9. Store/Commerce Badges

---

### 9.1 Badge — Verified Seller

**Output:** `badge-verified-seller-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 100×24 (vector)  
**Background:** Transparent  
**Safe Area:** 4px padding

#### PRIMARY PROMPT

```
Text badge with icon "✓ VERIFIED", 100x24 pixels, vector. Dark olive background (#2d3226) rounded rectangle. Small checkmark icon (green #4a7c59) on left + cream text "VERIFIED" condensed uppercase. 1px border. Trust indicator badge. Clean, professional, technical.
```

#### NEGATIVE PROMPT

```
shield, ribbon, decorative, gradient, 3D, cartoon
```

---

### 9.2 Badge — In Stock

**Output:** `badge-in-stock-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 60×20 (vector)  
**Background:** Transparent  
**Safe Area:** 3px padding

#### PRIMARY PROMPT

```
Small status badge "IN STOCK", 60x20 pixels, vector. Pill shape, no fill (transparent or very subtle olive). Green (#4a7c59) small dot (4px) on left + cream (#f5f0e6) condensed text "IN STOCK". Minimal, inline status indicator. 1px green border optional.
```

#### NEGATIVE PROMPT

```
filled background, large, decorative, gradient, 3D
```

---

### 9.3 Badge — Low Stock

**Output:** `badge-low-stock-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 70×20 (vector)  
**Background:** Transparent  
**Safe Area:** 3px padding

#### PRIMARY PROMPT

```
Small status badge "LOW STOCK", 70x20 pixels, vector. Pill shape. Orange (#d4803c) small dot (4px) on left + cream condensed text "LOW STOCK". Urgency indicator but not alarming. Minimal inline style.
```

#### NEGATIVE PROMPT

```
large, filled, warning triangle, decorative, 3D
```

---

### 9.4 Badge — Out of Stock

**Output:** `badge-out-of-stock-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 80×20 (vector)  
**Background:** Transparent  
**Safe Area:** 3px padding

#### PRIMARY PROMPT

```
Small status badge "OUT OF STOCK", 80x20 pixels, vector. Pill shape. Red (#a63d40) small dot (4px) on left + muted cream (#d9cba8) condensed text "OUT OF STOCK". Definitive but not aggressive. Minimal inline style.
```

#### NEGATIVE PROMPT

```
X icon, large, filled background, alarming, 3D
```

---

## 10. Prompt Engineering Notes

### Style Consistency Keywords

Always include in prompts for cohesive output:
- "dark olive-green" or "deep olive" with hex `#1a1e15`
- "film grain texture"
- "industrial aesthetic"
- "vintage motorsport"
- "utilitarian"
- "garage-built feel"
- "no text, no logos"

### Negative Prompt Essentials

Always include to avoid off-brand results:
- "bright, neon, colorful"
- "glossy, clean, sterile, modern"
- "futuristic, cyberpunk"
- "cartoon, illustration" (unless for illustrations)
- "text, logos, watermarks"
- "people, faces, hands"

### Resolution Tips

- Generate at 2x target resolution when possible, then downscale
- WebP at 80-85% quality balances size/quality
- PNG for OG images (exact pixel rendering needed)
- SVG should be hand-optimized after generation

### Color Accuracy

- Provide hex values in prompts: `#1a1e15`, `#c96a24`, `#f5f0e6`
- Use color picker verification after generation
- Adjust in post if generator shifts colors

---

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-16 | Initial prompts created |
