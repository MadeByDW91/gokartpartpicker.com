'use server';

/**
 * Amazon Category Search Server Actions
 * Uses PA API to search Amazon by category and integrates with Product Ingestion
 */

import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import {
  getSearchKeywordsForCategory,
} from '@/lib/amazon-paapi';
import { headers } from 'next/headers';
import type { PartCategory } from '@/types/database';
import {
  createImportJob,
  ingestJSON,
  generatePartProposals,
  generateCompatibilityProposals,
} from './ingestion';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/**
 * Extract ASIN from Amazon URL or SiteStripe link
 */
function extractASIN(urlOrASIN: string): string | null {
  // If it's already an ASIN (10 characters, alphanumeric)
  if (/^[A-Z0-9]{10}$/i.test(urlOrASIN.trim())) {
    return urlOrASIN.trim().toUpperCase();
  }

  // Extract from URL patterns (including SiteStripe links)
  const urlPatterns = [
    /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)\/.*[\/dp|gp\/product]\/?([A-Z0-9]{10})/i,
    /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)\/dp\/([A-Z0-9]{10})/i,
    /\/dp\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of urlPatterns) {
    const match = urlOrASIN.match(pattern);
    if (match && (match[2] || match[1])) {
      return (match[2] || match[1]).toUpperCase();
    }
  }

  return null;
}

/**
 * Extract affiliate tag from SiteStripe link
 */
function extractAffiliateTag(url: string): string | null {
  const match = url.match(/[?&]tag=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Generate affiliate link from ASIN
 */
function generateAffiliateLink(asin: string, tag?: string): string {
  const affiliateTag = tag || process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || '';
  return `https://www.amazon.com/dp/${asin}${affiliateTag ? `?tag=${affiliateTag}` : ''}`;
}

export interface AmazonProduct {
  asin: string;
  title: string;
  price: number | null;
  currency: string;
  imageUrl: string | null;
  brand: string | null;
  description: string | null;
  features: string[];
  specifications: Record<string, string>;
  availability: string;
  customerRating: number | null;
  reviewCount: number | null;
}

/**
 * Search Amazon products by category
 */
export async function searchAmazonByCategory(
  category: PartCategory,
  options?: {
    maxResults?: number;
    minPrice?: number;
    maxPrice?: number;
  }
): Promise<ActionResult<AmazonProduct[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const keywords = getSearchKeywordsForCategory(category);
    const primaryKeyword = keywords[0] || `go kart ${category}`;
    const maxResults = options?.maxResults || 20;

    // Call API route
    const h = await headers();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
    const apiUrl = `${baseUrl}/api/amazon-paapi/search`;
    const cookie = h.get('cookie');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify({
        keywords: primaryKeyword,
        searchIndex: 'Automotive',
        itemCount: maxResults,
        minPrice: options?.minPrice,
        maxPrice: options?.maxPrice,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return error(errorData.error || 'Failed to search Amazon products');
    }

    const result = await response.json();
    return success(result.success ? result.data : []);
  } catch (err) {
    console.error('[searchAmazonByCategory] Error:', err);
    return error(err instanceof Error ? err.message : 'Failed to search Amazon products');
  }
}

/**
 * Get Amazon product by ASIN or URL
 */
export async function getAmazonProductByASIN(
  asinOrUrl: string
): Promise<ActionResult<AmazonProduct & { affiliateLink: string; siteStripeTag?: string }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const asin = extractASIN(asinOrUrl);
    if (!asin) {
      return error('Could not extract ASIN from URL or product ID');
    }

    // Check if it's a SiteStripe link and extract tag
    const siteStripeTag = extractAffiliateTag(asinOrUrl);

    // Call API route - try PA API first, fallback to CORS proxy route
    const h = await headers();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
    const cookie = h.get('cookie');

    let product: AmazonProduct | null = null;
    let apiError: string | null = null;

    // Try PA API first (if credentials are configured)
    const paApiUrl = `${baseUrl}/api/amazon-paapi/get-item?asin=${encodeURIComponent(asin)}`;
    try {
      const paApiResponse = await fetch(paApiUrl, {
        method: 'GET',
        headers: {
          ...(cookie ? { Cookie: cookie } : {}),
        },
      });

      if (paApiResponse.ok) {
        const paApiResult = await paApiResponse.json();
        if (paApiResult.success && paApiResult.data) {
          product = paApiResult.data;
        }
      } else if (paApiResponse.status === 500) {
        // PA API not configured, try fallback
        try {
          const errorData = await paApiResponse.json();
          if (errorData.error?.includes('credentials not configured')) {
            console.log('[getAmazonProductByASIN] PA API not configured, using fallback');
            apiError = null; // Clear error, will try fallback
          } else {
            apiError = errorData.error || 'Failed to fetch from PA API';
          }
        } catch {
          // If JSON parse fails, try fallback anyway
          apiError = null;
        }
      } else {
        try {
          const errorData = await paApiResponse.json();
          apiError = errorData.error || 'Failed to fetch from PA API';
        } catch {
          apiError = 'Failed to fetch from PA API';
        }
      }
    } catch (err) {
      console.warn('[getAmazonProductByASIN] PA API request failed, trying fallback:', err);
      apiError = null; // Will try fallback
    }

    // Fallback to CORS proxy route if PA API failed or not configured
    if (!product) {
      const fallbackUrl = `${baseUrl}/api/amazon-product?asin=${encodeURIComponent(asin)}`;
      try {
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            ...(cookie ? { Cookie: cookie } : {}),
          },
        });

        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          if (fallbackResult.success && fallbackResult.data) {
            // Convert fallback format to AmazonProduct format
            product = {
              asin: asin.toUpperCase(),
              title: fallbackResult.data.title || '',
              price: fallbackResult.data.price,
              currency: 'USD',
              imageUrl: fallbackResult.data.imageUrl,
              brand: fallbackResult.data.brand,
              description: fallbackResult.data.description,
              features: [],
              specifications: {},
              availability: 'In Stock',
              customerRating: null,
              reviewCount: null,
            };
          }
        } else {
          try {
            const errorData = await fallbackResponse.json();
            apiError = errorData.error || 'Failed to fetch product';
          } catch {
            apiError = `Failed to fetch product (${fallbackResponse.status})`;
          }
        }
      } catch (err) {
        console.error('[getAmazonProductByASIN] Fallback also failed:', err);
        apiError = err instanceof Error ? err.message : 'Failed to fetch Amazon product';
      }
    }

    if (!product) {
      return error(apiError || 'Product not found on Amazon');
    }

    // Generate affiliate link (use SiteStripe tag if provided, otherwise use configured tag)
    const affiliateLink = generateAffiliateLink(asin, siteStripeTag || undefined);

    return success({
      ...product,
      affiliateLink,
      siteStripeTag: siteStripeTag || undefined,
    });
  } catch (err) {
    console.error('[getAmazonProductByASIN] Error:', err);
    return error(err instanceof Error ? err.message : 'Failed to fetch Amazon product');
  }
}

/**
 * Create import job from Amazon category search
 */
export async function createAmazonCategoryImport(
  category: PartCategory,
  productASINs: string[],
  options?: {
    maxResults?: number;
    minPrice?: number;
    maxPrice?: number;
    engineId?: string;
    motorId?: string;
  }
): Promise<ActionResult<{ importJobId: string; proposalsCreated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    // Create import job
    const jobResult = await createImportJob(
      `Amazon ${category} Import - ${new Date().toLocaleDateString()}`,
      'amazon_category'
    );

    if (!jobResult.success) {
      return jobResult;
    }

    const importJobId = jobResult.data.id;

    // Fetch product data for each ASIN
    const products: Array<Record<string, unknown>> = [];
    for (const asin of productASINs) {
      try {
        const productResult = await getAmazonProductByASIN(asin);
        if (productResult.success && productResult.data) {
          const product = productResult.data;
          const slug = slugify(product.title);

          products.push({
            asin: product.asin,
            name: product.title,
            slug,
            category,
            brand: product.brand || null,
            price: product.price,
            image_url: product.imageUrl,
            description: product.description,
            specifications: {
              features: product.features,
              availability: product.availability,
              rating: product.customerRating,
              reviewCount: product.reviewCount,
            },
            affiliate_url: product.affiliateLink,
            amazon_url: `https://www.amazon.com/dp/${product.asin}`,
          });
        }
      } catch (err) {
        console.error(`[createAmazonCategoryImport] Error fetching ${asin}:`, err);
        // Continue with other products
      }
    }

    if (products.length === 0) {
      return error('No products could be fetched');
    }

    // Ingest as JSON
    const ingestResult = await ingestJSON(products, importJobId);
    if (!ingestResult.success) {
      return ingestResult;
    }

    // Generate proposals
    const proposalsResult = await generatePartProposals(importJobId);
    if (!proposalsResult.success) {
      return proposalsResult;
    }

    // Auto-generate compatibility proposals if engine is specified
    if (options?.engineId) {
      const supabase = await createClient();
      
      // Get all proposals for this job
      const { data: proposals } = await supabase
        .from('part_proposals')
        .select('id, proposed_data')
        .eq('import_job_id', importJobId);

      if (proposals && proposals.length > 0) {
        // Get engine specs for smart compatibility
        const { data: engine } = await supabase
          .from('engines')
          .select('id, shaft_diameter')
          .eq('id', options.engineId)
          .single();

        if (engine) {
          const compatibilityProposals = proposals.map((proposal: { id: string; proposed_data: unknown }) => {
            const proposedData = proposal.proposed_data as Record<string, unknown>;
            const partCategory = String(proposedData.category || '');
            
            // Smart compatibility detection
            let compatibilityLevel: 'direct_fit' | 'requires_modification' | 'adapter_required' = 'direct_fit';
            let notes: string | null = null;
            
            // For clutches, check shaft diameter match
            if (partCategory === 'clutch' && proposedData.shaft_diameter) {
              const partShaft = Number(proposedData.shaft_diameter);
              const engineShaft = Number(engine.shaft_diameter);
              if (Math.abs(partShaft - engineShaft) > 0.01) {
                compatibilityLevel = 'requires_modification';
                notes = `Shaft diameter mismatch: part ${partShaft}" vs engine ${engineShaft}"`;
              }
            }

            return {
              part_proposal_id: proposal.id,
              engine_id: options.engineId!,
              compatibility_level: compatibilityLevel,
              notes,
              status: 'proposed' as const,
            };
          });

          await supabase
            .from('compatibility_proposals')
            .insert(compatibilityProposals);
        }
      }
    }

    return success({
      importJobId,
      proposalsCreated: proposalsResult.data.generated,
    });
  } catch (err) {
    console.error('[createAmazonCategoryImport] Error:', err);
    return error(err instanceof Error ? err.message : 'Failed to create Amazon import');
  }
}

/**
 * Import Amazon products from URLs/ASINs (supports SiteStripe links)
 */
export async function importAmazonProductsFromLinks(
  urlsOrASINs: string[],
  category?: PartCategory,
  options?: {
    engineId?: string;
    motorId?: string;
  }
): Promise<ActionResult<{ importJobId: string; proposalsCreated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    // Create import job
    const jobResult = await createImportJob(
      `Amazon Link Import - ${new Date().toLocaleDateString()}`,
      'amazon_link'
    );

    if (!jobResult.success) {
      return jobResult;
    }

    const importJobId = jobResult.data.id;

    // Fetch product data for each URL/ASIN
    const products: Array<Record<string, unknown>> = [];
    for (const urlOrASIN of urlsOrASINs) {
      try {
        const productResult = await getAmazonProductByASIN(urlOrASIN);
        if (productResult.success && productResult.data) {
          const product = productResult.data;
          const slug = slugify(product.title);
          
          // Auto-detect category if not provided
          let detectedCategory = category;
          if (!detectedCategory) {
            // Simple category detection from title
            const titleLower = product.title.toLowerCase();
            if (titleLower.includes('clutch')) detectedCategory = 'clutch';
            else if (titleLower.includes('chain')) detectedCategory = 'chain';
            else if (titleLower.includes('sprocket')) detectedCategory = 'sprocket';
            else if (titleLower.includes('exhaust') || titleLower.includes('header')) detectedCategory = 'exhaust';
            else if (titleLower.includes('air filter')) detectedCategory = 'air_filter';
            else if (titleLower.includes('carburetor') || titleLower.includes('carb')) detectedCategory = 'carburetor';
            else detectedCategory = 'other';
          }

          products.push({
            asin: product.asin,
            name: product.title,
            slug,
            category: detectedCategory,
            brand: product.brand || null,
            price: product.price,
            image_url: product.imageUrl,
            description: product.description,
            specifications: {
              features: product.features,
              availability: product.availability,
              rating: product.customerRating,
              reviewCount: product.reviewCount,
            },
            affiliate_url: product.affiliateLink,
            amazon_url: `https://www.amazon.com/dp/${product.asin}`,
            site_stripe_tag: product.siteStripeTag || null,
          });
        }
      } catch (err) {
        console.error(`[importAmazonProductsFromLinks] Error fetching ${urlOrASIN}:`, err);
        // Continue with other products
      }
    }

    if (products.length === 0) {
      return error('No products could be fetched');
    }

    // Ingest as JSON
    const ingestResult = await ingestJSON(products, importJobId);
    if (!ingestResult.success) {
      return ingestResult;
    }

    // Generate proposals
    const proposalsResult = await generatePartProposals(importJobId);
    if (!proposalsResult.success) {
      return proposalsResult;
    }

    // Auto-generate compatibility proposals if engine is specified
    if (options?.engineId) {
      const supabase = await createClient();
      
      const { data: proposals } = await supabase
        .from('part_proposals')
        .select('id, proposed_data')
        .eq('import_job_id', importJobId);

      if (proposals && proposals.length > 0) {
        const { data: engine } = await supabase
          .from('engines')
          .select('id, shaft_diameter')
          .eq('id', options.engineId)
          .single();

        if (engine) {
          const compatibilityProposals = proposals.map((proposal: { id: string; proposed_data: unknown }) => {
            const proposedData = proposal.proposed_data as Record<string, unknown>;
            const partCategory = String(proposedData.category || '');
            
            let compatibilityLevel: 'direct_fit' | 'requires_modification' | 'adapter_required' = 'direct_fit';
            let notes: string | null = null;
            
            if (partCategory === 'clutch' && proposedData.shaft_diameter) {
              const partShaft = Number(proposedData.shaft_diameter);
              const engineShaft = Number(engine.shaft_diameter);
              if (Math.abs(partShaft - engineShaft) > 0.01) {
                compatibilityLevel = 'requires_modification';
                notes = `Shaft diameter mismatch: part ${partShaft}" vs engine ${engineShaft}"`;
              }
            }

            return {
              part_proposal_id: proposal.id,
              engine_id: options.engineId!,
              compatibility_level: compatibilityLevel,
              notes,
              status: 'proposed' as const,
            };
          });

          await supabase
            .from('compatibility_proposals')
            .insert(compatibilityProposals);
        }
      }
    }

    // Auto-generate compatibility proposals if motor is specified
    if (options?.motorId) {
      const supabase = await createClient();
      
      const { data: proposals } = await supabase
        .from('part_proposals')
        .select('id, proposed_data')
        .eq('import_job_id', importJobId);

      if (proposals && proposals.length > 0) {
        const compatibilityProposals = proposals.map((proposal: { id: string; proposed_data: unknown }) => {
          return {
            part_proposal_id: proposal.id,
            motor_id: options.motorId!,
            compatibility_level: 'direct_fit' as const,
            notes: null,
            status: 'proposed' as const,
          };
        });

        await supabase
          .from('compatibility_proposals')
          .insert(compatibilityProposals);
      }
    }

    return success({
      importJobId,
      proposalsCreated: proposalsResult.data.generated,
    });
  } catch (err) {
    console.error('[importAmazonProductsFromLinks] Error:', err);
    return error(err instanceof Error ? err.message : 'Failed to import Amazon products');
  }
}
