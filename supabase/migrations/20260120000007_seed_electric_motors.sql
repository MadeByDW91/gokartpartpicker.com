-- ============================================================================
-- Seed Electric Motors (Phase 1 MVP)
-- Created: 2026-01-20
-- Description: Initial seed data for popular electric motors
-- Owner: A13 - EV Implementation Agent
-- ============================================================================

-- Note: These are example motors for testing. Replace with real data.

-- 24V Motors (Entry-level / Kids)
INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES ('amped-motors-24v-2kw', 'Amped Motors 24V 2kW', 'Amped Motors', 'AM-24-2K', 24, 2.00, 3.00, 2.7, 8.5, 4500, 3000, 0.85, 0.750, 1.5, 'straight', true, 'air', 15.0, 299.99, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('vgeby-24v-1kw', 'VGEBY 24V 1kW BLDC', 'VGEBY', 'VGB-24-1K', 24, 1.00, 1.5, 1.3, 4.2, 4000, 2800, 0.82, 0.625, 1.25, 'straight', true, 'air', 12.0, 199.99, true)
ON CONFLICT (slug) DO NOTHING;

-- 36V Motors (Mid-range)
INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('amped-motors-36v-3kw', 'Amped Motors 36V 3kW', 'Amped Motors', 'AM-36-3K', 36, 3.00, 4.5, 4.0, 12.0, 5000, 3500, 0.86, 0.750, 2.0, 'straight', true, 'air', 18.0, 399.99, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('mym1020-36v-4kw', 'MYM1020 36V 4kW BLDC', 'MYM', 'MYM-36-4K', 36, 4.00, 6.00, 5.4, 15.5, 5500, 4000, 0.87, 0.875, 2.0, 'straight', true, 'air', 22.0, 549.99, true)
ON CONFLICT (slug) DO NOTHING;

-- 48V Motors (Performance)
INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('amped-motors-48v-5kw', 'Amped Motors 48V 5kW', 'Amped Motors', 'AM-48-5K', 48, 5.00, 7.5, 6.7, 20.0, 6000, 4500, 0.88, 1.000, 2.5, 'straight', true, 'air', 28.0, 649.99, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('qsmotor-48v-8kw', 'QSMotor 48V 8kW', 'QSMotor', 'QS-48-8K', 48, 8.00, 12.0, 10.7, 32.0, 6500, 5000, 0.89, 1.125, 2.5, 'straight', true, 'air', 35.0, 899.99, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('mym1020-48v-6kw', 'MYM1020 48V 6kW BLDC', 'MYM', 'MYM-48-6K', 48, 6.00, 9.00, 8.0, 24.0, 6000, 4500, 0.88, 1.000, 2.5, 'straight', true, 'air', 30.0, 749.99, true)
ON CONFLICT (slug) DO NOTHING;

-- 72V Motors (High Performance)
INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('qsmotor-72v-12kw', 'QSMotor 72V 12kW', 'QSMotor', 'QS-72-12K', 72, 12.00, 18.0, 16.1, 48.0, 7000, 5500, 0.90, 1.125, 3.0, 'straight', true, 'air', 42.0, 1299.99, true)
ON CONFLICT (slug) DO NOTHING;

-- 96V Motors (Extreme Performance)
INSERT INTO electric_motors (slug, name, brand, model, voltage, power_kw, peak_power_kw, horsepower, torque_lbft, rpm_max, rpm_rated, efficiency, shaft_diameter, shaft_length, shaft_type, controller_required, cooling_type, weight_lbs, price, is_active) 
VALUES
('qsmotor-96v-15kw', 'QSMotor 96V 15kW', 'QSMotor', 'QS-96-15K', 96, 15.00, 22.5, 20.1, 60.0, 7500, 6000, 0.91, 1.250, 3.0, 'straight', true, 'air', 50.0, 1799.99, true)
ON CONFLICT (slug) DO NOTHING;
