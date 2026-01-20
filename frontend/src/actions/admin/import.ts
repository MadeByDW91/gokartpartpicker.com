'use server';

/**
 * CSV Import server actions
 * Handles bulk import of engines and parts from CSV files
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { createEngineSchema, createPartSchema } from '@/lib/validation/schemas';
import { slugify } from '@/lib/utils';
import type { AdminEngine, AdminPart } from '@/types/admin';

interface ImportResult<T> {
  success: number;
  failed: number;
  errors: Array<{ row: number; data: T; error: string }>;
  imported: T[];
}

interface CSVRow {
  [key: string]: string;
}

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  // Get headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Parse rows
  return lines.slice(1).map((line, _index) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: CSVRow = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });
}

/**
 * Validate and prepare engine data from CSV row
 */
function prepareEngineFromCSV(row: CSVRow, _rowIndex: number): { success: false; error: string } | { success: true; data: unknown } {
  try {
    // Required fields
    if (!row.name) {
      return { success: false, error: 'Name is required' };
    }

    const slug = row.slug || slugify(row.name);
    const engineData = {
      slug,
      name: row.name,
      brand: row.brand || '',
      model: row.model || null,
      variant: row.variant || null,
      displacement_cc: row.displacement_cc ? parseInt(row.displacement_cc, 10) : 212,
      horsepower: row.horsepower ? parseFloat(row.horsepower) : 6.5,
      torque: row.torque ? parseFloat(row.torque) : null,
      shaft_diameter: row.shaft_diameter ? parseFloat(row.shaft_diameter) : 0.75,
      shaft_length: row.shaft_length ? parseFloat(row.shaft_length) : null,
      shaft_type: (row.shaft_type || 'straight') as 'straight' | 'tapered' | 'threaded',
      shaft_keyway: row.shaft_keyway ? parseFloat(row.shaft_keyway) : null,
      mount_type: row.mount_type || null,
      oil_capacity_oz: row.oil_capacity_oz ? parseFloat(row.oil_capacity_oz) : null,
      fuel_tank_oz: row.fuel_tank_oz ? parseFloat(row.fuel_tank_oz) : null,
      weight_lbs: row.weight_lbs ? parseFloat(row.weight_lbs) : null,
      price: row.price ? parseFloat(row.price) : null,
      image_url: row.image_url || null,
      affiliate_url: row.affiliate_url || null,
      notes: row.notes || null,
      is_active: row.is_active === 'false' ? false : true,
    };

    // Validate with schema
    const parsed = createEngineSchema.safeParse(engineData);
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.issues[0]?.message || 'Validation failed' 
      };
    }

    return { success: true, data: parsed.data };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to parse row' 
    };
  }
}

/**
 * Validate and prepare part data from CSV row
 */
function preparePartFromCSV(row: CSVRow, _rowIndex: number): { success: false; error: string } | { success: true; data: unknown } {
  try {
    // Required fields
    if (!row.name) {
      return { success: false, error: 'Name is required' };
    }
    if (!row.category) {
      return { success: false, error: 'Category is required' };
    }

    const slug = row.slug || slugify(row.name);
    
    // Parse specifications JSON if provided
    let specifications = {};
    if (row.specifications) {
      try {
        specifications = JSON.parse(row.specifications);
      } catch {
        // If not JSON, try to parse as simple key-value pairs
        specifications = {};
      }
    }

    const partData = {
      slug,
      name: row.name,
      category: row.category as any,
      brand: row.brand || null,
      specifications,
      price: row.price ? parseFloat(row.price) : null,
      image_url: row.image_url || null,
      affiliate_url: row.affiliate_url || null,
      is_active: row.is_active === 'false' ? false : true,
    };

    // Validate with schema
    const parsed = createPartSchema.safeParse(partData);
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.issues[0]?.message || 'Validation failed' 
      };
    }

    return { success: true, data: parsed.data };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to parse row' 
    };
  }
}

/**
 * Import engines from CSV
 */
export async function importEnginesCSV(
  csvText: string
): Promise<ActionResult<ImportResult<AdminEngine>>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const rows = parseCSV(csvText);
    const result: ImportResult<AdminEngine> = {
      success: 0,
      failed: 0,
      errors: [],
      imported: [],
    };

    const supabase = await createClient();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const prepared = prepareEngineFromCSV(row, i + 2); // +2 because row 1 is headers

      if (!prepared.success) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          data: row as any,
          error: prepared.error,
        });
        continue;
      }

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('engines')
        .select('id')
        .eq('slug', (prepared.data as any).slug)
        .single();

      if (existing) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          data: row as any,
          error: 'Slug already exists',
        });
        continue;
      }

      // Insert engine
      const { data: inserted, error: dbError } = await supabase
        .from('engines')
        .insert({
          ...(prepared.data as any),
          created_by: userId,
        })
        .select()
        .single();

      if (dbError || !inserted) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          data: row as any,
          error: dbError?.message || 'Failed to insert',
        });
        continue;
      }

      result.success++;
      result.imported.push(inserted as AdminEngine);
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success(result);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Import failed');
  }
}

/**
 * Import parts from CSV
 */
export async function importPartsCSV(
  csvText: string
): Promise<ActionResult<ImportResult<AdminPart>>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const rows = parseCSV(csvText);
    const result: ImportResult<AdminPart> = {
      success: 0,
      failed: 0,
      errors: [],
      imported: [],
    };

    const supabase = await createClient();

    // Get category IDs for lookup
    const { data: categories } = await supabase
      .from('part_categories')
      .select('id, slug');

    const categoryMap = new Map(
      (categories || []).map((cat: { slug: string; id: string }) => [cat.slug, cat.id])
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const prepared = preparePartFromCSV(row, i + 2);

      if (!prepared.success) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          data: row as any,
          error: prepared.error,
        });
        continue;
      }

      const partData = prepared.data as any;

      // Lookup category_id if category slug provided
      let categoryId = null;
      if (row.category_id) {
        categoryId = row.category_id;
      } else if (row.category && categoryMap.has(row.category)) {
        categoryId = categoryMap.get(row.category);
      }

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('parts')
        .select('id')
        .eq('slug', partData.slug)
        .single();

      if (existing) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          data: row as any,
          error: 'Slug already exists',
        });
        continue;
      }

      // Insert part
      const { data: inserted, error: dbError } = await supabase
        .from('parts')
        .insert({
          ...partData,
          category_id: categoryId,
          created_by: userId,
        })
        .select()
        .single();

      if (dbError || !inserted) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          data: row as any,
          error: dbError?.message || 'Failed to insert',
        });
        continue;
      }

      result.success++;
      result.imported.push(inserted as AdminPart);
    }

    revalidatePath('/admin/parts');
    revalidatePath('/parts');

    return success(result);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Import failed');
  }
}

/**
 * Preview CSV import (validation only, no database writes)
 */
export async function previewImportCSV(
  csvText: string,
  type: 'engines' | 'parts'
): Promise<ActionResult<{ valid: Array<{ row: number; data: any }>; invalid: Array<{ row: number; data: any; error: string }> }>> {
  try {
    await requireAdmin();

    const rows = parseCSV(csvText);
    const valid: Array<{ row: number; data: any }> = [];
    const invalid: Array<{ row: number; data: any; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const prepared = type === 'engines' 
        ? prepareEngineFromCSV(row, i + 2)
        : preparePartFromCSV(row, i + 2);

      if (prepared.success) {
        valid.push({ row: i + 2, data: prepared.data });
      } else {
        invalid.push({
          row: i + 2,
          data: row,
          error: prepared.error,
        });
      }
    }

    return success({ valid, invalid });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Preview failed');
  }
}
