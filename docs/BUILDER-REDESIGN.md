# Builder Redesign Plan

## Current Issues
- Build steps sidebar is cluttered with grouped categories
- Part selection feels disconnected from the build process
- Navigation between steps is not intuitive
- Visual feedback for selections could be better
- The layout doesn't scale well on mobile

## New Design Goals

### 1. Simplified Navigation
- **Tab-based interface** instead of sidebar steps
- Clear visual progress indicator
- Easy navigation between categories
- Quick access to build summary

### 2. Better Part Selection
- **Grid layout** with larger, more clickable cards
- Visual indicators for selected parts
- Compatibility badges on cards
- Quick filters/search within category
- "Recommended" section for each category

### 3. Improved Build Summary
- **Floating summary card** that's always visible
- Quick edit/remove actions
- Real-time price updates
- Compatibility warnings inline

### 4. Enhanced UX
- **Wizard-style flow** with "Next" buttons
- Progress bar showing completion
- Skip optional categories easily
- Quick preview of build before saving

## New Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: Build Your Kart | Progress: 3/8 | Actions     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌────────────────────────────────┐ │
│  │              │  │  Category Tabs (horizontal)     │ │
│  │  Build       │  │  [Engine] [Clutch] [Chain] ...  │ │
│  │  Summary     │  ├────────────────────────────────┤ │
│  │  (Sticky)    │  │                                 │ │
│  │              │  │  Parts Grid (responsive)        │ │
│  │  - Engine    │  │  [Card] [Card] [Card] [Card]   │ │
│  │  - Parts     │  │  [Card] [Card] [Card] [Card]   │ │
│  │  - Total     │  │                                 │ │
│  │              │  │  Recommendations Panel          │ │
│  │  [Save]      │  │                                 │ │
│  │  [Share]     │  │                                 │ │
│  └──────────────┘  └────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: New Tab Navigation
- Replace sidebar with horizontal tabs
- Add progress indicator
- Make tabs scrollable on mobile

### Phase 2: Enhanced Part Cards
- Larger cards with more information
- Better visual selection states
- Compatibility indicators
- Quick actions (view, select, compare)

### Phase 3: Improved Build Summary
- Floating/sticky summary panel
- Inline edit capabilities
- Better visual hierarchy
- Quick actions for each item

### Phase 4: Wizard Flow
- Add "Next" and "Previous" buttons
- Progress bar
- Skip optional steps
- Completion screen
