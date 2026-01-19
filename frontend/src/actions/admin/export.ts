'use server';

/**
 * CSV Export server actions
 * Exports engines and parts to CSV format
 */

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import type { AdminEngine, AdminPart } from '@/types/admin';
import type { Engine, Part } from '@/types/database';

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Export engines to CSV
 */
export async function exportEnginesCSV(): Promise<ActionResult<string>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();
    
    const { data: engines, error: dbError } = await supabase
      .from('engines')
      .select('*')
      .order('brand')
      .order('displacement_cc');

    if (dbError) {
      return error('Failed to export engines');
    }

    if (!engines || engines.length === 0) {
      return success('name,slug,brand,model,variant,displacement_cc,horsepower,torque,shaft_diameter,shaft_length,shaft_type,shaft_keyway,mount_type,oil_capacity_oz,fuel_tank_oz,weight_lbs,price,image_url,affiliate_url,is_active,notes');
    }

    // Convert to CSV-friendly format
    const csvData = (engines as Engine[]).map((engine: Engine) => ({
      name: engine.name,
      slug: engine.slug,
      brand: engine.brand,
      model: (engine as any).model || '',
      variant: (engine as any).variant || '',
      displacement_cc: engine.displacement_cc,
      horsepower: engine.horsepower,
      torque: engine.torque || 0,
      shaft_diameter: engine.shaft_diameter,
      shaft_length: engine.shaft_length || '',
      shaft_type: engine.shaft_type,
      shaft_keyway: (engine as any).shaft_keyway || '',
      mount_type: engine.mount_type || '',
      oil_capacity_oz: (engine as any).oil_capacity_oz || '',
      fuel_tank_oz: (engine as any).fuel_tank_oz || '',
      weight_lbs: engine.weight_lbs || null,
      price: engine.price || null,
      image_url: engine.image_url || '',
      affiliate_url: engine.affiliate_url || '',
      is_active: engine.is_active,
      notes: (engine as any).notes || '',
    }));

    const csv = arrayToCSV(csvData);
    return success(csv);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Export failed');
  }
}

/**
 * Export parts to CSV
 */
export async function exportPartsCSV(): Promise<ActionResult<string>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();
    
    const { data: parts, error: dbError } = await supabase
      .from('parts')
      .select('*')
      .order('category')
      .order('brand')
      .order('name');

    if (dbError) {
      return error('Failed to export parts');
    }

    if (!parts || parts.length === 0) {
      return success('name,slug,category,category_id,brand,specifications,price,image_url,affiliate_url,is_active');
    }

    // Convert to CSV-friendly format
    const csvData = (parts as Part[]).map((part: Part) => ({
      name: part.name,
      slug: part.slug,
      category: part.category,
      category_id: (part as any).category_id || '',
      brand: part.brand || null,
      specifications: JSON.stringify(part.specifications || {}),
      price: part.price || null,
      image_url: part.image_url || '',
      affiliate_url: part.affiliate_url || '',
      is_active: part.is_active,
    }));

    const csv = arrayToCSV(csvData);
    return success(csv);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Export failed');
  }
}

/**
 * Get CSV template for engines
 */
export async function getEnginesCSVTemplate(): Promise<ActionResult<string>> {
  try {
    await requireAdmin();
    
    const template = `name,slug,brand,model,variant,displacement_cc,horsepower,torque,shaft_diameter,shaft_length,shaft_type,shaft_keyway,mount_type,oil_capacity_oz,fuel_tank_oz,weight_lbs,price,image_url,affiliate_url,is_active,notes
Predator 212 Hemi,predator-212-hemi,Predator,212,Hemi,212,6.5,8.1,0.75,2.3125,straight,0.1875,162mm x 75.5mm,20.3,121.7,34.8,299.99,,,true,Updated design with hemispherical combustion chamber`;

    return success(template);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to get template');
  }
}

/**
 * Get CSV template for parts
 */
export async function getPartsCSVTemplate(): Promise<ActionResult<string>> {
  try {
    await requireAdmin();
    
    const template = `name,slug,category,category_id,brand,specifications,price,image_url,affiliate_url,is_active
MaxTorque Clutch 3/4",maxtorque-clutch-3-4,clutch,,MaxTorque,"{""bore_in"":0.75,""engagement_rpm"":1800,""chain_size"":""#35""}",49.99,,,true`;

    return success(template);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to get template');
  }
}
