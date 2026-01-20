# Value-Add Assets — Image Generation Prompts

> **Version:** 1.0  
> **Last Updated:** 2026-01-16  
> **Status:** Ready for Asset Generation

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

| Name | Hex | RGB |
|------|-----|-----|
| Olive-900 (Dark BG) | `#1a1e15` | rgb(26, 30, 21) |
| Orange-500 (Accent) | `#c96a24` | rgb(201, 106, 36) |
| Cream-100 (Text) | `#f5f0e6` | rgb(245, 240, 230) |
| Success Green | `#4a7c59` | rgb(74, 124, 89) |
| Warning Orange | `#d4803c` | rgb(212, 128, 60) |
| Error Red | `#a63d40` | rgb(166, 61, 64) |

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
Simple engine block icon, 24x24 pixels, vector silhouette. Horizontal small engine block shape: rectangular base with cooling fins visible on top, cylinder head suggested, pull-start handle shape on side. Single weight 2px stroke in cream color (#f5f0e6). Minimal detail, recognizable at small size. Transparent background. Go-kart engine style, not car engine. Industrial, technical aesthetic.
```

#### NEGATIVE PROMPT
```
car engine, large engine, detailed, complex, filled shape, gradient, shadow, 3D, colorful, text, realistic photo
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
Simple clutch disc icon, 24x24 pixels, vector silhouette. Circular clutch disc with teeth/notches around outer edge. Center hub with small circular center hole. 2px stroke in cream (#f5f0e6). Viewed from side angle showing depth. Minimal detail, recognizable at 24px. Transparent background. Go-kart clutch style, not automotive clutch.
```

#### NEGATIVE PROMPT
```
automotive clutch, complex, filled, gradient, 3D, realistic, detailed mechanism, text
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
Simple CVT torque converter icon, 24x24 pixels, vector silhouette. Two-pulley system: drive pulley on left, driven pulley on right, belt connecting them. Pulleys shown as circles with angled sides. 2px stroke in cream (#f5f0e6). Minimal detail, side view. Transparent background. Go-kart CVT style (Comet TAV2, 30-series style).
```

#### NEGATIVE PROMPT
```
automotive torque converter, automatic transmission, complex, filled, 3D, realistic, detailed
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
Simple chain link icon, 24x24 pixels, vector silhouette. Two interconnected chain links: oval/oblong links with visible connection point. 2px stroke in cream (#f5f0e6). Minimal detail showing link structure. Transparent background. Motorcycle/go-kart chain style.
```

#### NEGATIVE PROMPT
```
bicycle chain, necklace chain, complex, filled, gradient, 3D, realistic, detailed mechanism
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
Simple sprocket gear icon, 24x24 pixels, vector silhouette. Circular sprocket with visible teeth around perimeter (8-10 teeth). Center hub with hole. 2px stroke in cream (#f5f0e6). Front view showing teeth pattern. Minimal detail, recognizable at small size. Transparent background.
```

#### NEGATIVE PROMPT
```
gear, complex gear train, filled, gradient, 3D, realistic, detailed, text
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
Simple axle shaft icon, 24x24 pixels, vector silhouette. Horizontal cylindrical shaft: straight rod shape, slight taper at ends, keyway notch visible on one end. 2px stroke in cream (#f5f0e6). Side view. Minimal detail. Transparent background. Go-kart axle style.
```

#### NEGATIVE PROMPT
```
wheels on axle, complete assembly, complex, filled, 3D, realistic, detailed
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
Simple wheel and tire icon, 24x24 pixels, vector silhouette. Circular wheel with tire: outer tire profile, wheel rim visible inside, spoke pattern suggested (4-5 spokes). 2px stroke in cream (#f5f0e6). Front view. Minimal detail. Transparent background. Go-kart wheel style.
```

#### NEGATIVE PROMPT
```
car tire, bicycle wheel, complex, filled, gradient, 3D, realistic, detailed tread pattern
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
Simple brake disc icon, 24x24 pixels, vector silhouette. Circular brake disc with center hub: disc with ventilation holes or slots visible (3-4 holes). Center hub attachment point. 2px stroke in cream (#f5f0e6). Front/side view. Minimal detail. Transparent background. Disc brake style.
```

#### NEGATIVE PROMPT
```
drum brake, caliper, complex mechanism, filled, 3D, realistic, detailed
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
Simple exhaust pipe icon, 24x24 pixels, vector silhouette. Curved exhaust header pipe: starts wide at engine end, narrows to exit, curved shape, flanges visible at connection. 2px stroke in cream (#f5f0e6). Side view. Minimal detail. Transparent background. Go-kart exhaust header style.
```

#### NEGATIVE PROMPT
```
car exhaust, muffler, complex system, filled, 3D, realistic, detailed catalytic converter
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
Simple go-kart frame chassis icon, 24x24 pixels, vector silhouette. Tubular frame outline: main rails, front bumper bar, rear axle mounts. Rectangular/trapezoid shape suggesting kart frame. 2px stroke in cream (#f5f0e6). Top-down or side view. Minimal detail. Transparent background. Racing kart frame style.
```

#### NEGATIVE PROMPT
```
complete kart, wheels, engine, complex, filled, 3D, realistic, detailed welding
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
Horizontal multi-step progress indicator, 300x60 pixels, vector. Three connected steps: left step with engine icon (completed - orange #c96a24 fill), middle step with parts/package icon (active - orange border, cream fill), right step with checkmark (pending - gray border, transparent). Connecting lines between steps. Step labels: "Engine", "Parts", "Review" in small cream text below. Clean, minimal, technical aesthetic. Transparent background.
```

#### NEGATIVE PROMPT
```
filled backgrounds, gradients, shadows, 3D, realistic, complex illustrations, people, text overlays, busy
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
Circular gauge meter, 200x200 pixels, vector. Semi-circle gauge arc (270 degrees) with tick marks. Color zones: green (#4a7c59) from 70-100%, orange (#d4803c) from 40-70%, red (#a63d40) from 0-40%. Needle pointer at top center indicating 100%. Center area clear for percentage number. Minimal, technical gauge style. Transparent background. Speedometer/percentage gauge aesthetic.
```

#### NEGATIVE PROMPT
```
filled background, complex dials, multiple needles, 3D, realistic, detailed, text in center, gradients
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
Build preview card template, 400x300 pixels, vector. Card layout: top section with small engine badge (rounded rectangle, orange accent), middle section with 3-4 small part icon silhouettes in row (sprocket, clutch, chain), bottom section with total price tag ($XXX) and compatibility status dot (green circle). All elements in cream (#f5f0e6) and orange (#c96a24) accents. Minimal, card-style layout. Transparent background. Ready for dynamic content overlay.
```

#### NEGATIVE PROMPT
```
filled card background, shadows, 3D, realistic photos, specific part names, detailed illustrations, text content
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
Friendly onboarding illustration, 600x400 pixels, vector. Welcome scene: left side shows person silhouette with tool in hand (welcoming gesture), right side shows simple go-kart frame with parts being added (sprocket, chain). Arrow pointing from person to kart. Small icons: wrench, engine, parts package. All in cream (#f5f0e6) with orange (#c96a24) accents. Friendly, approachable, non-intimidating. Minimal detail. Transparent background. "Start building" message feel.
```

#### NEGATIVE PROMPT
```
detailed faces, realistic people, complex machinery, intimidating, scary, busy, cluttered, text labels, cartoon style
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
Celebration success illustration, 400x300 pixels, vector. Center: large checkmark circle (orange #c96a24 border, cream #f5f0e6 fill). Surrounding: subtle celebration elements - small sparkles/stars, confetti dots (orange and cream). Bottom: simple go-kart silhouette (completed). Positive, celebratory, achievement feel. Minimal detail. Transparent background. Success state visual.
```

#### NEGATIVE PROMPT
```
party hats, balloons, detailed faces, complex, busy, cluttered, text, realistic confetti, gradients
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
Educational compatibility diagram, 500x350 pixels, vector. Visual explanation: left shows engine icon, connected by green checkmark arrow to middle part (clutch), connected by green checkmark arrow to right part (sprocket). "Compatible" label below connections. Bottom: example of incompatible - engine connected by red X arrow to wrong part. All icons simplified (2px strokes in cream), arrows in green (#4a7c59) or red (#a63d40). Clean, educational, diagram style. Transparent background.
```

#### NEGATIVE PROMPT
```
detailed parts, realistic, complex mechanisms, text explanations, busy, cluttered, 3D, gradients
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
Status badge "100% COMPATIBLE", 100x32 pixels, vector. Rounded rectangle badge (4px radius). Green (#4a7c59) left accent bar (4px wide). Cream (#f5f0e6) condensed uppercase text. 1px green border. Clean, technical badge style. Success indicator. Transparent background.
```

#### NEGATIVE PROMPT
```
gradient, shadow, 3D, decorative, fancy, script font, complex illustration
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
Share success confirmation, 300x200 pixels, vector. Center: link icon or share icon (circled) with checkmark. Below: subtle "Link Copied" indicator (dotted line). Small link chain icon on side. All in cream (#f5f0e6) with orange (#c96a24) accents. Positive feedback visual. Minimal detail. Transparent background.
```

#### NEGATIVE PROMPT
```
detailed UI, text content, complex, busy, cluttered, 3D, realistic, gradients
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
Build comparison diagram, 500x300 pixels, vector. Two build cards side-by-side: left card with engine badge and 3 part icons, right card with different engine badge and different part icons. Center: comparison arrows (up/down) and equal signs. All in cream (#f5f0e6) and orange (#c96a24) accents. Minimal, comparison layout. Transparent background.
```

#### NEGATIVE PROMPT
```
filled cards, shadows, 3D, realistic, detailed content, text, busy, cluttered
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
Empty saved builds illustration, 300x200 pixels, vector. Two empty build card outlines (dashed lines) stacked. Small bookmark icon on side. "No saved builds yet" feel. Dotted lines suggesting "add here". Cream (#f5f0e6) strokes, orange (#c96a24) accents. Minimal, inviting. Transparent background.
```

#### NEGATIVE PROMPT
```
filled shapes, detailed content, busy, cluttered, sad, negative, text labels, complex
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
Compatibility conflict explanation, 500x300 pixels, vector. Visual showing incompatible parts: engine icon on left, red X mark in center, incompatible part icon on right. Warning triangle above. Below: suggested compatible part with green checkmark arrow. All icons simplified (2px cream strokes), red (#a63d40) for conflict, green (#4a7c59) for solution. Educational, helpful error state. Transparent background.
```

#### NEGATIVE PROMPT
```
detailed parts, realistic, complex, intimidating, scary, busy, cluttered, text explanations
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
Missing part warning, 400x250 pixels, vector. Center: question mark or empty slot shape (dashed outline). Warning icon (triangle) above. Surrounding: small part icons (clutch, chain) with checkmarks, one missing with question mark. Cream (#f5f0e6) and orange warning (#d4803c) colors. Helpful, informative warning state. Minimal detail. Transparent background.
```

#### NEGATIVE PROMPT
```
detailed parts, realistic, intimidating, scary, busy, cluttered, text, complex
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
Performance gauge meter, 200x200 pixels, vector. Semi-circle gauge arc (270 degrees) similar to compatibility gauge. Color zones: orange (#c96a24) high performance, cream (#f5f0e6) medium, gray low. Needle pointer. Center area clear for HP/torque number. Technical gauge style. Transparent background. Speedometer aesthetic.
```

#### NEGATIVE PROMPT
```
filled background, complex dials, multiple needles, 3D, realistic, detailed, text in center
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
Budget progress bar, 300x100 pixels, vector. Horizontal progress bar: dark olive background (#2d3226), orange (#c96a24) fill indicating spent amount (75% full). Markers showing budget limit. Dollar sign icon on left, percentage on right. Clean, technical progress indicator. Transparent background.
```

#### NEGATIVE PROMPT
```
gradient fill, 3D, realistic, detailed, text content, complex illustrations
```

---

## Summary

**Total Prompts:** 15 high-priority assets

**Priority 1 (Critical):** 10 assets
1. Part Category Icons (10 icons)
2. Build Progress Steps
3. Compatibility Score Gauge
4. Build Preview Thumbnail
5. First Build Guide
6. Build Complete Celebration
7. Compatibility Explanation Diagram
8. Compatibility Status Badge
9. Compatibility Conflict Visual
10. Missing Part Warning

**Priority 2 (Important):** 5 assets
11. Build Share Success
12. Build Comparison Visual
13. Empty Saved Builds
14. Performance Score Gauge
15. Budget Status Indicator

---

## Next Steps

1. Generate Part Category Icons first (highest impact)
2. Create Build Progress Steps (onboarding value)
3. Design gauges and status indicators
4. Add celebration and success visuals
5. Complete remaining assets

All prompts are ready to copy/paste into your image generation tool.
