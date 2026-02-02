/**
 * Import Electro & Company QS Motors
 * 
 * This script imports QS motors from Electro & Company's kart fabrication collection.
 * Source: https://electroandcompany.com/collections/kart-fabrication
 * 
 * Run: npx tsx scripts/import-electro-company-motors.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../frontend/.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Electro & Company motors data
// Based on: https://electroandcompany.com/collections/kart-fabrication
const motors = [
  {
    name: 'QS138 90H',
    brand: 'QS Motor',
    model: 'QS138-90H',
    variant: null,
    voltage: 72, // Typically 48V-72V, using 72V as standard
    power_kw: 4.0, // 4000W continuous
    peak_power_kw: 7.5, // Peak power
    horsepower: 5.4, // 4kW * 1.34
    torque_lbft: 44.3, // ~60 Nm converted
    rpm_max: 6500, // With flux weakening
    rpm_rated: 4000,
    efficiency: 0.93,
    shaft_diameter: 0.875, // Common for QS138
    shaft_length: 2.5,
    shaft_type: 'straight' as const,
    mount_type: 'mid_drive',
    controller_required: true,
    cooling_type: 'air',
    weight_lbs: 29.3, // 13.3 kg
    price: 449.00, // Sale price
    affiliate_url: 'https://electroandcompany.com/products/qsmotor-qs138-4000w-with-splines-1',
    notes: 'QS138 90H 4000W motor. High-performance mid-drive motor with 7.5kW peak power. IP67 waterproof rating.',
  },
  {
    name: 'QS120',
    brand: 'QS Motor',
    model: 'QS120',
    variant: 'Spline Drive',
    voltage: 72,
    power_kw: 2.0, // 2000W
    peak_power_kw: 3.0,
    horsepower: 2.7,
    torque_lbft: 33.2, // ~45 Nm
    rpm_max: 4600, // With flux weakening
    rpm_rated: 3200,
    efficiency: 0.93,
    shaft_diameter: 0.750,
    shaft_length: 2.0,
    shaft_type: 'straight' as const,
    mount_type: 'mid_drive',
    controller_required: true,
    cooling_type: 'air',
    weight_lbs: 18.0, // Estimated
    price: 299.00, // Sale price
    affiliate_url: 'https://electroandcompany.com/products/qsmotor-qs120-428-sprocket-drive-type-1',
    notes: 'QS120 2000W motor with spline drive. Compact mid-drive motor for electric motorcycles and bikes.',
  },
  {
    name: 'QS138 70H V1',
    brand: 'QS Motor',
    model: 'QS138-70H',
    variant: 'V1',
    voltage: 72, // Typically 48V-72V
    power_kw: 3.0, // 3000W
    peak_power_kw: 5.0,
    horsepower: 4.0,
    torque_lbft: 40.0, // Estimated
    rpm_max: 6000,
    rpm_rated: 3500,
    efficiency: 0.92,
    shaft_diameter: 0.875,
    shaft_length: 2.5,
    shaft_type: 'straight' as const,
    mount_type: 'mid_drive',
    controller_required: true,
    cooling_type: 'air',
    weight_lbs: 26.0, // Estimated
    price: 349.00, // Sale price
    affiliate_url: 'https://electroandcompany.com/products/qsmotor-qs138-70h-v1-3000w',
    notes: 'QS138 70H V1 3000W motor. Mid-drive motor with good balance of power and efficiency.',
  },
  {
    name: 'QS138 70H V2',
    brand: 'QS Motor',
    model: 'QS138-70H',
    variant: 'V2',
    voltage: 72,
    power_kw: 3.0, // 3000W
    peak_power_kw: 5.0,
    horsepower: 4.0,
    torque_lbft: 40.0, // Estimated
    rpm_max: 6000,
    rpm_rated: 3500,
    efficiency: 0.92,
    shaft_diameter: 0.875,
    shaft_length: 2.5,
    shaft_type: 'straight' as const,
    mount_type: 'mid_drive',
    controller_required: true,
    cooling_type: 'air',
    weight_lbs: 26.0, // Estimated
    price: 349.00, // Sale price
    affiliate_url: 'https://electroandcompany.com/products/qsmotor-qs138-70h-v2-3000w',
    notes: 'QS138 70H V2 3000W motor. Updated version with improved performance.',
  },
  {
    name: 'QS165 35H V2',
    brand: 'QS Motor',
    model: 'QS165-35H',
    variant: 'V2',
    voltage: 72,
    power_kw: 5.0, // Estimated based on model number
    peak_power_kw: 8.0,
    horsepower: 6.7,
    torque_lbft: 50.0, // Estimated
    rpm_max: 5500,
    rpm_rated: 3000,
    efficiency: 0.92,
    shaft_diameter: 1.000,
    shaft_length: 3.0,
    shaft_type: 'straight' as const,
    mount_type: 'mid_drive',
    controller_required: true,
    cooling_type: 'air',
    weight_lbs: 35.0, // Estimated
    price: 299.00, // Sale price
    affiliate_url: 'https://electroandcompany.com/products/qsmotor-qs165-35h-v2-hall-motor',
    notes: 'QS165 35H V2 Hall motor. Compatible with Sur Ron and KO systems.',
  },
  {
    name: 'QS90',
    brand: 'QS Motor',
    model: 'QS90',
    variant: null,
    voltage: 48, // Typical for smaller motors
    power_kw: 1.0, // 1000W
    peak_power_kw: 1.5,
    horsepower: 1.3,
    torque_lbft: 15.0, // Estimated
    rpm_max: 4000,
    rpm_rated: 2800,
    efficiency: 0.90,
    shaft_diameter: 0.625,
    shaft_length: 1.5,
    shaft_type: 'straight' as const,
    mount_type: 'mid_drive',
    controller_required: true,
    cooling_type: 'air',
    weight_lbs: 12.0, // Estimated
    price: 349.00,
    affiliate_url: 'https://electroandcompany.com/products/qsmotor-qs90-1000w',
    notes: 'QS90 1000W motor. Entry-level motor for light-duty go-karts.',
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function importMotors() {
  console.log('🚀 Starting Electro & Company motor import...\n');
  console.log(`📊 Found ${motors.length} motors to import\n`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: Array<{ motor: string; error: string }> = [];

  for (const motor of motors) {
    const slug = slugify(`${motor.brand} ${motor.name}${motor.variant ? ` ${motor.variant}` : ''}`);
    
    console.log(`📦 Importing: ${motor.name}${motor.variant ? ` ${motor.variant}` : ''} (${motor.voltage}V, ${motor.power_kw}kW)...`);

    try {
      // Validate required fields
      if (!motor.name || !motor.brand || !motor.voltage || !motor.power_kw || !motor.horsepower) {
        throw new Error('Missing required fields');
      }

      const { data, error } = await supabase
        .from('electric_motors')
        .insert({
          slug,
          name: motor.name,
          brand: motor.brand,
          model: motor.model || null,
          variant: motor.variant || null,
          voltage: motor.voltage,
          power_kw: motor.power_kw,
          peak_power_kw: motor.peak_power_kw || null,
          horsepower: motor.horsepower,
          torque_lbft: motor.torque_lbft || 10, // Default if missing
          rpm_max: motor.rpm_max || null,
          rpm_rated: motor.rpm_rated || null,
          efficiency: motor.efficiency || null,
          shaft_diameter: motor.shaft_diameter || null,
          shaft_length: motor.shaft_length || null,
          shaft_type: motor.shaft_type || 'straight',
          mount_type: motor.mount_type || null,
          controller_required: motor.controller_required ?? true,
          cooling_type: motor.cooling_type || null,
          weight_lbs: motor.weight_lbs || null,
          price: motor.price || null,
          affiliate_url: motor.affiliate_url || null,
          notes: motor.notes || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log(`   ⚠️  Already exists (slug: ${slug}), skipping...`);
          skippedCount++;
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Success! ID: ${data.id}, Slug: ${slug}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Error: ${err.message}`);
      errorCount++;
      errors.push({ motor: motor.name, error: err.message });
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⚠️  Skipped (already exist): ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ motor, error }) => {
      console.log(`   - ${motor}: ${error}`);
    });
  }

  console.log('\n✨ Done!');
}

// Run import
importMotors().catch(console.error);
