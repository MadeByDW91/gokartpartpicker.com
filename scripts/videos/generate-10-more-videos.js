/**
 * Generate SQL to ADD 10 more videos per engine (100 total). Does NOT delete existing videos.
 * Run: node scripts/videos/generate-10-more-videos.js
 *
 * Apply after 20260116000019_seed_videos_25_per_engine.sql. Replace PLACEHOLDER via
 * Admin → Auto-fill URLs from YouTube or populate-from-youtube-api.ts.
 */
const fs = require('fs');
const path = require('path');

// 10 additional engine-specific topics per engine (display_order 25–34, is_featured=false)
const EXTRA_TOPICS = [
  { slug: 'predator-79', topics: [
    ['Predator 79cc Spark Plug and Ignition', 'Spark plug and ignition for Predator 79cc.', 'maintenance'],
    ['Predator 79cc Fuel Line and Tank Setup', 'Fuel line and tank setup for Predator 79cc.', 'installation'],
    ['Predator 79cc RPM and Rev Limit', 'RPM and rev limit for Predator 79cc.', 'tips'],
    ['Predator 79cc Recoil Starter Repair', 'Recoil starter repair for Predator 79cc.', 'troubleshooting'],
    ['Predator 79cc Pull Start Replacement', 'Pull start replacement for Predator 79cc.', 'maintenance'],
    ['Predator 79cc Chassis and Mounting Plate', 'Chassis and mounting plate for Predator 79cc.', 'installation'],
    ['Predator 79cc Mini Bike vs Go-Kart Setup', 'Mini bike vs go-kart setup for Predator 79cc.', 'tutorial'],
    ['Predator 79cc Cold Start and Warm-Up', 'Cold start and warm-up for Predator 79cc.', 'tips'],
    ['Predator 79cc Aftermarket Parts Overview', 'Aftermarket parts overview for Predator 79cc.', 'review'],
    ['Predator 79cc Noise and Exhaust Tips', 'Noise and exhaust tips for Predator 79cc.', 'modification'],
  ]},
  { slug: 'predator-212-non-hemi', topics: [
    ['Predator 212 Non-Hemi Spark Plug and Ignition', 'Spark plug and ignition for 212 Non-Hemi.', 'maintenance'],
    ['Predator 212 Non-Hemi Fuel Line and Tank', 'Fuel line and tank for 212 Non-Hemi.', 'installation'],
    ['Predator 212 Non-Hemi Stage 2 Upgrades', 'Stage 2 upgrades for 212 Non-Hemi.', 'modification'],
    ['Predator 212 Non-Hemi Recoil Starter Repair', 'Recoil starter repair for 212 Non-Hemi.', 'troubleshooting'],
    ['Predator 212 Non-Hemi Low Oil Shutdown', 'Low oil shutdown on 212 Non-Hemi.', 'troubleshooting'],
    ['Predator 212 Non-Hemi Chain Tension and Sprockets', 'Chain tension and sprockets for 212 Non-Hemi.', 'maintenance'],
    ['Predator 212 Non-Hemi Electric Start Conversion', 'Electric start conversion for 212 Non-Hemi.', 'modification'],
    ['Predator 212 Non-Hemi Dyno and Horsepower Test', 'Dyno and horsepower test for 212 Non-Hemi.', 'review'],
    ['Predator 212 Non-Hemi Cold Start Tips', 'Cold start tips for 212 Non-Hemi.', 'tips'],
    ['Predator 212 Non-Hemi Budget Build Guide', 'Budget build guide for 212 Non-Hemi.', 'tutorial'],
  ]},
  { slug: 'predator-212-hemi', topics: [
    ['Predator 212 Hemi Spark Plug and Ignition', 'Spark plug and ignition for 212 Hemi.', 'maintenance'],
    ['Predator 212 Hemi Fuel Line and Tank', 'Fuel line and tank for 212 Hemi.', 'installation'],
    ['Predator 212 Hemi Stage 2 and Cam Upgrades', 'Stage 2 and cam upgrades for 212 Hemi.', 'modification'],
    ['Predator 212 Hemi Recoil Starter Repair', 'Recoil starter repair for 212 Hemi.', 'troubleshooting'],
    ['Predator 212 Hemi Low Oil Shutdown', 'Low oil shutdown on 212 Hemi.', 'troubleshooting'],
    ['Predator 212 Hemi Chain Tension and Sprockets', 'Chain tension and sprockets for 212 Hemi.', 'maintenance'],
    ['Predator 212 Hemi Electric Start Conversion', 'Electric start conversion for 212 Hemi.', 'modification'],
    ['Predator 212 Hemi Dyno and Horsepower Test', 'Dyno and horsepower test for 212 Hemi.', 'review'],
    ['Predator 212 Hemi Cold Start Tips', 'Cold start tips for 212 Hemi.', 'tips'],
    ['Predator 212 Hemi Budget Build Guide', 'Budget build guide for 212 Hemi.', 'tutorial'],
  ]},
  { slug: 'predator-ghost', topics: [
    ['Predator Ghost 212 Spark Plug and Ignition', 'Spark plug and ignition for Ghost 212.', 'maintenance'],
    ['Predator Ghost 212 Fuel Line and Tank', 'Fuel line and tank for Ghost 212.', 'installation'],
    ['Predator Ghost 212 Cam and Rod Upgrades', 'Cam and rod upgrades for Ghost 212.', 'modification'],
    ['Predator Ghost 212 Recoil Starter Repair', 'Recoil starter repair for Ghost 212.', 'troubleshooting'],
    ['Predator Ghost 212 Low Oil Shutdown', 'Low oil shutdown on Ghost 212.', 'troubleshooting'],
    ['Predator Ghost 212 Chain and Sprocket Setup for Racing', 'Chain and sprocket setup for Ghost 212 racing.', 'maintenance'],
    ['Predator Ghost 212 Electric Start Conversion', 'Electric start conversion for Ghost 212.', 'modification'],
    ['Predator Ghost 212 Dyno and Horsepower Test', 'Dyno and horsepower test for Ghost 212.', 'review'],
    ['Predator Ghost 212 Cold Start and Tuning', 'Cold start and tuning for Ghost 212.', 'tips'],
    ['Predator Ghost 212 Budget Racing Build', 'Budget racing build for Ghost 212.', 'tutorial'],
  ]},
  { slug: 'predator-224', topics: [
    ['Predator 224 Spark Plug and Ignition', 'Spark plug and ignition for Predator 224.', 'maintenance'],
    ['Predator 224 Fuel Line and Tank', 'Fuel line and tank for Predator 224.', 'installation'],
    ['Predator 224 7/8" Shaft Adapters and Hubs', '7/8" shaft adapters and hubs for Predator 224.', 'installation'],
    ['Predator 224 Recoil Starter Repair', 'Recoil starter repair for Predator 224.', 'troubleshooting'],
    ['Predator 224 Low Oil Shutdown', 'Low oil shutdown on Predator 224.', 'troubleshooting'],
    ['Predator 224 Chain Tension and Sprockets', 'Chain tension and sprockets for Predator 224.', 'maintenance'],
    ['Predator 224 Electric Start Conversion', 'Electric start conversion for Predator 224.', 'modification'],
    ['Predator 224 Dyno and Torque Test', 'Dyno and torque test for Predator 224.', 'review'],
    ['Predator 224 Cold Start and Mud Use', 'Cold start and mud use for Predator 224.', 'tips'],
    ['Predator 224 Budget Mud Kart Build', 'Budget mud kart build for Predator 224.', 'tutorial'],
  ]},
  { slug: 'predator-301', topics: [
    ['Predator 301 Spark Plug and Ignition', 'Spark plug and ignition for Predator 301.', 'maintenance'],
    ['Predator 301 Fuel Line and Tank', 'Fuel line and tank for Predator 301.', 'installation'],
    ['Predator 301 1" Shaft Adapters and Hubs', '1" shaft adapters and hubs for Predator 301.', 'installation'],
    ['Predator 301 Recoil Starter Repair', 'Recoil starter repair for Predator 301.', 'troubleshooting'],
    ['Predator 301 Low Oil Shutdown', 'Low oil shutdown on Predator 301.', 'troubleshooting'],
    ['Predator 301 Chain Tension and Sprockets', 'Chain tension and sprockets for Predator 301.', 'maintenance'],
    ['Predator 301 Electric Start and Charging', 'Electric start and charging for Predator 301.', 'modification'],
    ['Predator 301 Dyno and Horsepower Test', 'Dyno and horsepower test for Predator 301.', 'review'],
    ['Predator 301 Cold Start Tips', 'Cold start tips for Predator 301.', 'tips'],
    ['Predator 301 Budget Go-Kart Build', 'Budget go-kart build for Predator 301.', 'tutorial'],
  ]},
  { slug: 'predator-420', topics: [
    ['Predator 420 Spark Plug and Ignition', 'Spark plug and ignition for Predator 420.', 'maintenance'],
    ['Predator 420 Fuel Line and Tank', 'Fuel line and tank for Predator 420.', 'installation'],
    ['Predator 420 1" Shaft Adapters and Hubs', '1" shaft adapters and hubs for Predator 420.', 'installation'],
    ['Predator 420 Recoil Starter Repair', 'Recoil starter repair for Predator 420.', 'troubleshooting'],
    ['Predator 420 Low Oil Shutdown', 'Low oil shutdown on Predator 420.', 'troubleshooting'],
    ['Predator 420 Chain Tension and Sprockets', 'Chain tension and sprockets for Predator 420.', 'maintenance'],
    ['Predator 420 Electric Start and Charging', 'Electric start and charging for Predator 420.', 'modification'],
    ['Predator 420 Dyno and Horsepower Test', 'Dyno and horsepower test for Predator 420.', 'review'],
    ['Predator 420 Cold Start Tips', 'Cold start tips for Predator 420.', 'tips'],
    ['Predator 420 Budget Buggy Build', 'Budget buggy build for Predator 420.', 'tutorial'],
  ]},
  { slug: 'predator-670', topics: [
    ['Predator 670 Spark Plug and Ignition', 'Spark plug and ignition for Predator 670.', 'maintenance'],
    ['Predator 670 Fuel Line and Dual Tank Setup', 'Fuel line and dual tank setup for Predator 670.', 'installation'],
    ['Predator 670 Dual Carb Sync and Tuning', 'Dual carb sync and tuning for Predator 670.', 'maintenance'],
    ['Predator 670 Electric Start and Battery', 'Electric start and battery for Predator 670.', 'troubleshooting'],
    ['Predator 670 One Cylinder Firing', 'One cylinder not firing on Predator 670.', 'troubleshooting'],
    ['Predator 670 Belt and Drive Setup', 'Belt and drive setup for Predator 670.', 'installation'],
    ['Predator 670 Performance Exhaust Build', 'Performance exhaust build for Predator 670.', 'modification'],
    ['Predator 670 Dyno and Horsepower Test', 'Dyno and horsepower test for Predator 670.', 'review'],
    ['Predator 670 Cold Start and Choke', 'Cold start and choke for Predator 670.', 'tips'],
    ['Predator 670 UTV and Buggy Build Guide', 'UTV and buggy build guide for Predator 670.', 'tutorial'],
  ]},
  { slug: 'honda-gx200', topics: [
    ['Honda GX200 Spark Plug and Ignition', 'Spark plug and ignition for Honda GX200.', 'maintenance'],
    ['Honda GX200 Fuel Line and Tank', 'Fuel line and tank for Honda GX200.', 'installation'],
    ['Honda GX200 Stage 2 and Cam', 'Stage 2 and cam for Honda GX200.', 'modification'],
    ['Honda GX200 Recoil Starter Repair', 'Recoil starter repair for Honda GX200.', 'troubleshooting'],
    ['Honda GX200 Low Oil Alert', 'Low oil alert on Honda GX200.', 'troubleshooting'],
    ['Honda GX200 Chain Tension and Sprockets', 'Chain tension and sprockets for Honda GX200.', 'maintenance'],
    ['Honda GX200 Electric Start Conversion', 'Electric start conversion for Honda GX200.', 'modification'],
    ['Honda GX200 Dyno and Reliability Test', 'Dyno and reliability test for Honda GX200.', 'review'],
    ['Honda GX200 Cold Start Tips', 'Cold start tips for Honda GX200.', 'tips'],
    ['Honda GX200 Budget Go-Kart Build', 'Budget go-kart build for Honda GX200.', 'tutorial'],
  ]},
  { slug: 'briggs-206', topics: [
    ['Briggs 206 Spark Plug and Ignition', 'Spark plug and ignition for Briggs 206.', 'maintenance'],
    ['Briggs 206 Fuel Line and Tank', 'Fuel line and tank for Briggs 206.', 'installation'],
    ['Briggs 206 Legal Air Filter Options', 'Legal air filter options for Briggs 206.', 'modification'],
    ['Briggs 206 Recoil Starter Repair', 'Recoil starter repair for Briggs 206.', 'troubleshooting'],
    ['Briggs 206 Low Oil Shutdown', 'Low oil shutdown on Briggs 206.', 'troubleshooting'],
    ['Briggs 206 Chain and Sprocket Setup for Racing', 'Chain and sprocket setup for Briggs 206 racing.', 'maintenance'],
    ['Briggs 206 Carburetor Rebuild – Stock', 'Carburetor rebuild stock for Briggs 206.', 'maintenance'],
    ['Briggs 206 Dyno and Power Test', 'Dyno and power test for Briggs 206.', 'review'],
    ['Briggs 206 Cold Start and Pre-Race', 'Cold start and pre-race for Briggs 206.', 'tips'],
    ['Briggs 206 Budget LO206 Kart Build', 'Budget LO206 kart build for Briggs 206.', 'tutorial'],
  ]},
];

function esc(s) { return (s || '').replace(/'/g, "''"); }
function row(t, d, c, slug, o) {
  return `('${esc(t)}', '${esc(d)}', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, '${c}', (SELECT id FROM engines WHERE slug = '${slug}'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, ${o}, true)`;
}

let sql = `-- ============================================================================
-- Add 10 more videos per engine (100 total). Does NOT delete existing videos.
-- Run after 20260116000019_seed_videos_25_per_engine.sql.
-- Replace PLACEHOLDER via Admin → Auto-fill URLs from YouTube or populate-from-youtube-api.ts
-- ============================================================================

`;

for (const e of EXTRA_TOPICS) {
  sql += `-- ${e.slug} (+10, display_order 25-34)\nINSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES\n`;
  sql += e.topics.map((t, i) => row(t[0], t[1], t[2], e.slug, 25 + i)).join(',\n') + ';\n\n';
}

const out = path.join(__dirname, '..', '..', 'supabase', 'migrations', '20260116000020_add_10_videos_per_engine.sql');
fs.writeFileSync(out, sql);
console.log('Wrote', out);
