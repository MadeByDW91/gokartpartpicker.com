-- ============================================================================
-- Add Electric Motors Table
-- Created: 2026-01-20
-- Description: Create electric_motors table for EV go-kart builds
-- Owner: A13 - EV Implementation Agent
-- ============================================================================

-- ============================================================================
-- ELECTRIC_MOTORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS electric_motors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT,
  variant TEXT,
  
  -- EV-Specific Specs (Imperial Units)
  voltage INTEGER NOT NULL, -- 12, 24, 36, 48, 72, 96 (volts)
  power_kw DECIMAL(5,2) NOT NULL, -- Continuous power in kW
  peak_power_kw DECIMAL(5,2), -- Peak/burst power in kW
  horsepower DECIMAL(4,1) NOT NULL, -- Calculated/converted for display (1 kW ≈ 1.34 HP)
  torque_lbft DECIMAL(6,2) NOT NULL, -- Torque in lb-ft (imperial)
  rpm_max INTEGER, -- Maximum RPM
  rpm_rated INTEGER, -- Rated/continuous RPM
  efficiency DECIMAL(3,2), -- 0.85 = 85% efficiency
  
  -- Physical Specs (if chain drive - NO hub motors in Phase 1)
  shaft_diameter DECIMAL(5,3), -- inches (for chain drive motors)
  shaft_length DECIMAL(5,3), -- inches
  shaft_type shaft_type DEFAULT 'straight', -- straight, tapered, threaded (NO 'direct_drive' in Phase 1)
  mount_type TEXT,
  
  -- System Requirements
  controller_required BOOLEAN DEFAULT TRUE,
  cooling_type TEXT, -- 'air', 'liquid', 'passive'
  
  -- Common Fields
  weight_lbs DECIMAL(5,1),
  price DECIMAL(10,2),
  image_url TEXT,
  affiliate_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id),
  
  -- Constraints
  CONSTRAINT electric_motors_voltage_check CHECK (voltage > 0),
  CONSTRAINT electric_motors_power_kw_check CHECK (power_kw > 0),
  CONSTRAINT electric_motors_horsepower_check CHECK (horsepower > 0),
  CONSTRAINT electric_motors_torque_check CHECK (torque_lbft > 0),
  CONSTRAINT electric_motors_efficiency_check CHECK (efficiency IS NULL OR (efficiency >= 0 AND efficiency <= 1))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_electric_motors_voltage ON electric_motors(voltage);
CREATE INDEX IF NOT EXISTS idx_electric_motors_brand ON electric_motors(brand);
CREATE INDEX IF NOT EXISTS idx_electric_motors_active ON electric_motors(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_electric_motors_slug ON electric_motors(slug);

COMMENT ON TABLE electric_motors IS 'Catalog of electric motors for go-karts. Admin-managed reference data.';
COMMENT ON COLUMN electric_motors.slug IS 'URL-friendly unique identifier (e.g., amped-motors-48v-5kw)';
COMMENT ON COLUMN electric_motors.voltage IS 'Motor voltage in volts (12, 24, 36, 48, 72, 96)';
COMMENT ON COLUMN electric_motors.power_kw IS 'Continuous power rating in kilowatts';
COMMENT ON COLUMN electric_motors.peak_power_kw IS 'Peak/burst power in kilowatts (for short durations)';
COMMENT ON COLUMN electric_motors.horsepower IS 'Horsepower equivalent (calculated from power_kw)';
COMMENT ON COLUMN electric_motors.torque_lbft IS 'Torque in pound-feet (imperial units)';
COMMENT ON COLUMN electric_motors.efficiency IS 'Motor efficiency (0.0 to 1.0, e.g., 0.85 = 85%)';
COMMENT ON COLUMN electric_motors.shaft_type IS 'Shaft type for chain drive motors (NO direct_drive in Phase 1)';
