'use server';

/**
 * Server actions for price alerts
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';

/**
 * Get current authenticated user
 */
async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  engine_id: string | null;
  part_id: string | null;
  target_price: number;
  current_price: number;
  is_active: boolean;
  email_notifications: boolean;
  in_app_notifications: boolean;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get user's price alerts
 */
export async function getUserPriceAlerts(): Promise<ActionResult<PriceAlert[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to view price alerts');
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[getUserPriceAlerts] Database error:', dbError);
      return error('Failed to fetch price alerts');
    }

    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getUserPriceAlerts');
  }
}

/**
 * Create a price alert
 */
export async function createPriceAlert(
  input: {
    engine_id?: string | null;
    part_id?: string | null;
    target_price: number;
    current_price: number;
    email_notifications?: boolean;
    in_app_notifications?: boolean;
  }
): Promise<ActionResult<PriceAlert>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to create price alerts');
    }

    if (!input.engine_id && !input.part_id) {
      return error('Either engine_id or part_id must be provided');
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('price_alerts')
      .insert({
        user_id: user.id,
        engine_id: input.engine_id || null,
        part_id: input.part_id || null,
        target_price: input.target_price,
        current_price: input.current_price,
        email_notifications: input.email_notifications ?? true,
        in_app_notifications: input.in_app_notifications ?? true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[createPriceAlert] Database error:', dbError);
      return error('Failed to create price alert');
    }

    revalidatePath('/profile/alerts');
    return success(data);
  } catch (err) {
    return handleError(err, 'createPriceAlert');
  }
}

/**
 * Update a price alert
 */
export async function updatePriceAlert(
  id: string,
  input: {
    target_price?: number;
    is_active?: boolean;
    email_notifications?: boolean;
    in_app_notifications?: boolean;
  }
): Promise<ActionResult<PriceAlert>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in');
    }

    const supabase = await createClient();

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.target_price !== undefined) updates.target_price = input.target_price;
    if (input.is_active !== undefined) updates.is_active = input.is_active;
    if (input.email_notifications !== undefined) updates.email_notifications = input.email_notifications;
    if (input.in_app_notifications !== undefined) updates.in_app_notifications = input.in_app_notifications;

    const { data, error: dbError } = await supabase
      .from('price_alerts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) {
      console.error('[updatePriceAlert] Database error:', dbError);
      return error('Failed to update price alert');
    }

    revalidatePath('/profile/alerts');
    return success(data);
  } catch (err) {
    return handleError(err, 'updatePriceAlert');
  }
}

/**
 * Delete a price alert
 */
export async function deletePriceAlert(id: string): Promise<ActionResult<{ deleted: true }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in');
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('[deletePriceAlert] Database error:', dbError);
      return error('Failed to delete price alert');
    }

    revalidatePath('/profile/alerts');
    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deletePriceAlert');
  }
}

/**
 * Get price history for an engine or part
 */
export async function getPriceHistory(
  engineId?: string | null,
  partId?: string | null,
  days: number = 30
): Promise<ActionResult<Array<{ price: number; checked_at: string; source: string | null }>>> {
  try {
    if (!engineId && !partId) {
      return error('Either engineId or partId must be provided');
    }

    const supabase = await createClient();

    let query = supabase
      .from('price_history')
      .select('price, checked_at, source')
      .order('checked_at', { ascending: false });

    if (engineId) {
      query = query.eq('engine_id', engineId);
    } else if (partId) {
      query = query.eq('part_id', partId);
    }

    // Filter by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query = query.gte('checked_at', startDate.toISOString());

    const { data, error: dbError } = await query.limit(100);

    if (dbError) {
      console.error('[getPriceHistory] Database error:', dbError);
      return error('Failed to fetch price history');
    }

    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getPriceHistory');
  }
}
