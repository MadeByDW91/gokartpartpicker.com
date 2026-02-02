-- ============================================================================
-- Update Builds Table for EV Support
-- Created: 2026-01-20
-- Description: Add power_source_type and motor_id to builds table
-- Owner: A13 - EV Implementation Agent
-- ============================================================================

-- Create power source type enum
DO $$ BEGIN
    CREATE TYPE power_source_type AS ENUM ('gas', 'electric');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add power_source_type column
ALTER TABLE builds
ADD COLUMN IF NOT EXISTS power_source_type power_source_type DEFAULT 'gas';

-- Add motor_id column
ALTER TABLE builds
ADD COLUMN IF NOT EXISTS motor_id UUID REFERENCES electric_motors(id) ON DELETE SET NULL;

-- Add constraint: Must have either engine_id (gas) or motor_id (electric)
ALTER TABLE builds
DROP CONSTRAINT IF EXISTS builds_power_source_check;

ALTER TABLE builds
ADD CONSTRAINT builds_power_source_check 
CHECK (
  (power_source_type = 'gas' AND engine_id IS NOT NULL AND motor_id IS NULL) OR
  (power_source_type = 'electric' AND motor_id IS NOT NULL AND engine_id IS NULL)
);

-- Add index for motor_id
CREATE INDEX IF NOT EXISTS idx_builds_motor ON builds(motor_id);
CREATE INDEX IF NOT EXISTS idx_builds_power_source ON builds(power_source_type);

COMMENT ON COLUMN builds.power_source_type IS 'Type of power source: gas (engine) or electric (motor)';
COMMENT ON COLUMN builds.motor_id IS 'Selected electric motor (for electric builds)';
COMMENT ON CONSTRAINT builds_power_source_check ON builds IS 'Ensures builds have either engine_id (gas) or motor_id (electric), but not both';
