'use server';

/**
 * Server actions for affiliate link analytics and management
 */

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  handleError 
} from '@/lib/api/types';

export interface AffiliateLinkStats {
  total: number;
  active: number;
  broken: number;
  missing: number;
  byProgram: {
    amazon: number;
    ebay: number;
    other: number;
  };
  byType: {
    engines: number;
    parts: number;
  };
  coverage: {
    engines: { withLinks: number; total: number; percentage: number };
    parts: { withLinks: number; total: number; percentage: number };
  };
}

export interface AffiliateLinkItem {
  id: string;
  type: 'engine' | 'part';
  name: string;
  slug: string;
  affiliate_url: string | null;
  is_active: boolean;
  status: 'active' | 'broken' | 'missing';
  program: 'amazon' | 'ebay' | 'other' | null;
  last_checked?: string;
}

/**
 * Get comprehensive affiliate link statistics
 */
export async function getAffiliateLinkStats(): Promise<ActionResult<AffiliateLinkStats>> {
  try {
    await requireAdmin();
    
    const supabase = await createClient();
    
    // Get all engines
    const { data: engines, error: enginesError } = await supabase
      .from('engines')
      .select('id, affiliate_url, is_active');
    
    if (enginesError) {
      console.error('[getAffiliateLinkStats] Engines error:', enginesError);
    }
    
    // Get all parts
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('id, affiliate_url, is_active');
    
    if (partsError) {
      console.error('[getAffiliateLinkStats] Parts error:', partsError);
    }
    
    const allItems = [
      ...(engines || []).map((e: any) => ({ ...e, type: 'engine' as const })),
      ...(parts || []).map((p: any) => ({ ...p, type: 'part' as const })),
    ];
    
    const total = allItems.length;
    const withLinks = allItems.filter((item: any) => item.affiliate_url && item.affiliate_url.trim() !== '');
    const active = withLinks.filter((item: any) => item.is_active);
    const missing = allItems.filter((item: any) => !item.affiliate_url || item.affiliate_url.trim() === '');
    
    // Categorize by program
    const amazonLinks = withLinks.filter((item: any) => 
      item.affiliate_url?.includes('amazon.com') || item.affiliate_url?.includes('amzn.to')
    );
    const ebayLinks = withLinks.filter((item: any) => 
      item.affiliate_url?.includes('ebay.com') || item.affiliate_url?.includes('ebay.us')
    );
    const otherLinks = withLinks.filter((item: any) => 
      !item.affiliate_url?.includes('amazon.com') && 
      !item.affiliate_url?.includes('amzn.to') &&
      !item.affiliate_url?.includes('ebay.com') &&
      !item.affiliate_url?.includes('ebay.us')
    );
    
    // Categorize by type
    const engineLinks = withLinks.filter((item: any) => item.type === 'engine');
    const partLinks = withLinks.filter((item: any) => item.type === 'part');
    
    // Coverage stats
    const enginesWithLinks = (engines || []).filter((e: any) => e.affiliate_url && e.affiliate_url.trim() !== '').length;
    const partsWithLinks = (parts || []).filter((p: any) => p.affiliate_url && p.affiliate_url.trim() !== '').length;
    
    return success({
      total,
      active: active.length,
      broken: 0, // Will be calculated by link checker
      missing: missing.length,
      byProgram: {
        amazon: amazonLinks.length,
        ebay: ebayLinks.length,
        other: otherLinks.length,
      },
      byType: {
        engines: engineLinks.length,
        parts: partLinks.length,
      },
      coverage: {
        engines: {
          withLinks: enginesWithLinks,
          total: engines?.length || 0,
          percentage: engines?.length ? Math.round((enginesWithLinks / engines.length) * 100) : 0,
        },
        parts: {
          withLinks: partsWithLinks,
          total: parts?.length || 0,
          percentage: parts?.length ? Math.round((partsWithLinks / parts.length) * 100) : 0,
        },
      },
    });
  } catch (err) {
    return handleError(err, 'getAffiliateLinkStats');
  }
}

/**
 * Get list of items with affiliate link status
 */
export async function getAffiliateLinkItems(
  filters?: {
    type?: 'engine' | 'part' | 'all';
    status?: 'active' | 'broken' | 'missing' | 'all';
    program?: 'amazon' | 'ebay' | 'other' | 'all';
  }
): Promise<ActionResult<AffiliateLinkItem[]>> {
  try {
    await requireAdmin();
    
    const supabase = await createClient();
    const items: AffiliateLinkItem[] = [];
    
    // Fetch engines if needed
    if (!filters?.type || filters.type === 'engine' || filters.type === 'all') {
      const { data: engines } = await supabase
        .from('engines')
        .select('id, name, slug, affiliate_url, is_active');
      
      if (engines) {
        for (const engine of engines) {
          const hasLink = engine.affiliate_url && engine.affiliate_url.trim() !== '';
          const status: 'active' | 'broken' | 'missing' = hasLink 
            ? (engine.is_active ? 'active' : 'broken')
            : 'missing';
          
          let program: 'amazon' | 'ebay' | 'other' | null = null;
          if (hasLink) {
            if (engine.affiliate_url?.includes('amazon.com') || engine.affiliate_url?.includes('amzn.to')) {
              program = 'amazon';
            } else if (engine.affiliate_url?.includes('ebay.com') || engine.affiliate_url?.includes('ebay.us')) {
              program = 'ebay';
            } else {
              program = 'other';
            }
          }
          
          // Apply filters
          if (filters?.status && filters.status !== 'all' && status !== filters.status) continue;
          if (filters?.program && filters.program !== 'all' && program !== filters.program) continue;
          
          items.push({
            id: engine.id,
            type: 'engine',
            name: engine.name,
            slug: engine.slug,
            affiliate_url: engine.affiliate_url,
            is_active: engine.is_active,
            status,
            program,
          });
        }
      }
    }
    
    // Fetch parts if needed
    if (!filters?.type || filters.type === 'part' || filters.type === 'all') {
      const { data: parts } = await supabase
        .from('parts')
        .select('id, name, slug, affiliate_url, is_active');
      
      if (parts) {
        for (const part of parts) {
          const hasLink = part.affiliate_url && part.affiliate_url.trim() !== '';
          const status: 'active' | 'broken' | 'missing' = hasLink 
            ? (part.is_active ? 'active' : 'broken')
            : 'missing';
          
          let program: 'amazon' | 'ebay' | 'other' | null = null;
          if (hasLink) {
            if (part.affiliate_url?.includes('amazon.com') || part.affiliate_url?.includes('amzn.to')) {
              program = 'amazon';
            } else if (part.affiliate_url?.includes('ebay.com') || part.affiliate_url?.includes('ebay.us')) {
              program = 'ebay';
            } else {
              program = 'other';
            }
          }
          
          // Apply filters
          if (filters?.status && filters.status !== 'all' && status !== filters.status) continue;
          if (filters?.program && filters.program !== 'all' && program !== filters.program) continue;
          
          items.push({
            id: part.id,
            type: 'part',
            name: part.name,
            slug: part.slug,
            affiliate_url: part.affiliate_url,
            is_active: part.is_active,
            status,
            program,
          });
        }
      }
    }
    
    return success(items);
  } catch (err) {
    return handleError(err, 'getAffiliateLinkItems');
  }
}

/**
 * Check if an affiliate link is valid (basic check)
 */
export async function checkAffiliateLink(url: string): Promise<ActionResult<{ valid: boolean; status: number | null; error?: string }>> {
  try {
    if (!url || url.trim() === '') {
      return success({ valid: false, status: null, error: 'Empty URL' });
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return success({ valid: false, status: null, error: 'Invalid URL format' });
    }
    
    // Try to fetch (with timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });
      
      clearTimeout(timeout);
      
      return success({
        valid: response.ok,
        status: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return success({ valid: false, status: null, error: 'Request timeout' });
      }
      
      return success({ valid: false, status: null, error: fetchError instanceof Error ? fetchError.message : 'Unknown error' });
    }
  } catch (err) {
    return handleError(err, 'checkAffiliateLink');
  }
}
