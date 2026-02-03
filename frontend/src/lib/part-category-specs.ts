/**
 * Category-specific specification fields for parts.
 * When an admin selects a category, the part form shows only these fields.
 * Keys are stored in part.specifications (snake_case).
 */

import type { PartCategory } from '@/types/database';

export type SpecFieldType = 'text' | 'number' | 'boolean';

export interface PartSpecField {
  key: string;
  label: string;
  type: SpecFieldType;
  unit?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

/** Spec fields by part category. Order defines form order. */
export const PART_CATEGORY_SPEC_FIELDS: Record<PartCategory, PartSpecField[]> = {
  pedals: [
    { key: 'pedal_length_in', label: 'Pedal length', type: 'number', unit: 'in', placeholder: 'e.g. 6' },
    { key: 'foot_pad_length_in', label: 'Foot pad length', type: 'number', unit: 'in', placeholder: 'e.g. 4' },
    { key: 'throttle_cable_included', label: 'Throttle cable included', type: 'boolean' },
    { key: 'throttle_cable_length_in', label: 'Throttle cable length', type: 'number', unit: 'in', placeholder: 'e.g. 36' },
  ],
  clutch: [
    { key: 'bore_diameter', label: 'Shaft bore diameter', type: 'number', unit: 'in', placeholder: 'e.g. 0.75', required: true },
    { key: 'driver_type', label: 'Driver type', type: 'text', placeholder: 'e.g. 1-piece, 2-piece' },
    { key: 'tooth_count', label: 'Tooth count', type: 'number', placeholder: 'e.g. 12' },
    { key: 'max_rpm', label: 'Max RPM', type: 'number', placeholder: 'e.g. 4000' },
  ],
  torque_converter: [
    { key: 'bore_diameter', label: 'Shaft bore diameter', type: 'number', unit: 'in', placeholder: 'e.g. 0.75', required: true },
    { key: 'series', label: 'Series', type: 'text', placeholder: 'e.g. 30 series' },
    { key: 'driver_type', label: 'Driver type', type: 'text', placeholder: 'e.g. 6 tooth' },
    { key: 'max_rpm', label: 'Max RPM', type: 'number', placeholder: 'e.g. 4000' },
  ],
  chain: [
    { key: 'pitch', label: 'Pitch (#)', type: 'text', placeholder: 'e.g. 35, 40, 41' },
    { key: 'length_in', label: 'Length', type: 'number', unit: 'in', placeholder: 'e.g. 36' },
    { key: 'link_count', label: 'Link count', type: 'number', placeholder: 'e.g. 120' },
    { key: 'width_in', label: 'Width', type: 'number', unit: 'in', placeholder: 'e.g. 0.25' },
  ],
  sprocket: [
    { key: 'tooth_count', label: 'Tooth count', type: 'number', required: true, placeholder: 'e.g. 54' },
    { key: 'bore_diameter', label: 'Bore diameter', type: 'number', unit: 'in', placeholder: 'e.g. 1' },
    { key: 'pitch', label: 'Chain pitch (#)', type: 'text', placeholder: 'e.g. 35, 40' },
  ],
  axle: [
    { key: 'length_in', label: 'Length', type: 'number', unit: 'in', required: true, placeholder: 'e.g. 36' },
    { key: 'diameter_in', label: 'Diameter', type: 'number', unit: 'in', placeholder: 'e.g. 1' },
    { key: 'keyway', label: 'Keyway', type: 'text', placeholder: 'e.g. 1/4 in' },
    { key: 'thread_type', label: 'Thread type', type: 'text', placeholder: 'e.g. 5/8-18' },
  ],
  wheel: [
    { key: 'diameter_in', label: 'Diameter', type: 'number', unit: 'in', placeholder: 'e.g. 6' },
    { key: 'width_in', label: 'Width', type: 'number', unit: 'in', placeholder: 'e.g. 4' },
    { key: 'bolt_pattern', label: 'Bolt pattern', type: 'text', placeholder: 'e.g. 4x4, 4x4.5' },
    { key: 'hub_bore_in', label: 'Hub bore', type: 'number', unit: 'in', placeholder: 'e.g. 0.75' },
  ],
  tire: [
    { key: 'diameter_in', label: 'Diameter', type: 'number', unit: 'in', placeholder: 'e.g. 11' },
    { key: 'width_in', label: 'Width', type: 'number', unit: 'in', placeholder: 'e.g. 6' },
    { key: 'tread_type', label: 'Tread type', type: 'text', placeholder: 'e.g. slick, knobby' },
  ],
  tire_front: [
    { key: 'diameter_in', label: 'Diameter', type: 'number', unit: 'in', placeholder: 'e.g. 11' },
    { key: 'width_in', label: 'Width', type: 'number', unit: 'in', placeholder: 'e.g. 4' },
    { key: 'tread_type', label: 'Tread type', type: 'text', placeholder: 'e.g. slick' },
  ],
  tire_rear: [
    { key: 'diameter_in', label: 'Diameter', type: 'number', unit: 'in', placeholder: 'e.g. 11' },
    { key: 'width_in', label: 'Width', type: 'number', unit: 'in', placeholder: 'e.g. 6' },
    { key: 'tread_type', label: 'Tread type', type: 'text', placeholder: 'e.g. slick, knobby' },
    { key: 'compound', label: 'Compound', type: 'text', placeholder: 'e.g. soft, medium' },
  ],
  brake: [
    { key: 'rotor_diameter_in', label: 'Rotor diameter', type: 'number', unit: 'in', placeholder: 'e.g. 6' },
    { key: 'pad_type', label: 'Pad type', type: 'text', placeholder: 'e.g. sintered, organic' },
    { key: 'cable_or_hydraulic', label: 'Cable or hydraulic', type: 'text', placeholder: 'cable / hydraulic' },
    { key: 'mounting_type', label: 'Mounting type', type: 'text', placeholder: 'e.g. caliper, drum' },
  ],
  throttle: [
    { key: 'cable_length_in', label: 'Cable length', type: 'number', unit: 'in', placeholder: 'e.g. 48' },
    { key: 'cable_included', label: 'Cable included', type: 'boolean' },
    { key: 'throttle_type', label: 'Throttle type', type: 'text', placeholder: 'e.g. thumb, pedal, twist' },
  ],
  frame: [
    { key: 'wheelbase_in', label: 'Wheelbase', type: 'number', unit: 'in', placeholder: 'e.g. 42' },
    { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g. steel, aluminum' },
    { key: 'weight_lbs', label: 'Weight', type: 'number', unit: 'lbs', placeholder: 'e.g. 45' },
    { key: 'max_rider_weight_lbs', label: 'Max rider weight', type: 'number', unit: 'lbs', placeholder: 'e.g. 250' },
  ],
  carburetor: [
    { key: 'venturi_size_mm', label: 'Venturi size', type: 'number', unit: 'mm', placeholder: 'e.g. 22' },
    { key: 'jet_size_main', label: 'Main jet', type: 'text', placeholder: 'e.g. 0.038' },
    { key: 'jet_size_pilot', label: 'Pilot jet', type: 'text', placeholder: 'e.g. 0.035' },
    { key: 'throttle_bore_mm', label: 'Throttle bore', type: 'number', unit: 'mm', placeholder: 'e.g. 22' },
  ],
  exhaust: [
    { key: 'outlet_diameter_in', label: 'Outlet diameter', type: 'number', unit: 'in', placeholder: 'e.g. 1' },
    { key: 'length_in', label: 'Length', type: 'number', unit: 'in', placeholder: 'e.g. 18' },
    { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g. steel, ceramic' },
  ],
  air_filter: [
    { key: 'outer_diameter_in', label: 'Outer diameter', type: 'number', unit: 'in', placeholder: 'e.g. 2.5' },
    { key: 'height_in', label: 'Height', type: 'number', unit: 'in', placeholder: 'e.g. 2' },
    { key: 'inner_diameter_in', label: 'Inner diameter (carb fit)', type: 'number', unit: 'in', placeholder: 'e.g. 1.5' },
  ],
  camshaft: [
    { key: 'lift_in', label: 'Lift', type: 'number', unit: 'in', placeholder: 'e.g. 0.250' },
    { key: 'duration_deg', label: 'Duration', type: 'number', unit: '°', placeholder: 'e.g. 240' },
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
  ],
  valve_spring: [
    { key: 'seat_pressure_lbs', label: 'Seat pressure', type: 'number', unit: 'lbs', placeholder: 'e.g. 18' },
    { key: 'open_pressure_lbs', label: 'Open pressure', type: 'number', unit: 'lbs', placeholder: 'e.g. 45' },
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
  ],
  flywheel: [
    { key: 'bore_diameter', label: 'Crank bore diameter', type: 'number', unit: 'in', required: true, placeholder: 'e.g. 0.75' },
    { key: 'weight_lbs', label: 'Weight', type: 'number', unit: 'lbs', placeholder: 'e.g. 5.5' },
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
  ],
  ignition: [
    { key: 'spark_plug_type', label: 'Spark plug type', type: 'text', placeholder: 'e.g. NGK BP6ES' },
    { key: 'gap_in', label: 'Gap', type: 'number', unit: 'in', placeholder: 'e.g. 0.028' },
    { key: 'voltage', label: 'Voltage', type: 'text', placeholder: 'e.g. 12V' },
  ],
  connecting_rod: [
    { key: 'length_in', label: 'Center-to-center length', type: 'number', unit: 'in', placeholder: 'e.g. 3.5' },
    { key: 'journal_diameter_in', label: 'Journal diameter', type: 'number', unit: 'in', placeholder: 'e.g. 1.18' },
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
  ],
  piston: [
    { key: 'diameter_in', label: 'Diameter', type: 'number', unit: 'in', placeholder: 'e.g. 2.56' },
    { key: 'compression_height_in', label: 'Compression height', type: 'number', unit: 'in', placeholder: 'e.g. 1.2' },
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
  ],
  crankshaft: [
    { key: 'stroke_in', label: 'Stroke', type: 'number', unit: 'in', placeholder: 'e.g. 2.165' },
    { key: 'journal_diameter_in', label: 'Journal diameter', type: 'number', unit: 'in', placeholder: 'e.g. 1.18' },
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
  ],
  oil_system: [
    { key: 'capacity_oz', label: 'Capacity', type: 'number', unit: 'oz', placeholder: 'e.g. 18' },
    { key: 'pump_type', label: 'Pump type', type: 'text', placeholder: 'e.g. gear, diaphragm' },
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
  ],
  header: [
    { key: 'outlet_diameter_in', label: 'Outlet diameter', type: 'number', unit: 'in', placeholder: 'e.g. 1' },
    { key: 'length_in', label: 'Length', type: 'number', unit: 'in', placeholder: 'e.g. 14' },
    { key: 'flange_type', label: 'Flange type', type: 'text', placeholder: 'e.g. round, square' },
  ],
  fuel_system: [
    { key: 'tank_capacity_gal', label: 'Tank capacity', type: 'number', unit: 'gal', placeholder: 'e.g. 1.5' },
    { key: 'line_size_in', label: 'Line size', type: 'number', unit: 'in', placeholder: 'e.g. 0.25' },
    { key: 'pump_type', label: 'Pump type', type: 'text', placeholder: 'e.g. pulse, electric' },
  ],
  gasket: [
    { key: 'engine_compatibility', label: 'Engine compatibility', type: 'text', placeholder: 'e.g. Predator 212' },
    { key: 'gasket_type', label: 'Gasket type', type: 'text', placeholder: 'e.g. head, exhaust' },
  ],
  hardware: [
    { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g. M8x1.25, 5/16-24' },
    { key: 'length_in', label: 'Length', type: 'number', unit: 'in', placeholder: 'e.g. 1' },
    { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g. grade 8, stainless' },
  ],
  other: [
    { key: 'spec_1', label: 'Spec 1', type: 'text', placeholder: 'Label / value' },
    { key: 'spec_2', label: 'Spec 2', type: 'text', placeholder: 'Label / value' },
    { key: 'spec_3', label: 'Spec 3', type: 'text', placeholder: 'Label / value' },
  ],
  battery: [
    { key: 'voltage_v', label: 'Voltage', type: 'number', unit: 'V', required: true, placeholder: 'e.g. 48' },
    { key: 'capacity_ah', label: 'Capacity', type: 'number', unit: 'Ah', placeholder: 'e.g. 20' },
    { key: 'weight_lbs', label: 'Weight', type: 'number', unit: 'lbs', placeholder: 'e.g. 25' },
    { key: 'chemistry', label: 'Chemistry', type: 'text', placeholder: 'e.g. LiFePO4, Li-ion' },
  ],
  motor_controller: [
    { key: 'voltage_v', label: 'Rated voltage', type: 'number', unit: 'V', placeholder: 'e.g. 48' },
    { key: 'current_a', label: 'Max current', type: 'number', unit: 'A', placeholder: 'e.g. 100' },
    { key: 'compatible_motors', label: 'Compatible motors', type: 'text', placeholder: 'e.g. 1000W–3000W brushless' },
  ],
  bms: [
    { key: 'voltage_v', label: 'Pack voltage', type: 'number', unit: 'V', placeholder: 'e.g. 48' },
    { key: 'current_a', label: 'Max discharge current', type: 'number', unit: 'A', placeholder: 'e.g. 50' },
    { key: 'cell_count', label: 'Cell count (S)', type: 'number', placeholder: 'e.g. 13' },
  ],
  charger: [
    { key: 'voltage_v', label: 'Output voltage', type: 'number', unit: 'V', placeholder: 'e.g. 48' },
    { key: 'current_a', label: 'Output current', type: 'number', unit: 'A', placeholder: 'e.g. 5' },
    { key: 'connector_type', label: 'Connector type', type: 'text', placeholder: 'e.g. XT90, barrel' },
  ],
  throttle_controller: [
    { key: 'voltage_v', label: 'Operating voltage', type: 'number', unit: 'V', placeholder: 'e.g. 12' },
    { key: 'output_type', label: 'Output type', type: 'text', placeholder: 'e.g. 0–5V, PWM' },
    { key: 'cable_length_in', label: 'Cable length', type: 'number', unit: 'in', placeholder: 'e.g. 36' },
  ],
  voltage_converter: [
    { key: 'input_voltage_v', label: 'Input voltage', type: 'number', unit: 'V', placeholder: 'e.g. 48' },
    { key: 'output_voltage_v', label: 'Output voltage', type: 'number', unit: 'V', placeholder: 'e.g. 12' },
    { key: 'current_a', label: 'Max current', type: 'number', unit: 'A', placeholder: 'e.g. 10' },
  ],
  battery_mount: [
    { key: 'length_in', label: 'Length', type: 'number', unit: 'in', placeholder: 'e.g. 12' },
    { key: 'width_in', label: 'Width', type: 'number', unit: 'in', placeholder: 'e.g. 6' },
    { key: 'max_weight_lbs', label: 'Max battery weight', type: 'number', unit: 'lbs', placeholder: 'e.g. 30' },
  ],
  wiring_harness: [
    { key: 'gauge_awg', label: 'Wire gauge', type: 'number', unit: 'AWG', placeholder: 'e.g. 10' },
    { key: 'length_in', label: 'Length', type: 'number', unit: 'in', placeholder: 'e.g. 60' },
    { key: 'connector_types', label: 'Connector types', type: 'text', placeholder: 'e.g. XT90, Anderson' },
  ],
  fuse_kill_switch: [
    { key: 'current_a', label: 'Rating', type: 'number', unit: 'A', placeholder: 'e.g. 30' },
    { key: 'type', label: 'Type', type: 'text', placeholder: 'e.g. fuse, kill switch, breaker' },
  ],
};

/**
 * Get spec fields for a category. Returns empty array if category unknown.
 */
export function getSpecFieldsForCategory(category: PartCategory): PartSpecField[] {
  return PART_CATEGORY_SPEC_FIELDS[category] ?? [];
}
