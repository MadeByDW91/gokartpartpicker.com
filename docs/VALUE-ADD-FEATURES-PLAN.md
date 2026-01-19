# Value-Add Features Plan

> **Goal:** Provide more value to users beyond basic part selection, making GoKartPartPicker the go-to resource for go-kart enthusiasts.

---

## 🎯 High-Value Features (Priority 1)

### 1. **Performance Calculator** ⭐
**User Value:** Help users understand how modifications affect their kart's performance.

**Features:**
- **HP Calculation with Modifications**
  - Base engine HP + part contributions
  - Calculate estimated HP from: exhaust, air filter, carburetor, cam, header
  - Show HP gain/loss per part category
  - Formula: `base_hp + Σ(part_hp_contribution)`

- **Torque Calculation**
  - Base engine torque + modifications
  - Torque curves (estimated) at different RPMs
  - Show peak torque RPM

- **Performance Estimates**
  - **Top Speed Estimator**: `top_speed = (hp × constant) / weight × gear_ratio`
  - **Acceleration Estimate**: 0-20mph, 0-30mph estimates
  - **Power-to-Weight Ratio**: HP per 100lbs

**Implementation:**
- Add `hp_contribution` and `torque_contribution` fields to parts (`specifications` JSONB)
- Create `calculateBuildPerformance(build)` function
- Display performance metrics in build summary

**UI:** 
- Performance card in builder showing:
  - Estimated HP: 6.5 → 8.2 HP (+1.7 from parts)
  - Estimated Torque: 8.1 → 9.5 lb-ft
  - Top Speed: ~35 mph
  - Power-to-Weight: 12.3 HP/100lbs

---

### 2. **Smart Build Recommendations** ⭐
**User Value:** Guide users to optimal part combinations based on their goals.

**Recommendation Engine:**
- **Goal-Based Suggestions**:
  - "I want maximum speed" → Suggest high-RPM parts, lightweight components
  - "I want low-end torque" → Suggest torque converters, shorter gears
  - "I want reliability" → Suggest OEM-compatible, well-rated parts
  - "I have a budget of $X" → Suggest best parts within budget

- **Part Compatibility Recommendations**:
  - "Users with this engine also selected..."
  - "This clutch works well with these sprockets..."
  - "Popular combinations" based on saved builds

- **Progressive Upgrades Path**:
  - "Start here" → "Then upgrade to" → "Finally add"
  - Guide users through logical upgrade sequences

**Implementation:**
- Add `recommendations` table with rules/algorithms
- Track popular part combinations from saved builds
- Create recommendation engine server action

---

### 3. **Build Comparison Tool** ⭐
**User Value:** Help users compare different builds side-by-side.

**Features:**
- Compare up to 3 builds side-by-side
- Compare metrics:
  - Total cost
  - Estimated HP/Torque
  - Part compatibility status
  - Weight differences
  - Top speed estimates
- Highlight differences visually
- "Best value" badge for cost/performance ratio

**UI:**
- Split view with build cards
- Color-coded differences (green/red)
- Export comparison as PDF/shareable link

---

### 4. **Cost Calculator & Budget Tracker** ⭐
**User Value:** Help users plan their build financially.

**Features:**
- **Real-time Cost Updates**: Show total as parts are added
- **Budget Alert**: Warn if build exceeds user's budget
- **Cost Breakdown by Category**:
  - Engine: $299
  - Drivetrain: $150
  - Safety: $50
  - Total: $499
- **Alternative Suggestions**: "Similar part for $20 less"
- **Price History**: Show price trends (if we track it)
- **Save for Later**: Track parts you want but aren't ready to buy

---

## 🚀 Medium-Value Features (Priority 2)

### 5. **Build Templates / Presets**
**User Value:** Quick-start builds for common use cases.

**Preset Builds:**
- "Budget Racer" - Under $400, basic performance
- "Speed Demon" - Maximum speed, top parts
- "Torque Monster" - Low-end power, off-road focused
- "Beginner Build" - Simple, reliable, easy to maintain
- "Competition Ready" - Full performance build
- "Kids Kart" - Safe, governed, reliable

**Features:**
- One-click apply template to builder
- Customize template before saving
- Share custom templates
- Community-submitted templates

---

### 6. **Shopping List Generator**
**User Value:** Export build as actionable shopping list.

**Features:**
- Generate printable shopping list
- Export to CSV/PDF
- Check off items as purchased
- Include part numbers, URLs, prices
- Group by supplier/store
- Show compatibility notes

**Format:**
```
GoKart Build Shopping List - "My Speed Build"
==============================================
Engine:
  [ ] Predator 212 Hemi - $299 (Harbor Freight)
  
Drivetrain:
  [ ] MaxTorque Clutch 3/4" - $45 (Amazon)
  [ ] #35 Chain 120 Links - $12 (Amazon)
  
[ ] Total: $356
```

---

### 7. **Build Visualization / 3D Preview** (Future)
**User Value:** Visual representation of how parts fit together.

**Phase 1: 2D Diagram**
- Simple line diagram showing engine → clutch → chain → axle
- Highlight selected parts
- Show part connections

**Phase 2: 3D Preview** (Advanced)
- 3D model viewer
- Rotate/zoom build
- Show part fitment

---

### 8. **Performance Tuning Guides**
**User Value:** Educational content that builds trust.

**Content:**
- "How to tune your carb for performance"
- "Governor removal guide (with safety warnings)"
- "Sprocket ratio selection guide"
- "Torque converter vs clutch decision guide"
- Video tutorials (embedded YouTube)

**Integration:**
- Link guides from relevant parts
- Show guides when parts are selected
- "Learn More" buttons throughout builder

---

### 9. **Community Build Gallery**
**User Value:** Inspiration and social proof.

**Features:**
- Public build showcase
- Build of the week/month
- Filter by engine, category, price range
- Comments/likes on builds
- User profiles showing their builds
- Build search/discovery

---

### 10. **Parts Comparison Tool**
**User Value:** Detailed side-by-side part comparison.

**Features:**
- Compare 2-4 parts from same category
- Compare specs: HP rating, RPM range, price, weight
- Show compatibility differences
- User reviews/ratings (if added)
- "Best for you" recommendation

**UI:**
- Table view with highlighted differences
- Visual spec charts (bar graphs)

---

## 💡 Additional Value-Add Ideas

### 11. **Build Estimator (No Account Needed)**
- Quick "Build a kart for me" wizard
- Ask: budget, goal (speed/torque), experience level
- Generate suggested build
- Encourage account creation to save

### 12. **Warranty & Reliability Tracker**
- Track part reliability issues
- Show warranty periods
- "Most reliable" badges
- User-reported issues (moderated)

### 13. **Safety Checklist**
- Generate safety checklist based on build
- Required safety items (brakes, guards, etc.)
- Safety warnings based on modifications
- Link to safety guides

### 14. **Build Progress Tracker**
- Track build completion percentage
- Checklist: "Engine purchased", "Parts ordered", "Installed"
- Notes/photos per phase
- Share progress updates

### 15. **Price Drop Alerts**
- Notify users when parts in saved builds go on sale
- Track price history
- "Price watch" for individual parts

### 16. **Mobile App Features** (Future)
- Barcode scanner for parts lookup
- Build photos from phone camera
- Quick reference guides offline
- Shopping list on-the-go

---

## 📊 Implementation Priority

### Phase 1 (Immediate Value)
1. ✅ Performance Calculator (HP/Torque)
2. ✅ Cost Calculator & Budget Tracker
3. ✅ Smart Build Recommendations (basic)
4. ✅ Shopping List Generator

### Phase 2 (Enhanced Engagement)
5. Build Templates / Presets
6. Build Comparison Tool
7. Parts Comparison Tool
8. Performance Tuning Guides

### Phase 3 (Community Features)
9. Community Build Gallery
10. Build Progress Tracker
11. User Reviews/Ratings

### Phase 4 (Advanced)
12. Build Visualization
13. Price Drop Alerts
14. Mobile App

---

## 🔧 Technical Implementation Notes

### Database Schema Additions

```sql
-- Part performance contributions
ALTER TABLE parts 
ADD COLUMN specifications JSONB DEFAULT '{}';
-- Include: hp_contribution, torque_contribution, rpm_range, etc.

-- Build templates
CREATE TABLE build_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  engine_id UUID REFERENCES engines(id),
  parts JSONB NOT NULL, -- {category: part_id}
  goal TEXT, -- 'speed', 'torque', 'budget', etc.
  total_price DECIMAL(10,2),
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences/goals
ALTER TABLE profiles
ADD COLUMN preferences JSONB DEFAULT '{}';
-- Include: default_budget, preferred_brands, build_goals, etc.

-- Saved for later / wishlist
CREATE TABLE user_wishlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  part_id UUID REFERENCES parts(id),
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Performance Calculation Formulas

```typescript
// HP Calculation
function calculateBuildHP(engine: Engine, parts: Part[]): number {
  let totalHP = engine.horsepower;
  
  parts.forEach(part => {
    const hpContribution = part.specifications?.hp_contribution || 0;
    totalHP += hpContribution;
  });
  
  // Apply diminishing returns for multiple performance parts
  // (More parts = less individual impact)
  
  return Math.round(totalHP * 10) / 10; // Round to 1 decimal
}

// Torque Calculation
function calculateBuildTorque(engine: Engine, parts: Part[]): number {
  let totalTorque = engine.torque || (engine.horsepower * 5252 / 3600);
  
  parts.forEach(part => {
    const torqueContribution = part.specifications?.torque_contribution || 0;
    totalTorque += torqueContribution;
  });
  
  return Math.round(totalTorque * 10) / 10;
}

// Top Speed Estimate (simplified)
function estimateTopSpeed(hp: number, weight: number, gearRatio: number): number {
  // Simplified formula - can be refined
  const constant = 200; // Empirical constant
  return Math.round((hp * constant) / (weight / 100) / gearRatio);
}
```

---

## 🎯 Success Metrics

Track these to measure value-add feature success:

1. **Engagement Metrics:**
   - Average time on builder page
   - Builds saved (conversion rate)
   - Features used per session

2. **Value Metrics:**
   - User-reported build completion rate
   - "This helped me" feedback
   - Return visits (users coming back to refine builds)

3. **Business Metrics:**
   - Affiliate click-through rate
   - Average build value (higher = better suggestions)
   - User retention rate

---

## 📝 Next Steps

1. **Start with Performance Calculator** - Highest immediate value
2. **Add cost tracking** - Already have price data, just need UI
3. **Build recommendations engine** - Use saved builds data
4. **Create build templates** - Admin can seed initial templates

---

*Last Updated: 2025-01-16*  
*Status: Planning Complete - Ready for Implementation*
