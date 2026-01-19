'use server';

/**
 * Admin server actions for compatibility rules management
 * Requires admin or super_admin role
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { uuidSchema, parseInput } from '@/lib/validation/schemas';
import type { CompatibilityRule } from '@/types/database';

/**
 * Get all compatibility rules for admin management
 */
export async function getAdminCompatibilityRules(): Promise<ActionResult<CompatibilityRule[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data: rules, error: dbError } = await supabase
      .from('compatibility_rules')
      .select('*')
      .order('rule_type')
      .order('source_category')
      .order('severity');

    if (dbError) {
      return error('Failed to fetch compatibility rules');
    }

    return success((rules as CompatibilityRule[]) || []);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch compatibility rules');
  }
}

/**
 * Create a new compatibility rule
 */
export async function createCompatibilityRule(data: {
  rule_type: string;
  source_category: string;
  target_category: string;
  condition: Record<string, unknown>;
  warning_message: string;
  severity: 'error' | 'warning' | 'info';
  is_active?: boolean;
}): Promise<ActionResult<CompatibilityRule>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate required fields
    if (!data.rule_type || !data.source_category || !data.target_category || !data.warning_message) {
      return error('Rule type, source category, target category, and warning message are required');
    }

    // Validate severity
    if (!['error', 'warning', 'info'].includes(data.severity)) {
      return error('Severity must be error, warning, or info');
    }

    const supabase = await createClient();

    // Get current user for created_by
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return error('You must be logged in');
    }

    const { data: rule, error: dbError } = await supabase
      .from('compatibility_rules')
      .insert({
        rule_type: data.rule_type,
        source_category: data.source_category,
        target_category: data.target_category,
        condition: data.condition,
        warning_message: data.warning_message,
        severity: data.severity,
        is_active: data.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError || !rule) {
      return error('Failed to create compatibility rule');
    }

    revalidatePath('/admin/compatibility');
    revalidatePath('/builder'); // Revalidate builder since rules affect compatibility checks

    return success(rule as CompatibilityRule);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to create compatibility rule');
  }
}

/**
 * Update an existing compatibility rule
 */
export async function updateCompatibilityRule(
  id: string,
  data: Partial<{
    rule_type: string;
    source_category: string;
    target_category: string;
    condition: Record<string, unknown>;
    warning_message: string;
    severity: 'error' | 'warning' | 'info';
    is_active: boolean;
  }>
): Promise<ActionResult<CompatibilityRule>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate ID
    const parsed = parseInput(uuidSchema, id);
    if (!parsed.success) {
      return error('Invalid rule ID');
    }

    // Validate severity if provided
    if (data.severity && !['error', 'warning', 'info'].includes(data.severity)) {
      return error('Severity must be error, warning, or info');
    }

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.rule_type !== undefined) updateData.rule_type = data.rule_type;
    if (data.source_category !== undefined) updateData.source_category = data.source_category;
    if (data.target_category !== undefined) updateData.target_category = data.target_category;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.warning_message !== undefined) updateData.warning_message = data.warning_message;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const { data: rule, error: dbError } = await supabase
      .from('compatibility_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (dbError || !rule) {
      return error('Failed to update compatibility rule');
    }

    revalidatePath('/admin/compatibility');
    revalidatePath('/builder');

    return success(rule as CompatibilityRule);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to update compatibility rule');
  }
}

/**
 * Delete a compatibility rule (soft delete - sets is_active to false)
 */
export async function deleteCompatibilityRule(id: string): Promise<ActionResult<{ deleted: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate ID
    const parsed = parseInput(uuidSchema, id);
    if (!parsed.success) {
      return error('Invalid rule ID');
    }

    const supabase = await createClient();

    // Soft delete - set is_active to false
    const { error: dbError } = await supabase
      .from('compatibility_rules')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (dbError) {
      return error('Failed to delete compatibility rule');
    }

    revalidatePath('/admin/compatibility');
    revalidatePath('/builder');

    return success({ deleted: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to delete compatibility rule');
  }
}

/**
 * Toggle rule active status
 */
export async function toggleRuleActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<CompatibilityRule>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate ID
    const parsed = parseInput(uuidSchema, id);
    if (!parsed.success) {
      return error('Invalid rule ID');
    }

    const supabase = await createClient();

    const { data: rule, error: dbError } = await supabase
      .from('compatibility_rules')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (dbError || !rule) {
      return error('Failed to toggle rule status');
    }

    revalidatePath('/admin/compatibility');
    revalidatePath('/builder');

    return success(rule as CompatibilityRule);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to toggle rule status');
  }
}
