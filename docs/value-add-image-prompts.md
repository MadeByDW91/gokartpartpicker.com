# Value-Add Assets — Image Generation Prompts

> **Version:** 2.0  
> **Last Updated:** 2026-01-16  
> **Status:** Ready for Asset Generation — Theme-Aligned

---

## 🎨 Theme Guidelines

**GoKartPartPicker Aesthetic:**
- **Vintage motorsport badge** — rounded rectangles, emblem forms
- **Industrial/garage-built** — utilitarian, authentic, not decorative
- **Dark olive base** (`#1a1e15`) with **orange accents** (`#c96a24`)
- **Film grain texture** — subtle vintage feel
- **High contrast** — cream text on dark backgrounds
- **Bold, condensed typography** — Bebas Neue style
- **No glossy/SaaS aesthetics** — avoid modern, clean, sterile
- **Retro motorsport** — garage workshop, authentic tools

**Visual Do's:**
- Dark atmospheric backgrounds
- Subtle mechanical/industrial elements
- Orange accent lighting
- Film grain overlay
- Rounded badge shapes
- High contrast

**Visual Don'ts:**
- Bright, neon, colorful
- Glossy, clean, sterile
- Modern, futuristic, cyberpunk
- Cartoon, illustration style
- Light backgrounds
- Complex gradients

---

## Usage Instructions

Each section contains:
1. **Output filename** — exact filename to save as
2. **Target folder** — path relative to `/frontend/public/`
3. **Resolution/Aspect** — exact dimensions
4. **Background rules** — what the background should be
5. **Safe area notes** — margins for overlays
6. **PRIMARY PROMPT** — copy/paste into image generator
7. **NEGATIVE PROMPT** — copy/paste to exclude unwanted elements

### Brand Color Reference

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Olive-900 (Dark BG) | `#1a1e15` | rgb(26, 30, 21) | Primary backgrounds |
| Olive-800 | `#2d3226` | rgb(45, 50, 38) | Secondary backgrounds |
| Olive-700 | `#3d4233` | rgb(61, 66, 51) | Card backgrounds |
| Orange-500 (Accent) | `#c96a24` | rgb(201, 106, 36) | Primary accent, CTAs |
| Orange-400 | `#d4803c` | rgb(212, 128, 60) | Hover states |
| Cream-100 (Text) | `#f5f0e6` | rgb(245, 240, 230) | Primary text |
| Success Green | `#4a7c59` | rgb(74, 124, 89) | Compatibility OK |
| Warning Orange | `#d4803c` | rgb(212, 128, 60) | Warnings |
| Error Red | `#a63d40` | rgb(166, 61, 64) | Errors |

---

## 1. Part Category Icons (Priority 1)

### 1.1 Icon — Engine

**Output:** `icon-cat-engine-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport engine block icon, 24x24 pixels, vector silhouette. Horizontal small go-kart engine: rectangular base with cooling fins on top, cylinder head, pull-start handle on side. 2px stroke in cream (#f5f0e6). Minimal detail, utilitarian style. Transparent background. Industrial, garage-built aesthetic. Bold, confident strokes. No decorative elements.
```

#### NEGATIVE PROMPT
```
car engine, large engine, detailed, complex, filled shape, gradient, shadow, 3D, colorful, text, realistic photo, modern, glossy, clean, decorative, thin strokes
```

---

### 1.2 Icon — Clutch

**Output:** `icon-cat-clutch-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport clutch disc icon, 24x24 pixels, vector silhouette. Circular clutch disc with teeth around outer edge, center hub with hole. 2px stroke in cream (#f5f0e6). Side angle view showing depth. Minimal detail, utilitarian. Transparent background. Industrial, garage-built aesthetic. Go-kart clutch style. Bold strokes.
```

#### NEGATIVE PROMPT
```
automotive clutch, complex, filled, gradient, 3D, realistic, detailed mechanism, text, modern, glossy, decorative, thin strokes
```

---

### 1.3 Icon — Torque Converter

**Output:** `icon-cat-torque-converter-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport CVT torque converter icon, 24x24 pixels, vector silhouette. Two-pulley system: drive pulley on left, driven pulley on right, belt connecting them. Pulleys shown as circles with angled sides. 2px stroke in cream (#f5f0e6). Minimal detail, side view. Utilitarian style. Transparent background. Go-kart CVT style (Comet TAV2, 30-series). Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
automotive torque converter, automatic transmission, complex, filled, 3D, realistic, detailed, modern, glossy, decorative, thin strokes
```

---

### 1.4 Icon — Chain

**Output:** `icon-cat-chain-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport chain link icon, 24x24 pixels, vector silhouette. Two interconnected chain links: oval/oblong links with visible connection point. 2px stroke in cream (#f5f0e6). Minimal detail showing link structure. Utilitarian style. Transparent background. Motorcycle/go-kart chain style. Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
bicycle chain, necklace chain, complex, filled, gradient, 3D, realistic, detailed mechanism, modern, glossy, decorative, thin strokes
```

---

### 1.5 Icon — Sprocket

**Output:** `icon-cat-sprocket-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport sprocket gear icon, 24x24 pixels, vector silhouette. Circular sprocket with visible teeth around perimeter (8-10 teeth). Center hub with hole. 2px stroke in cream (#f5f0e6). Front view showing teeth pattern. Minimal detail, recognizable at small size. Utilitarian style. Transparent background. Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
gear, complex gear train, filled, gradient, 3D, realistic, detailed, text, modern, glossy, decorative, thin strokes
```

---

### 1.6 Icon — Axle

**Output:** `icon-cat-axle-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport axle shaft icon, 24x24 pixels, vector silhouette. Horizontal cylindrical shaft: straight rod shape, slight taper at ends, keyway notch visible on one end. 2px stroke in cream (#f5f0e6). Side view. Minimal detail. Utilitarian style. Transparent background. Go-kart axle style. Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
wheels on axle, complete assembly, complex, filled, 3D, realistic, detailed, modern, glossy, decorative, thin strokes
```

---

### 1.7 Icon — Wheel

**Output:** `icon-cat-wheel-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport wheel and tire icon, 24x24 pixels, vector silhouette. Circular wheel with tire: outer tire profile, wheel rim visible inside, spoke pattern suggested (4-5 spokes). 2px stroke in cream (#f5f0e6). Front view. Minimal detail. Utilitarian style. Transparent background. Go-kart wheel style. Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
car tire, bicycle wheel, complex, filled, gradient, 3D, realistic, detailed tread pattern, modern, glossy, decorative, thin strokes
```

---

### 1.8 Icon — Brake

**Output:** `icon-cat-brake-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport brake disc icon, 24x24 pixels, vector silhouette. Circular brake disc with center hub: disc with ventilation holes or slots visible (3-4 holes). Center hub attachment point. 2px stroke in cream (#f5f0e6). Front/side view. Minimal detail. Utilitarian style. Transparent background. Disc brake style. Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
drum brake, caliper, complex mechanism, filled, 3D, realistic, detailed, modern, glossy, decorative, thin strokes
```

---

### 1.9 Icon — Exhaust

**Output:** `icon-cat-exhaust-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport exhaust pipe icon, 24x24 pixels, vector silhouette. Curved exhaust header pipe: starts wide at engine end, narrows to exit, curved shape, flanges visible at connection. 2px stroke in cream (#f5f0e6). Side view. Minimal detail. Utilitarian style. Transparent background. Go-kart exhaust header style. Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
car exhaust, muffler, complex system, filled, 3D, realistic, detailed catalytic converter, modern, glossy, decorative, thin strokes
```

---

### 1.10 Icon — Frame

**Output:** `icon-cat-frame-v1.svg`  
**Folder:** `/icons/`  
**Resolution:** 24×24 (vector)  
**Background:** Transparent  
**Safe Area:** 2px padding

#### PRIMARY PROMPT
```
Vintage motorsport go-kart frame chassis icon, 24x24 pixels, vector silhouette. Tubular frame outline: main rails, front bumper bar, rear axle mounts. Rectangular/trapezoid shape suggesting kart frame. 2px stroke in cream (#f5f0e6). Top-down or side view. Minimal detail. Utilitarian style. Transparent background. Racing kart frame style. Industrial, garage-built aesthetic. Bold strokes.
```

#### NEGATIVE PROMPT
```
complete kart, wheels, engine, complex, filled, 3D, realistic, detailed welding, modern, glossy, decorative, thin strokes
```

---

## 2. Build Progress Steps (Priority 1)

**Output:** `ui-build-progress-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 300×60 (vector, horizontal)  
**Background:** Transparent  
**Safe Area:** 5px padding

#### PRIMARY PROMPT
```
Vintage motorsport build progress indicator, 300x60 pixels, vector. Three connected badge-style steps: left badge (rounded rectangle, orange #c96a24 fill, engine icon), middle badge (orange border #c96a24, cream #f5f0e6 fill, parts icon), right badge (gray border, transparent, checkmark). Connecting lines between badges. Step labels "ENGINE", "PARTS", "REVIEW" in condensed uppercase cream text below. Industrial, garage-built aesthetic. Film grain texture overlay at 3% opacity. Transparent background.
```

#### NEGATIVE PROMPT
```
filled backgrounds, gradients, shadows, 3D, realistic, complex illustrations, people, text overlays, busy, modern, glossy, clean, decorative, thin strokes, bright colors
```

---

## 3. Compatibility Score Gauge (Priority 1)

**Output:** `ui-compat-score-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 200×200 (vector, square)  
**Background:** Transparent  
**Safe Area:** 10px padding

#### PRIMARY PROMPT
```
Vintage motorsport compatibility gauge, 200x200 pixels, vector. Semi-circle gauge arc (270 degrees) with tick marks. Color zones: muted green (#4a7c59) 70-100%, orange (#d4803c) 40-70%, muted red (#a63d40) 0-40%. Needle pointer at top. Dark olive (#2d3226) gauge body. Center area clear for percentage. Industrial, garage-built aesthetic. Film grain texture at 5% opacity. Utilitarian, technical gauge style. Transparent background. Retro speedometer feel.
```

#### NEGATIVE PROMPT
```
filled background, complex dials, multiple needles, 3D, realistic, detailed, text in center, gradients, modern, glossy, clean, bright colors, decorative
```

---

## 4. Build Preview Thumbnail (Priority 1)

**Output:** `ui-build-preview-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 400×300 (vector, 4:3)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT
```
Vintage motorsport build preview card, 400x300 pixels, vector. Badge-style card: top section with engine badge (rounded rectangle, orange #c96a24 border, cream #f5f0e6 fill), middle section with 3-4 part icon silhouettes in row (sprocket, clutch, chain - cream strokes), bottom section with price tag badge and compatibility status dot (muted green #4a7c59). Dark olive (#2d3226) card background. Film grain texture at 3% opacity. Industrial, garage-built aesthetic. Utilitarian layout. Ready for dynamic content overlay.
```

#### NEGATIVE PROMPT
```
filled card background, shadows, 3D, realistic photos, specific part names, detailed illustrations, text content, modern, glossy, clean, bright colors, decorative, gradients
```

---

## 5. First Build Guide (Onboarding) (Priority 1)

**Output:** `ui-onboarding-first-build-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 600×400 (vector, 3:2)  
**Background:** Transparent  
**Safe Area:** 30px padding

#### PRIMARY PROMPT
```
Vintage motorsport onboarding illustration, 600x400 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Left: tool silhouette (wrench) in cream (#f5f0e6). Center: arrow in orange (#c96a24). Right: simple go-kart frame silhouette with parts being added (sprocket, chain). Small icons: engine badge, parts package. All in cream and orange accents. Industrial, garage-built aesthetic. Utilitarian, approachable, not intimidating. Minimal detail. Vintage motorsport badge style elements. "Start building" message feel.
```

#### NEGATIVE PROMPT
```
detailed faces, realistic people, complex machinery, intimidating, scary, busy, cluttered, text labels, cartoon style, modern, glossy, clean, bright colors, decorative, gradients
```

---

## 6. Build Complete Celebration (Priority 1)

**Output:** `ui-build-complete-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 400×300 (vector)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT
```
Vintage motorsport build complete celebration, 400x300 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Center: large checkmark in badge-style circle (orange #c96a24 border, cream #f5f0e6 fill). Surrounding: subtle celebration elements - small sparkles/stars in orange and cream. Bottom: simple go-kart silhouette (completed). Industrial, garage-built aesthetic. Positive, celebratory, achievement feel. Minimal detail. Utilitarian celebration style. Success state visual.
```

#### NEGATIVE PROMPT
```
party hats, balloons, detailed faces, complex, busy, cluttered, text, realistic confetti, gradients, modern, glossy, clean, bright colors, decorative
```

---

## 7. Compatibility Explanation Diagram (Priority 1)

**Output:** `ui-compat-explanation-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 500×350 (vector)  
**Background:** Transparent  
**Safe Area:** 25px padding

#### PRIMARY PROMPT
```
Vintage motorsport compatibility diagram, 500x350 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Visual explanation: left engine icon (cream #f5f0e6), connected by green checkmark arrow (#4a7c59) to middle part (clutch), connected by green arrow to right part (sprocket). "COMPATIBLE" label below in condensed uppercase cream text. Bottom: incompatible example - engine connected by red X arrow (#a63d40) to wrong part. All icons simplified (2px strokes), utilitarian style. Industrial, garage-built aesthetic. Educational diagram. Film grain overlay.
```

#### NEGATIVE PROMPT
```
detailed parts, realistic, complex mechanisms, text explanations, busy, cluttered, 3D, gradients, modern, glossy, clean, bright colors, decorative
```

---

## 8. Compatibility Status Badge (Priority 1)

**Output:** `badge-compat-status-v1.svg`  
**Folder:** `/badges/`  
**Resolution:** 100×32 (vector)  
**Background:** Transparent  
**Safe Area:** 4px padding

#### PRIMARY PROMPT
```
Vintage motorsport compatibility status badge, 100x32 pixels, vector. Badge-style rounded rectangle (4px radius, dark olive #2d3226 background). Muted green (#4a7c59) left accent bar (4px wide). Cream (#f5f0e6) condensed uppercase text "100% COMPATIBLE". 1px green border. Industrial, garage-built aesthetic. Film grain texture at 3% opacity. Utilitarian badge style. Transparent background.
```

#### NEGATIVE PROMPT
```
gradient, shadow, 3D, decorative, fancy, script font, complex illustration, modern, glossy, clean, bright colors
```

---

## 9. Build Share Success (Priority 2)

**Output:** `ui-share-success-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 300×200 (vector)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT
```
Vintage motorsport share success confirmation, 300x200 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Center: link icon in badge-style circle (orange #c96a24 border, cream #f5f0e6 fill) with checkmark. Below: subtle "LINK COPIED" indicator in condensed uppercase cream text. Small link chain icon on side in orange. Industrial, garage-built aesthetic. Positive feedback visual. Minimal detail. Utilitarian style.
```

#### NEGATIVE PROMPT
```
detailed UI, text content, complex, busy, cluttered, 3D, realistic, gradients, modern, glossy, clean, bright colors, decorative
```

---

## 10. Build Comparison Visual (Priority 2)

**Output:** `ui-comparison-visual-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 500×300 (vector)  
**Background:** Transparent  
**Safe Area:** 25px padding

#### PRIMARY PROMPT
```
Vintage motorsport build comparison diagram, 500x300 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Two badge-style build cards side-by-side: left card (dark olive #2d3226, orange border) with engine badge and 3 part icons, right card with different engine badge and part icons. Center: comparison arrows (up/down) and equal signs in orange (#c96a24). All in cream (#f5f0e6) and orange accents. Industrial, garage-built aesthetic. Minimal, utilitarian comparison layout.
```

#### NEGATIVE PROMPT
```
filled cards, shadows, 3D, realistic, detailed content, text, busy, cluttered, modern, glossy, clean, bright colors, decorative, gradients
```

---

## 11. Empty Saved Builds (Priority 2)

**Output:** `ui-empty-saved-builds-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 300×200 (vector)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT
```
Vintage motorsport empty saved builds illustration, 300x200 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Two empty badge-style build card outlines (dashed lines in cream #f5f0e6) stacked. Small bookmark icon on side in orange (#c96a24). "No saved builds yet" feel. Dotted lines suggesting "add here". Industrial, garage-built aesthetic. Minimal, inviting, not sad. Utilitarian style.
```

#### NEGATIVE PROMPT
```
filled shapes, detailed content, busy, cluttered, sad, negative, text labels, complex, modern, glossy, clean, bright colors, decorative
```

---

## 12. Compatibility Conflict Visual (Priority 1)

**Output:** `ui-compat-conflict-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 500×300 (vector)  
**Background:** Transparent  
**Safe Area:** 25px padding

#### PRIMARY PROMPT
```
Vintage motorsport compatibility conflict explanation, 500x300 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Visual showing incompatible parts: engine icon on left (cream #f5f0e6), red X mark in center (#a63d40), incompatible part icon on right. Warning triangle above in orange (#d4803c). Below: suggested compatible part with green checkmark arrow (#4a7c59). All icons simplified (2px strokes), utilitarian style. Industrial, garage-built aesthetic. Educational, helpful error state. Film grain overlay.
```

#### NEGATIVE PROMPT
```
detailed parts, realistic, complex, intimidating, scary, busy, cluttered, text explanations, modern, glossy, clean, bright colors, decorative, gradients
```

---

## 13. Missing Part Warning (Priority 1)

**Output:** `ui-missing-part-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 400×250 (vector)  
**Background:** Transparent  
**Safe Area:** 20px padding

#### PRIMARY PROMPT
```
Vintage motorsport missing part warning, 400x250 pixels, vector. Dark olive (#1a1e15) background with film grain texture. Center: question mark in badge-style circle (orange #d4803c border) or empty slot shape (dashed outline). Warning triangle above in orange. Surrounding: small part icons (clutch, chain) with checkmarks in cream (#f5f0e6), one missing with question mark. Industrial, garage-built aesthetic. Helpful, informative warning state. Minimal detail. Utilitarian style. Film grain overlay.
```

#### NEGATIVE PROMPT
```
detailed parts, realistic, intimidating, scary, busy, cluttered, text, complex, modern, glossy, clean, bright colors, decorative, gradients
```

---

## 14. Performance Score Gauge (Priority 2)

**Output:** `ui-performance-gauge-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 200×200 (vector, square)  
**Background:** Transparent  
**Safe Area:** 10px padding

#### PRIMARY PROMPT
```
Vintage motorsport performance gauge, 200x200 pixels, vector. Semi-circle gauge arc (270 degrees) with tick marks. Color zones: orange (#c96a24) high performance, cream (#f5f0e6) medium, muted gray low. Needle pointer. Dark olive (#2d3226) gauge body. Center area clear for HP/torque number. Industrial, garage-built aesthetic. Film grain texture at 5% opacity. Utilitarian, technical gauge style. Retro speedometer feel. Transparent background.
```

#### NEGATIVE PROMPT
```
filled background, complex dials, multiple needles, 3D, realistic, detailed, text in center, modern, glossy, clean, bright colors, decorative, gradients
```

---

## 15. Budget Status Indicator (Priority 2)

**Output:** `ui-budget-status-v1.svg`  
**Folder:** `/ui/`  
**Resolution:** 300×100 (vector, horizontal)  
**Background:** Transparent  
**Safe Area:** 10px padding

#### PRIMARY PROMPT
```
Vintage motorsport budget progress bar, 300x100 pixels, vector. Horizontal progress bar: dark olive background (#2d3226), orange (#c96a24) fill indicating spent amount (75% full). Markers showing budget limit. Dollar sign icon on left in cream (#f5f0e6), percentage on right. Film grain texture at 3% opacity. Industrial, garage-built aesthetic. Utilitarian, technical progress indicator. Badge-style container. Transparent background.
```

#### NEGATIVE PROMPT
```
gradient fill, 3D, realistic, detailed, text content, complex illustrations, modern, glossy, clean, bright colors, decorative
```

---

## Summary

**Total Prompts:** 15 high-priority assets (all theme-aligned)

**Priority 1 (Critical):** 10 assets
1. Part Category Icons (10 icons) - All updated with vintage motorsport aesthetic
2. Build Progress Steps - Badge-style with film grain
3. Compatibility Score Gauge - Retro speedometer style
4. Build Preview Thumbnail - Badge-style card with dark olive background
5. First Build Guide - Dark atmospheric onboarding
6. Build Complete Celebration - Vintage motorsport celebration
7. Compatibility Explanation Diagram - Industrial, educational
8. Compatibility Status Badge - Badge-style with film grain
9. Compatibility Conflict Visual - Dark olive background, utilitarian
10. Missing Part Warning - Badge-style warning with film grain

**Priority 2 (Important):** 5 assets
11. Build Share Success - Badge-style confirmation
12. Build Comparison Visual - Dark olive background, badge cards
13. Empty Saved Builds - Dark atmospheric empty state
14. Performance Score Gauge - Retro speedometer style
15. Budget Status Indicator - Badge-style progress bar

---

## 🎨 Theme Consistency Checklist

All prompts now include:
- ✅ **Vintage motorsport aesthetic** — retro, industrial, garage-built
- ✅ **Dark olive backgrounds** (`#1a1e15`) where appropriate
- ✅ **Film grain texture** (3-5% opacity) for vintage feel
- ✅ **Badge-style elements** — rounded rectangles, emblem forms
- ✅ **Orange accents** (`#c96a24`) for highlights
- ✅ **Cream text/icons** (`#f5f0e6`) for contrast
- ✅ **Utilitarian style** — no decorative elements
- ✅ **Industrial aesthetic** — garage workshop feel
- ✅ **High contrast** — dark backgrounds with light elements
- ✅ **Bold strokes** — confident, not thin/hairline
- ✅ **No modern/SaaS styling** — avoids glossy, clean, sterile

---

## Next Steps

1. Generate Part Category Icons first (highest impact, 10 icons)
2. Create Build Progress Steps (onboarding value)
3. Design gauges and status indicators (retro speedometer style)
4. Add celebration and success visuals (badge-style)
5. Complete remaining assets

**All prompts are theme-aligned and ready to copy/paste into your image generation tool.**
