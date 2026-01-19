-- ============================================================================
-- GoKart Part Picker - Video Seed Data
-- Created: 2026-01-16
-- Description: Initial video catalog for top engines
-- Owner: Agent A9 (Video Content)
-- 
-- Note: This is a starting point with example video URLs.
-- Replace with actual YouTube/Vimeo URLs when collecting real videos.
-- ============================================================================

-- ============================================================================
-- HELPER: Get engine ID from slug (for use in video inserts)
-- ============================================================================

-- This query gets engine IDs for reference:
-- SELECT id, slug, name FROM engines ORDER BY brand, displacement_cc;

-- ============================================================================
-- PREDATOR 212 HEMI VIDEOS (Most Popular Engine) - Step 1
-- 3 videos use verified YouTube IDs; 3 use PLACEHOLDER1 — replace via admin.
-- ============================================================================

-- 1. REVIEW (verified) — Predator 212 Ghost disassembly & review — linked to predator-ghost
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'New Predator 212 Ghost Engine Disassembly, Identification and Review',
  'Disassembly and identification of the Predator 212 Ghost engine. Covers key differences from the standard 212 and what to look for.',
  'https://www.youtube.com/watch?v=a2K26VuxDCU',
  'https://img.youtube.com/vi/a2K26VuxDCU/maxresdefault.jpg',
  900,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-ghost'),
  'YouTube Creator',
  'https://www.youtube.com',
  '2022-01-01',
  true,
  0,
  true
);

-- 2. MODIFICATION (verified) — Budget high‑performance build
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Budget High Performance Build | DIY Go Karts',
  'Step-by-step Predator 212 performance build on a budget. Covers intake, exhaust, jetting, and power gains.',
  'https://www.youtube.com/watch?v=kLAkwti_0zc',
  'https://img.youtube.com/vi/kLAkwti_0zc/maxresdefault.jpg',
  1200,
  'modification',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'DIY Go Karts',
  'https://www.youtube.com',
  '2020-01-01',
  true,
  1,
  true
);

-- 3. MAINTENANCE (verified) — Oil / engine orientation
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Oil and Engine Orientation Tips',
  'Oil-related issues and engine orientation for the Predator 212. Important for vertical or unusual mounting in karts and minibikes.',
  'https://www.youtube.com/watch?v=RTHDeAMrjO4',
  'https://img.youtube.com/vi/RTHDeAMrjO4/maxresdefault.jpg',
  600,
  'maintenance',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'YouTube Creator',
  'https://www.youtube.com',
  '2019-01-01',
  false,
  0,
  true
);

-- 4. INSTALLATION (replace PLACEHOLDER1) — Search: "Predator 212 go kart install" or "torque converter Predator 212"
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'How to Install Predator 212 Hemi in Go-Kart',
  'Step-by-step guide on mounting and installing the Predator 212 Hemi in your go-kart. Covers mounting, fuel line, and throttle.',
  'https://www.youtube.com/watch?v=PLACEHOLDER1',
  NULL,
  1200,
  'installation',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'GoKart Builds',
  'https://www.youtube.com',
  '2024-02-01',
  false,
  0,
  true
);

-- 5. TUTORIAL (replace PLACEHOLDER1) — Search: "Predator 212 break in" or "Predator 212 first start"
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Break-In Procedure Explained',
  'Proper break-in for new Predator 212 engines. Extends engine life and improves performance.',
  'https://www.youtube.com/watch?v=PLACEHOLDER1',
  NULL,
  540,
  'tutorial',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'Engine Care Guide',
  'https://www.youtube.com',
  '2024-01-10',
  false,
  0,
  true
);

-- 6. TROUBLESHOOTING (replace PLACEHOLDER1) — Search: "Predator 212 won''t start" or "Predator 212 carburetor adjustment"
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Won''t Start - Common Issues and Fixes',
  'Troubleshooting Predator 212 no-start. Covers fuel, spark, compression, and carburetor adjustment.',
  'https://www.youtube.com/watch?v=PLACEHOLDER1',
  NULL,
  720,
  'troubleshooting',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'Small Engine Repair',
  'https://www.youtube.com',
  '2024-03-01',
  false,
  0,
  true
);

-- ============================================================================
-- PREDATOR 224 VIDEOS
-- ============================================================================

-- Featured: Review and Comparison
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 224 Review vs 212 - Is it Worth It?',
  'Detailed comparison between the Predator 224 and 212 engines. Shows the differences and when to choose each.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_224_REVIEW',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_224_REVIEW/maxresdefault.jpg',
  900,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-224'),
  'GoKart Builds',
  'https://www.youtube.com/@gokartbuilds',
  '2024-02-01',
  true,
  0,
  true
);

-- Installation: Shaft Differences
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Installing Predator 224 - Understanding 7/8" Shaft',
  'Installation guide focusing on the 7/8" shaft of the Predator 224 and compatible clutches.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_224_INSTALL',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_224_INSTALL/maxresdefault.jpg',
  960,
  'installation',
  (SELECT id FROM engines WHERE slug = 'predator-224'),
  'GoKart Builds',
  'https://www.youtube.com/@gokartbuilds',
  '2024-02-10',
  false,
  0,
  true
);

-- ============================================================================
-- PREDATOR 420 VIDEOS
-- ============================================================================

-- Featured: Power Review
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 420 Review - Power and Performance',
  'Full review of the Predator 420 engine. Shows power output, torque, and real-world performance in go-kart applications.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_420_REVIEW',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_420_REVIEW/maxresdefault.jpg',
  1080,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-420'),
  'Performance Karting',
  'https://www.youtube.com/@performancekarting',
  '2024-02-15',
  true,
  0,
  true
);

-- Installation: Larger Frame Setup
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Installing Predator 420 in Large Go-Kart Frame',
  'Step-by-step installation of the larger Predator 420 engine. Covers frame modifications and mounting considerations.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_420_INSTALL',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_420_INSTALL/maxresdefault.jpg',
  1320,
  'installation',
  (SELECT id FROM engines WHERE slug = 'predator-420'),
  'GoKart Builds',
  'https://www.youtube.com/@gokartbuilds',
  '2024-03-01',
  false,
  0,
  true
);

-- ============================================================================
-- HONDA GX200 VIDEOS
-- ============================================================================

-- Featured: Why Choose Honda?
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Honda GX200 vs Clone Engines - Reliability Comparison',
  'Comparison of Honda GX200 with Predator and clone engines. Explains when Honda is worth the premium price.',
  'https://www.youtube.com/watch?v=EXAMPLE_HONDA_GX200_COMPARISON',
  'https://img.youtube.com/vi/EXAMPLE_HONDA_GX200_COMPARISON/maxresdefault.jpg',
  840,
  'review',
  (SELECT id FROM engines WHERE slug = 'honda-gx200'),
  'Engine Experts',
  'https://www.youtube.com/@engineexperts',
  '2024-01-20',
  true,
  0,
  true
);

-- Maintenance: Long-term Care
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Honda GX200 Maintenance Schedule',
  'Proper maintenance schedule to keep your Honda GX200 running for years. Oil changes, air filter, valve adjustments.',
  'https://www.youtube.com/watch?v=EXAMPLE_HONDA_GX200_MAINTENANCE',
  'https://img.youtube.com/vi/EXAMPLE_HONDA_GX200_MAINTENANCE/maxresdefault.jpg',
  720,
  'maintenance',
  (SELECT id FROM engines WHERE slug = 'honda-gx200'),
  'Honda Small Engines',
  'https://www.youtube.com/@hondasmallengines',
  '2024-02-01',
  false,
  0,
  true
);

-- ============================================================================
-- PREDATOR GHOST 212 VIDEOS
-- ============================================================================

-- Featured: Racing Engine Review
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator Ghost 212 - Racing Engine Review',
  'Review of the Predator Ghost 212 performance engine. Shows stock power and racing capabilities.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_GHOST_REVIEW',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_GHOST_REVIEW/maxresdefault.jpg',
  780,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-ghost'),
  'Racing Performance',
  'https://www.youtube.com/@racingperformance',
  '2024-02-20',
  true,
  0,
  true
);

-- ============================================================================
-- NOTE TO ADMINS
-- ============================================================================

-- IMPORTANT: The video URLs above are placeholders (EXAMPLE_...).
-- You need to replace them with actual YouTube or Vimeo URLs.
-- 
-- To find videos:
-- 1. Search YouTube for: "{Engine Name} unboxing", "{Engine Name} installation", etc.
-- 2. Look for popular channels: GoKart Builds, Small Engine Repair, Racing Performance
-- 3. Copy the YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
-- 4. The thumbnail URL will auto-generate as: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
--
-- To add more videos:
-- 1. Use the admin panel at /admin/videos/new
-- 2. Or use the bulk import feature with CSV
-- 3. Or create additional INSERT statements following the pattern above
--
-- Target: 20+ videos per top engine (212 Hemi, 224, 420, GX200, Ghost)
-- Categories to cover: unboxing, installation, maintenance, modification, 
--                      troubleshooting, tutorial, review, tips
