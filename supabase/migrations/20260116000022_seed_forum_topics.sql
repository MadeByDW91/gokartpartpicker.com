-- ============================================================================
-- GoKart Part Picker - Seed Forum Topics
-- Created: 2026-01-16
-- Description: Seed initial forum topics for each category
-- ============================================================================

-- Helper function to create a topic slug from title
CREATE OR REPLACE FUNCTION slugify(text)
RETURNS text AS $$
  SELECT lower(regexp_replace(regexp_replace(regexp_replace($1, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'), '-+', '-', 'g'));
$$ LANGUAGE sql IMMUTABLE;

-- Get a system user ID (or create one if needed)
-- We'll use the first admin user, or create a system user
DO $$
DECLARE
  system_user_id UUID;
  category_id_val UUID;
  topic_id_val UUID;
  engine_record RECORD;
BEGIN
  -- Get or create a system user for seeding
  SELECT id INTO system_user_id
  FROM profiles
  WHERE role IN ('admin', 'super_admin')
  LIMIT 1;

  -- If no admin exists, we'll need to handle this differently
  -- For now, we'll skip topics if no user exists
  IF system_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Please create an admin user first.';
    RETURN;
  END IF;

  -- ============================================================================
  -- BUILD PLANNING - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'build-planning';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'First Build - Need Advice', 'first-build-need-advice', 'I''m planning my first go-kart build and could use some guidance on engine selection and basic parts. What should I consider?'),
      (category_id_val, system_user_id, 'Budget Build Under $500', 'budget-build-under-500', 'Looking to build a budget-friendly go-kart for under $500. Any recommendations on where to save money without sacrificing too much performance?'),
      (category_id_val, system_user_id, 'Racing Build Planning', 'racing-build-planning', 'Planning a competitive racing build. Need advice on engine modifications, safety equipment, and performance parts.'),
      (category_id_val, system_user_id, 'Kids Go-Kart Build', 'kids-go-kart-build', 'Building a safe go-kart for my kids. What engine size and safety features should I prioritize?'),
      (category_id_val, system_user_id, 'Build Checklist and Timeline', 'build-checklist-and-timeline', 'Creating a comprehensive checklist for my build. What order should I assemble parts in?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- BUILD SHOWCASE - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'build-showcase';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'My First Build - Predator 212', 'my-first-build-predator-212', 'Just finished my first build using a Predator 212 engine. Here''s what I learned and some photos!'),
      (category_id_val, system_user_id, 'Speed Build - 50+ MPH', 'speed-build-50-mph', 'Built a high-performance kart that hits 50+ MPH. Sharing my mods and setup.'),
      (category_id_val, system_user_id, 'Off-Road Go-Kart Build', 'off-road-go-kart-build', 'Built a go-kart specifically for off-road trails. Custom suspension and larger tires made all the difference.'),
      (category_id_val, system_user_id, 'Restoration Project Complete', 'restoration-project-complete', 'Finished restoring a vintage go-kart frame with modern components. Before and after photos included.'),
      (category_id_val, system_user_id, 'Electric Conversion Build', 'electric-conversion-build', 'Converted my gas-powered kart to electric. Here''s my experience and what I''d do differently.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- TROUBLESHOOTING - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'troubleshooting';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Engine Won''t Start', 'engine-wont-start', 'My engine cranks but won''t start. Checked spark plug and fuel. What else should I check?'),
      (category_id_val, system_user_id, 'Chain Keeps Coming Off', 'chain-keeps-coming-off', 'Having issues with my chain constantly coming off the sprockets. Alignment looks good. Any suggestions?'),
      (category_id_val, system_user_id, 'Brakes Not Working Properly', 'brakes-not-working-properly', 'My brakes feel spongy and don''t stop well. Already bled the system. What could be wrong?'),
      (category_id_val, system_user_id, 'Engine Overheating', 'engine-overheating', 'Engine runs hot after just a few minutes. Oil level is good. Could this be a cooling issue?'),
      (category_id_val, system_user_id, 'Loss of Power Under Load', 'loss-of-power-under-load', 'Engine runs fine at idle but loses power when I accelerate. Carburetor issue?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- PARTS & COMPONENTS - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'parts';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Best Clutch for Predator 212', 'best-clutch-for-predator-212', 'Looking for clutch recommendations for my Predator 212 build. What engagement RPM should I look for?'),
      (category_id_val, system_user_id, 'Torque Converter vs Clutch', 'torque-converter-vs-clutch', 'Trying to decide between a torque converter and centrifugal clutch. What are the pros and cons of each?'),
      (category_id_val, system_user_id, 'Chain and Sprocket Sizing', 'chain-and-sprocket-sizing', 'Need help understanding chain sizes (#35, #40, #41) and how to choose the right sprocket ratio.'),
      (category_id_val, system_user_id, 'Brake System Options', 'brake-system-options', 'What brake systems work best for go-karts? Disc vs drum, hydraulic vs mechanical?'),
      (category_id_val, system_user_id, 'Wheel and Tire Selection', 'wheel-and-tire-selection', 'Choosing wheels and tires for my build. What size and type should I use for street vs off-road?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- PERFORMANCE MODS - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'performance-mods';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Stage 1 Mods - What to Do First', 'stage-1-mods-what-to-do-first', 'Starting with performance mods. What are the best first steps? Governor removal, air filter, exhaust?'),
      (category_id_val, system_user_id, 'Camshaft Upgrade Results', 'camshaft-upgrade-results', 'Just installed a performance camshaft. Here''s my before/after dyno results and what I learned.'),
      (category_id_val, system_user_id, 'Carburetor Tuning Tips', 'carburetor-tuning-tips', 'Having trouble tuning my carburetor after mods. Any tips on jet sizing and air/fuel mixture?'),
      (category_id_val, system_user_id, 'Header and Exhaust Upgrades', 'header-and-exhaust-upgrades', 'What exhaust systems provide the best performance gains? Looking at header options.'),
      (category_id_val, system_user_id, 'Advanced Engine Modifications', 'advanced-engine-modifications', 'Planning advanced mods: porting, polishing, big bore kits. What''s the best bang for your buck?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- MAINTENANCE - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'maintenance';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Oil Change Schedule', 'oil-change-schedule', 'How often should I change the oil in my go-kart engine? What oil weight is best?'),
      (category_id_val, system_user_id, 'Winter Storage Tips', 'winter-storage-tips', 'Storing my go-kart for the winter. What maintenance should I do before storing it?'),
      (category_id_val, system_user_id, 'Chain Maintenance', 'chain-maintenance', 'How do I properly maintain my chain? Cleaning, lubrication, and tension tips.'),
      (category_id_val, system_user_id, 'Engine Break-In Procedure', 'engine-break-in-procedure', 'Just got a new engine. What''s the proper break-in procedure? How many hours before I can push it?'),
      (category_id_val, system_user_id, 'Pre-Season Inspection Checklist', 'pre-season-inspection-checklist', 'Getting ready for the season. What should I check before taking my kart out?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- GENERAL DISCUSSION - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'general-discussion';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Welcome New Members!', 'welcome-new-members', 'Welcome to the GoKart Part Picker community! Introduce yourself and share what you''re working on.'),
      (category_id_val, system_user_id, 'Local Go-Kart Tracks', 'local-go-kart-tracks', 'Share information about go-kart tracks and racing venues in your area.'),
      (category_id_val, system_user_id, 'Go-Kart Safety Discussion', 'go-kart-safety-discussion', 'Let''s talk about safety equipment and practices. What safety gear do you use?'),
      (category_id_val, system_user_id, 'Best Go-Kart Builds You''ve Seen', 'best-go-kart-builds-youve-seen', 'Share photos and stories of impressive go-kart builds you''ve seen or been inspired by.'),
      (category_id_val, system_user_id, 'Go-Kart Racing Stories', 'go-kart-racing-stories', 'Share your racing experiences, close calls, and memorable moments on the track.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- DEALS & SALES - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'deals-sales';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Harbor Freight Predator Sale', 'harbor-freight-predator-sale', 'Harbor Freight has Predator engines on sale this week. Great deal for anyone starting a build!'),
      (category_id_val, system_user_id, 'Amazon Prime Day Go-Kart Parts', 'amazon-prime-day-go-kart-parts', 'Prime Day deals on go-kart parts. Share what you find!'),
      (category_id_val, system_user_id, 'Black Friday Parts Deals', 'black-friday-parts-deals', 'Post Black Friday and Cyber Monday deals for go-kart parts and accessories.'),
      (category_id_val, system_user_id, 'Local Store Sales and Clearance', 'local-store-sales-and-clearance', 'Share deals from local stores, auto parts shops, and hardware stores.'),
      (category_id_val, system_user_id, 'Used Parts Marketplace', 'used-parts-marketplace', 'Looking for or selling used go-kart parts? Post here!')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- FOR SALE/TRADE - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'for-sale-trade';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Trading Parts - What Do You Have?', 'trading-parts-what-do-you-have', 'Have extra parts? Looking to trade? Post what you have and what you need.'),
      (category_id_val, system_user_id, 'Complete Go-Kart For Sale', 'complete-go-kart-for-sale', 'Selling my completed go-kart build. Includes engine, all parts, and extras.'),
      (category_id_val, system_user_id, 'Engine For Sale - Predator 212', 'engine-for-sale-predator-212', 'Selling a lightly used Predator 212 engine. Only 10 hours on it.'),
      (category_id_val, system_user_id, 'Parts Lot For Sale', 'parts-lot-for-sale', 'Selling a collection of go-kart parts: clutches, chains, sprockets, wheels, and more.'),
      (category_id_val, system_user_id, 'Wanted: Specific Parts', 'wanted-specific-parts', 'Looking for specific parts for my build. Post what you''re looking for here.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- SITE FEEDBACK - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'site-feedback';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Feature Requests', 'feature-requests', 'What features would you like to see added to GoKart Part Picker? Share your ideas!'),
      (category_id_val, system_user_id, 'Bug Reports', 'bug-reports', 'Found a bug or issue with the site? Report it here so we can fix it.'),
      (category_id_val, system_user_id, 'UI/UX Feedback', 'ui-ux-feedback', 'How can we improve the user experience? Share your thoughts on the interface and design.'),
      (category_id_val, system_user_id, 'Mobile App Suggestions', 'mobile-app-suggestions', 'Would you use a mobile app? What features would be most useful?'),
      (category_id_val, system_user_id, 'Community Guidelines Discussion', 'community-guidelines-discussion', 'Let''s discuss community guidelines and how to keep the forums helpful and friendly.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- ENGINES - One Topic Per Engine
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'engines';
  IF category_id_val IS NOT NULL THEN
    -- Create a topic for each active engine
    FOR engine_record IN 
      SELECT id, name, slug, brand, displacement_cc, horsepower
      FROM engines
      WHERE is_active = TRUE
      ORDER BY brand, name
    LOOP
      INSERT INTO forum_topics (category_id, user_id, title, slug, content)
      VALUES (
        category_id_val,
        system_user_id,
        engine_record.name || ' Discussion',
        slugify(engine_record.name || '-discussion'),
        'Discussion thread for the ' || engine_record.name || ' (' || engine_record.brand || ' ' || engine_record.displacement_cc || 'cc, ' || engine_record.horsepower || ' HP). Share your experiences, modifications, and questions about this engine.'
      )
      ON CONFLICT (category_id, slug) DO NOTHING;
    END LOOP;
  END IF;

  RAISE NOTICE 'Forum topics seeded successfully!';
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS slugify(text);
