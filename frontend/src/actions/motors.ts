'use server';

/**
 * Server actions for electric motor operations
 * Per A13 EV Implementation Agent spec
 */

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { 
  motorFiltersSchema, 
  getMotorSchema,
  getMotorBySlugSchema,
  parseInput,
  type MotorFiltersInput 
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { ElectricMotor } from '@/types/database';

/** Cache TTL for public read-heavy data (10 min) */
const MOTORS_CACHE_REVALIDATE = 600;

/**
 * Fetch all active electric motors with optional filters
 * Public action - no auth required
 * Cached for 10 min to reduce DB load at scale
 */
export async function getMotors(
  filters?: Partial<MotorFiltersInput>
): Promise<ActionResult<ElectricMotor[]>> {
  try {
    const parsed = parseInput(motorFiltersSchema, filters ?? {});
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const cacheKey = JSON.stringify(parsed.data);

    return unstable_cache(
      async () => {
        const supabase = await createClient();

        if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          return error('Database connection not configured. Please check environment variables.');
        }

        const { brand, voltage, min_hp, max_hp, min_power_kw, max_power_kw, sort, order, limit } = parsed.data;

        let query = supabase.from('electric_motors').select('*').eq('is_active', true);

        if (brand) query = query.eq('brand', brand);
        if (voltage !== undefined) query = query.eq('voltage', voltage);
        if (min_hp !== undefined) query = query.gte('horsepower', min_hp);
        if (max_hp !== undefined) query = query.lte('horsepower', max_hp);
        if (min_power_kw !== undefined) query = query.gte('power_kw', min_power_kw);
        if (max_power_kw !== undefined) query = query.lte('power_kw', max_power_kw);

        query = query.order(sort, { ascending: order === 'asc' }).limit(limit);

        const { data, error: dbError } = await query;

        if (dbError) {
          console.error('[getMotors] Database error:', dbError);
          return error('Failed to fetch motors');
        }
        return success(data ?? []);
      },
      ['motors', cacheKey],
      { revalidate: MOTORS_CACHE_REVALIDATE }
    )() as Promise<ActionResult<ElectricMotor[]>>;
  } catch (err) {
    return handleError(err, 'getMotors');
  }
}

/**
 * Fetch single motor by ID
 * Public action - no auth required
 */
export async function getMotor(
  id: string
): Promise<ActionResult<ElectricMotor>> {
  try {
    // Validate input
    const parsed = parseInput(getMotorSchema, { id });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('electric_motors')
      .select('*')
      .eq('id', parsed.data.id)
      .eq('is_active', true)
      .single();
    
    if (dbError) {
      return handleError(dbError, 'getMotor', 'Motor');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getMotor');
  }
}

/**
 * Fetch single motor by slug
 * Public action - no auth required
 * Cached for 10 min (detail pages are hot read paths)
 */
export async function getMotorBySlug(
  slug: string
): Promise<ActionResult<ElectricMotor>> {
  try {
    const parsed = parseInput(getMotorBySlugSchema, { slug });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const slugKey = parsed.data.slug;

    return unstable_cache(
      async () => {
        const supabase = await createClient();
        const { data, error: dbError } = await supabase
          .from('electric_motors')
          .select('*')
          .eq('slug', slugKey)
          .eq('is_active', true)
          .single();

        if (dbError) {
          return handleError(dbError, 'getMotorBySlug', 'Motor');
        }
        return success(data);
      },
      ['motor-by-slug', slugKey],
      { revalidate: MOTORS_CACHE_REVALIDATE }
    )() as Promise<ActionResult<ElectricMotor>>;
  } catch (err) {
    return handleError(err, 'getMotorBySlug');
  }
}

/**
 * Fetch unique motor brands for filtering UI
 * Public action - no auth required
 * Cached for 10 min
 */
export async function getMotorBrands(): Promise<ActionResult<string[]>> {
  try {
    return unstable_cache(
      async () => {
        const supabase = await createClient();
        const { data, error: dbError } = await supabase
          .from('electric_motors')
          .select('brand')
          .eq('is_active', true)
          .order('brand');

        if (dbError) {
          console.error('[getMotorBrands] Database error:', dbError);
          return error('Failed to fetch motor brands');
        }
        const brandList: string[] = data?.map((m: { brand: string }) => m.brand) ?? [];
        const uniqueBrands: string[] = [...new Set(brandList)];
        return success(uniqueBrands);
      },
      ['motor-brands'],
      { revalidate: MOTORS_CACHE_REVALIDATE }
    )() as Promise<ActionResult<string[]>>;
  } catch (err) {
    return handleError(err, 'getMotorBrands');
  }
}

/**
 * Get EV parts compatible with a specific motor
 * Filters by voltage matching and power requirements
 * Public action - no auth required
 */
export async function getCompatibleMotorParts(
  motorId: string,
  category?: string
): Promise<ActionResult<import('@/types/database').Part[]>> {
  try {
    const supabase = await createClient();
    
    // Fetch the motor
    const { data: motor, error: motorError } = await supabase
      .from('electric_motors')
      .select('*')
      .eq('id', motorId)
      .eq('is_active', true)
      .single();
    
    if (motorError) {
      if (motorError.code === 'PGRST116') {
        return error('Motor not found');
      }
      return error('Failed to fetch motor');
    }
    
    // EV part categories that can be compatible
    const evCategories = [
      'battery',
      'motor_controller',
      'bms',
      'charger',
      'throttle_controller',
      'voltage_converter',
      'battery_mount',
      'wiring_harness',
    ];
    
    // Fetch active EV parts (optionally filtered by category)
    let partsQuery = supabase
      .from('parts')
      .select('*')
      .eq('is_active', true)
      .in('category', evCategories);
    
    if (category) {
      partsQuery = partsQuery.eq('category', category);
    }
    
    const { data: allParts, error: partsError } = await partsQuery;
    
    if (partsError) {
      return error('Failed to fetch parts');
    }
    
    if (!allParts || allParts.length === 0) {
      return success([]);
    }
    
    // Filter parts based on compatibility rules
    const compatibleParts: import('@/types/database').Part[] = [];
    
    for (const part of allParts) {
      const specs = part.specifications || {};
      let isCompatible = false;
      
      // Battery compatibility: voltage must match
      if (part.category === 'battery') {
        const batteryVoltage = specs.voltage || specs.voltage_v;
        if (batteryVoltage === motor.voltage) {
          isCompatible = true;
        }
      }
      
      // Motor Controller compatibility: voltage must match, power rating must be >= motor power
      else if (part.category === 'motor_controller') {
        const controllerVoltage = specs.voltage || specs.voltage_v;
        const controllerPowerKw = specs.power_kw || specs.max_power_kw || specs.rated_power_kw;
        const controllerCurrent = specs.max_current || specs.rated_current || specs.current_amps;
        
        if (controllerVoltage === motor.voltage) {
          // Check if controller can handle motor power
          if (controllerPowerKw && controllerPowerKw >= motor.power_kw) {
            isCompatible = true;
          } else if (controllerCurrent) {
            // Calculate required current: Power (W) = Voltage (V) × Current (A)
            // Current (A) = Power (kW) × 1000 / Voltage (V)
            const requiredCurrent = (motor.power_kw * 1000) / motor.voltage;
            if (controllerCurrent >= requiredCurrent) {
              isCompatible = true;
            }
          } else {
            // If voltage matches but no power/current spec, assume compatible (user should verify)
            isCompatible = true;
          }
        }
      }
      
      // Charger compatibility: voltage must match
      else if (part.category === 'charger') {
        const chargerVoltage = specs.voltage || specs.voltage_v || specs.output_voltage;
        if (chargerVoltage === motor.voltage) {
          isCompatible = true;
        }
      }
      
      // BMS compatibility: voltage must match
      else if (part.category === 'bms') {
        const bmsVoltage = specs.voltage || specs.voltage_v || specs.cell_count;
        // BMS might be specified by cell count (e.g., 12 cells = 48V for LiFePO4)
        if (bmsVoltage === motor.voltage || 
            (typeof bmsVoltage === 'number' && bmsVoltage * 4 === motor.voltage)) {
          isCompatible = true;
        }
      }
      
      // Other EV parts: generally compatible if voltage matches or not specified
      else {
        const partVoltage = specs.voltage || specs.voltage_v;
        if (!partVoltage || partVoltage === motor.voltage) {
          isCompatible = true;
        }
      }
      
      if (isCompatible) {
        compatibleParts.push(part);
      }
    }
    
    // Sort by category, then by price
    compatibleParts.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      return priceA - priceB;
    });
    
    return success(compatibleParts);
  } catch (err) {
    return handleError(err, 'getCompatibleMotorParts');
  }
}
