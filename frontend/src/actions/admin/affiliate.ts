'use server';

/**
 * Affiliate Link Generator server actions
 * Handles affiliate link generation and bulk updates
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';

/**
 * Extract ASIN from Amazon URL or product ID
 */
function extractAmazonASIN(urlOrId: string): string | null {
  // If it's already an ASIN (10 characters, alphanumeric)
  if (/^[A-Z0-9]{10}$/i.test(urlOrId.trim())) {
    return urlOrId.trim().toUpperCase();
  }

  // Extract from URL
  const urlPatterns = [
    /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)\/.*[\/dp|gp\/product]\/?([A-Z0-9]{10})/i,
    /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)\/dp\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of urlPatterns) {
    const match = urlOrId.match(pattern);
    if (match && match[2]) {
      return match[2].toUpperCase();
    }
  }

  return null;
}

/**
 * Extract Item ID from eBay URL or product ID
 */
function extracteBayItemId(urlOrId: string): string | null {
  // If it's already an item ID (numeric)
  if (/^\d+$/.test(urlOrId.trim())) {
    return urlOrId.trim();
  }

  // Extract from URL
  const urlPattern = /ebay\.(com|ca|co\.uk|de|fr|it|es|com\.au)\/itm\/(\d+)/i;
  const match = urlOrId.match(urlPattern);
  
  if (match && match[2]) {
    return match[2];
  }

  return null;
}

/**
 * Generate Amazon affiliate link
 */
export async function generateAmazonLink(
  urlOrASIN: string
): Promise<ActionResult<{ affiliateLink: string }>> {
  try {
    await requireAdmin();

    const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || '';
    
    if (!tag) {
      return error('Amazon affiliate tag not configured. Set NEXT_PUBLIC_AMAZON_AFFILIATE_TAG environment variable.');
    }

    const asin = extractAmazonASIN(urlOrASIN);
    
    if (!asin) {
      return error('Could not extract Amazon ASIN from URL or product ID');
    }

    const affiliateLink = `https://www.amazon.com/dp/${asin}?tag=${tag}`;
    
    return success({ affiliateLink });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate link');
  }
}

/**
 * Generate eBay affiliate link
 */
export async function generateeBayLink(
  urlOrItemId: string
): Promise<ActionResult<{ affiliateLink: string }>> {
  try {
    await requireAdmin();

    const tag = process.env.NEXT_PUBLIC_EBAY_AFFILIATE_TAG || '';
    
    if (!tag) {
      return error('eBay affiliate tag not configured. Set NEXT_PUBLIC_EBAY_AFFILIATE_TAG environment variable.');
    }

    const itemId = extracteBayItemId(urlOrItemId);
    
    if (!itemId) {
      return error('Could not extract eBay Item ID from URL or product ID');
    }

    const affiliateLink = `https://www.ebay.com/itm/${itemId}?mkcid=1&mkrid=${tag}`;
    
    return success({ affiliateLink });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate link');
  }
}

/**
 * Generate affiliate link from URL (manual, adds tag parameter)
 */
export async function generateManualAffiliateLink(
  url: string,
  tag: string
): Promise<ActionResult<{ affiliateLink: string }>> {
  try {
    await requireAdmin();

    // Validate URL
    try {
      new URL(url);
    } catch {
      return error('Invalid URL format');
    }

    // Add tag parameter
    const separator = url.includes('?') ? '&' : '?';
    const affiliateLink = `${url}${separator}tag=${encodeURIComponent(tag)}`;
    
    return success({ affiliateLink });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate link');
  }
}

/**
 * Bulk update affiliate URLs for engines
 */
export async function bulkUpdateEngineAffiliateLinks(
  engineIds: string[],
  affiliateUrl: string
): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    if (!Array.isArray(engineIds) || engineIds.length === 0) {
      return error('No engines selected');
    }

    if (!affiliateUrl || !affiliateUrl.trim()) {
      return error('Affiliate URL is required');
    }

    const supabase = await createClient();
    
    const { error: dbError, count } = await supabase
      .from('engines')
      .update({ 
        affiliate_url: affiliateUrl.trim(),
        updated_at: new Date().toISOString(),
      })
      .in('id', engineIds);

    if (dbError) {
      return error('Failed to update affiliate links');
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success({ updated: count || engineIds.length });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Bulk update failed');
  }
}

/**
 * Bulk update affiliate URLs for parts
 */
export async function bulkUpdatePartAffiliateLinks(
  partIds: string[],
  affiliateUrl: string
): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    if (!Array.isArray(partIds) || partIds.length === 0) {
      return error('No parts selected');
    }

    if (!affiliateUrl || !affiliateUrl.trim()) {
      return error('Affiliate URL is required');
    }

    const supabase = await createClient();
    
    const { error: dbError, count } = await supabase
      .from('parts')
      .update({ 
        affiliate_url: affiliateUrl.trim(),
        updated_at: new Date().toISOString(),
      })
      .in('id', partIds);

    if (dbError) {
      return error('Failed to update affiliate links');
    }

    revalidatePath('/admin/parts');
    revalidatePath('/parts');

    return success({ updated: count || partIds.length });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Bulk update failed');
  }
}
