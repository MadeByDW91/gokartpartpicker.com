'use server';

/**
 * Amazon Product Import Server Actions
 * Fetches product data from Amazon and prepares it for part creation
 */

import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';

/**
 * Extract ASIN from Amazon URL
 */
function extractASIN(urlOrASIN: string): string | null {
  // If it's already an ASIN (10 characters, alphanumeric)
  if (/^[A-Z0-9]{10}$/i.test(urlOrASIN.trim())) {
    return urlOrASIN.trim().toUpperCase();
  }

  // Extract from URL patterns
  const urlPatterns = [
    /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)\/.*[\/dp|gp\/product]\/?([A-Z0-9]{10})/i,
    /amazon\.(com|ca|co\.uk|de|fr|it|es|jp|in|com\.au|com\.br)\/dp\/([A-Z0-9]{10})/i,
    /\/dp\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of urlPatterns) {
    const match = urlOrASIN.match(pattern);
    if (match && match[2]) {
      return match[2].toUpperCase();
    }
  }

  return null;
}

/**
 * Generate Amazon affiliate link from ASIN
 */
function generateAffiliateLink(asin: string): string {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || '';
  return `https://www.amazon.com/dp/${asin}${tag ? `?tag=${tag}` : ''}`;
}

/**
 * Fetch product data from Amazon using API route (which uses CORS proxy)
 * This avoids direct server-side scraping which Amazon blocks
 */
async function fetchProductFromAmazon(asin: string): Promise<{
  title: string | null;
  price: number | null;
  imageUrl: string | null;
  description: string | null;
  brand: string | null;
  specifications: Record<string, any>;
}> {
  try {
    // Use our API route which handles CORS proxy
    // For server actions, we construct the URL from environment or use localhost for dev
    // In server actions, we need to use the full URL
    // Determine the base URL for API calls
    // In production, use NEXT_PUBLIC_SITE_URL or VERCEL_URL
    // In development, detect the port from environment or default to 3000
    const devPort = process.env.PORT || '3000';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                    `http://localhost:${devPort}`; // Use detected or default port 3000
    const apiUrl = `${baseUrl}/api/amazon-product?asin=${asin}`;
    
    console.log(`[fetchProductFromAmazon] Fetching from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.warn(`[fetchProductFromAmazon] API route returned ${response.status} for ${asin}`);
      // Fallback to basic data
      return {
        title: null,
        price: null,
        imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
        description: null,
        brand: null,
        specifications: {},
      };
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        title: result.data.title,
        price: result.data.price,
        imageUrl: result.data.imageUrl,
        description: result.data.description || null,
        brand: result.data.brand,
        specifications: {},
      };
    }

    // If API route failed, return fallback
    return {
      title: null,
      price: null,
      imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
      description: null,
      brand: null,
      specifications: {},
    };
  } catch (err) {
    console.error('[fetchProductFromAmazon] Error:', err);
    // Return fallback data instead of throwing
    return {
      title: null,
      price: null,
      imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
      description: null,
      brand: null,
      specifications: {},
    };
  }
}


/**
 * Detect part category from product title/description
 */
function detectCategory(title: string, description: string): string | null {
  const text = `${title} ${description}`.toLowerCase();
  
  // Category keyword mapping
  const categoryKeywords: Record<string, string[]> = {
    clutch: ['clutch', 'centrifugal', 'max torque', 'hilliard'],
    torque_converter: ['torque converter', 'tav', 'comet'],
    chain: ['chain', '#35', '#40', '#41', '#50'],
    sprocket: ['sprocket', 'sprocket'],
    axle: ['axle', 'live axle'],
    wheel: ['wheel', 'rim'],
    tire: ['tire', 'tyre'],
    brake: ['brake', 'disc brake', 'brake kit'],
    throttle: ['throttle', 'throttle cable', 'throttle kit'],
    exhaust: ['exhaust', 'muffler', 'header'],
    air_filter: ['air filter', 'air cleaner', 'filter'],
    carburetor: ['carburetor', 'carb', 'carburettor'],
    ignition: ['ignition', 'coil', 'spark'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return null;
}

/**
 * Fetch a single Amazon product and prepare it for part creation
 */
export async function fetchAmazonProduct(
  urlOrASIN: string
): Promise<ActionResult<{
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  description: string | null;
  brand: string | null;
  category: string | null;
  affiliateUrl: string;
  specifications: Record<string, any>;
}>> {
  try {
    await requireAdmin();

    const asin = extractASIN(urlOrASIN);
    
    if (!asin) {
      return error('Could not extract Amazon ASIN from URL. Please provide a valid Amazon product URL or ASIN.');
    }

    // Fetch product data
    const productData = await fetchProductFromAmazon(asin);

    // Generate affiliate link
    const affiliateUrl = generateAffiliateLink(asin);

    // Detect category
    const category = productData.title 
      ? detectCategory(productData.title, productData.description || '')
      : null;

    return success({
      asin,
      name: productData.title || `Amazon Product ${asin}`,
      price: productData.price,
      imageUrl: productData.imageUrl,
      description: productData.description,
      brand: productData.brand,
      category: category as any,
      affiliateUrl,
      specifications: productData.specifications,
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch Amazon product');
  }
}

/**
 * Fetch multiple Amazon products (bulk import)
 */
export async function bulkFetchAmazonProducts(
  urlsOrASINs: string[]
): Promise<ActionResult<Array<{
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  description: string | null;
  brand: string | null;
  category: string | null;
  affiliateUrl: string;
  specifications: Record<string, any>;
  error?: string;
}>>> {
  try {
    await requireAdmin();

    if (!Array.isArray(urlsOrASINs) || urlsOrASINs.length === 0) {
      return error('No URLs or ASINs provided');
    }

    if (urlsOrASINs.length > 50) {
      return error('Cannot process more than 50 products at once');
    }

    const results = await Promise.allSettled(
      urlsOrASINs.map(url => fetchAmazonProduct(url))
    );

    const products = results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        return result.value.data;
      } else {
        let errorMessage = 'Unknown error';
        if (result.status === 'rejected') {
          errorMessage = result.reason?.message || 'Request failed';
        } else if (result.status === 'fulfilled' && !result.value.success) {
          errorMessage = 'error' in result.value ? result.value.error : 'Failed to fetch product';
        }
        
        return {
          asin: extractASIN(urlsOrASINs[index]) || 'UNKNOWN',
          name: `Failed to fetch: ${urlsOrASINs[index]}`,
          price: null,
          imageUrl: null,
          description: null,
          brand: null,
          category: null,
          affiliateUrl: '',
          specifications: {},
          error: errorMessage,
        };
      }
    });

    return success(products);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Bulk fetch failed');
  }
}
