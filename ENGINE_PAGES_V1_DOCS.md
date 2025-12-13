# Engine Pages v1 - Documentation

## Overview

Engine Pages v1 provides a comprehensive one-stop hub for each engine with:
- Engine specifications and torque specs
- Schematics support
- Upgrade/mod catalog with checkbox selection
- Live calculators (HP/RPM/Risk)
- Tool lists with affiliate links
- Saved builds integration

## Data Models

### Engine (Extended)
- Added fields: `manufacturer`, `displacementCc`, `boreMm`, `strokeMm`, `compressionRatio`, `stockHp`, `stockRpmLimit`, `oilCapacityOz`, `oilType`
- Relations: `schematics`, `torqueSpecs`, `upgrades`

### EngineSchematic
- Stores schematic images and notes per engine
- Fields: `engineId`, `title`, `imageUrl`, `notes`

### TorqueSpec
- Torque specifications for engine fasteners
- Fields: `engineId`, `fastener`, `spec`, `unit`, `notes`, `category`

### Upgrade
- Upgrade/modification catalog
- Fields: `slug`, `name`, `category`, `description`, `hpGainMin/Max`, `rpmDelta`, `riskLevel`, `requires` (JSON), `conflicts` (JSON), `notes`
- Relations: `engines` (via EngineUpgrade), `tools` (via UpgradeTool)

### EngineUpgrade
- Join table linking engines to compatible upgrades

### Tool
- Tools required for upgrades
- Fields: `slug`, `name`, `description`, `affiliateUrl`, `vendor`, `priceHint`
- Relations: `upgrades` (via UpgradeTool)

### UpgradeTool
- Join table with `isRequired` flag

## Calculator Logic

The `calculateBuildMetrics()` function in `lib/buildCalculator.ts`:
- Calculates estimated HP: `stockHp + sum(average(hpGainMin, hpGainMax))`
- Calculates RPM limit: `stockRpmLimit + sum(rpmDelta)`
- Calculates risk score (0-100):
  - LOW risk: +5 points
  - MED risk: +15 points
  - HIGH risk: +30 points
  - RPM > 6000: +20 points
  - RPM > 5000: +10 points
- Checks requirements and conflicts
- Generates warnings

## Adding Content

### Using Prisma Studio (Recommended for v1)

1. **Start Prisma Studio:**
   ```bash
   npm run db:studio
   ```

2. **Add Engine Specs:**
   - Open `Engine` model
   - Edit existing engine or create new
   - Fill in: `manufacturer`, `displacementCc`, `boreMm`, `strokeMm`, `compressionRatio`, `stockHp`, `stockRpmLimit`, `oilCapacityOz`, `oilType`

3. **Add Torque Specs:**
   - Open `TorqueSpec` model
   - Click "Add record"
   - Fill in: `engineId` (select engine), `fastener`, `spec`, `unit`, `category`, `notes` (optional)

4. **Add Schematics:**
   - Open `EngineSchematic` model
   - Click "Add record"
   - Fill in: `engineId`, `title`, `imageUrl` (path to image), `notes` (optional)

5. **Add Upgrades:**
   - Open `Upgrade` model
   - Click "Add record"
   - Fill in all fields
   - For `requires` and `conflicts`: Enter as JSON array, e.g. `["upgrade-slug-1", "upgrade-slug-2"]`
   - Link to engines via `EngineUpgrade` model

6. **Add Tools:**
   - Open `Tool` model
   - Click "Add record"
   - Fill in: `slug`, `name`, `description`, `affiliateUrl`, `vendor`, `priceHint`
   - Link to upgrades via `UpgradeTool` model (set `isRequired` flag)

### Using Seed Script

Edit `prisma/seed.ts` and add data following the existing patterns, then run:
```bash
npm run db:seed
```

## API Endpoints

### Builds API (Updated for Upgrades)

- `GET /api/builds` - List user's builds
- `POST /api/builds` - Create build (includes `engineId`, `engineSlug`, `selectedUpgradeIds`)
- `GET /api/builds/[id]` - Get build by ID
- `PUT /api/builds/[id]` - Update build
- `DELETE /api/builds/[id]` - Delete build

Build data structure:
```json
{
  "engineId": "engine-id",
  "engineSlug": "predator-212-hemi",
  "selectedUpgradeIds": ["upgrade-id-1", "upgrade-id-2"],
  "notes": "Optional notes"
}
```

## Loading Saved Builds

To load a saved build on the engine page:
1. Add `?load=buildId` query parameter
2. Component will fetch build data
3. Extract `engineSlug` and `selectedUpgradeIds`
4. Navigate to engine page and restore selections

## Manual Test Checklist

- [ ] Visit engine page (`/engines/predator-212-hemi`)
- [ ] See Overview tab with engine specs
- [ ] See Schematics tab (if schematics exist)
- [ ] See Torque Specs tab with categorized specs
- [ ] See Upgrades tab with calculator
- [ ] Toggle upgrades, see HP/RPM/risk update in real-time
- [ ] Select upgrade with requirements, see warning if requirements not met
- [ ] Select conflicting upgrades, see conflict warning
- [ ] See Tools tab update with tools for selected upgrades
- [ ] Tools are deduplicated and required tools shown first
- [ ] Click affiliate links, verify they open correctly
- [ ] Log in, go to Save Build tab
- [ ] Enter build name, save build
- [ ] Go to `/my-builds`, see saved build
- [ ] Click "Load" on saved build
- [ ] Build loads with engine and upgrades selected
- [ ] Create 10 builds, verify 11th is blocked
- [ ] Verify another user cannot access your builds

## Future Enhancements

- Interactive schematics with hotspots
- Build comparison tool
- Export build as PDF/JSON
- Share builds via URL
- Admin UI for content management
- Image upload for schematics
- More detailed risk calculations
- Build templates/presets


