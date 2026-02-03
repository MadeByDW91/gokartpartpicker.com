/**
 * Amazon Product Advertising API (PA-API 5.0) Client
 * Handles product search and data fetching from Amazon
 * Uses API routes to avoid SDK issues in server actions
 */

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

export interface PAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  marketplace: string;
  host: string;
}

/**
 * Search Amazon products by keywords
 * Uses API route to handle PA API calls
 */
export async function searchAmazonProducts(
  keywords: string,
  searchIndex: string = 'Automotive',
  itemCount: number = 20,
  minPrice?: number,
  maxPrice?: number
): Promise<AmazonProduct[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
    const apiUrl = `${baseUrl}/api/amazon-paapi/search`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords,
        searchIndex,
        itemCount,
        minPrice,
        maxPrice,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search Amazon products');
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('[searchAmazonProducts] Error:', error);
    throw error;
  }
}

/**
 * Get product details by ASIN
 * Uses API route to handle PA API calls
 */
export async function getAmazonProduct(asin: string): Promise<AmazonProduct | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
    const apiUrl = `${baseUrl}/api/amazon-paapi/get-item?asin=${encodeURIComponent(asin)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch Amazon product');
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('[getAmazonProduct] Error:', error);
    throw error;
  }
}

/**
 * Category-specific search keywords
 */
export const categorySearchKeywords: Record<string, string[]> = {
  clutch: [
    'go kart clutch',
    'centrifugal clutch',
    'max torque clutch',
    'predator 212 clutch',
    'small engine clutch',
    '3/4 inch clutch',
  ],
  torque_converter: [
    'go kart torque converter',
    'tav torque converter',
    'comet torque converter',
    'cvt go kart',
  ],
  chain: [
    'go kart chain',
    '#35 chain',
    'drive chain',
    'motorcycle chain 35',
    'roller chain 35',
  ],
  sprocket: [
    'go kart sprocket',
    '#35 sprocket',
    'sprocket',
    'drive sprocket',
  ],
  exhaust: [
    'go kart exhaust',
    'predator 212 exhaust',
    'small engine header',
    'go kart muffler',
  ],
  air_filter: [
    'go kart air filter',
    'predator 212 air filter',
    'small engine air filter',
  ],
  carburetor: [
    'go kart carburetor',
    'predator 212 carburetor',
    'small engine carburetor',
  ],
  ignition: [
    'go kart ignition',
    'predator 212 ignition',
    'small engine coil',
  ],
  brake: [
    'go kart brake',
    'disc brake go kart',
    'hydraulic brake go kart',
  ],
  wheel: [
    'go kart wheel',
    'go kart rim',
    'racing wheel go kart',
  ],
  tire: [
    'go kart tire',
    'racing tire go kart',
  ],
  axle: [
    'go kart axle',
    'live axle go kart',
  ],
  throttle: [
    'go kart throttle',
    'throttle cable go kart',
  ],
  pedals: [
    'go kart pedals',
    'go kart gas pedal',
    'go kart brake pedal',
    'pedal set go kart',
  ],
  frame: [
    'go kart frame',
    'go kart chassis',
  ],
  // EV categories
  battery: [
    'lithium battery go kart',
    'ebike battery',
    'electric go kart battery',
  ],
  motor_controller: [
    'go kart motor controller',
    'ebike controller',
    'electric motor controller',
  ],
  charger: [
    'lithium battery charger',
    'ebike charger',
  ],
};

/**
 * Get search keywords for a category
 */
export function getSearchKeywordsForCategory(category: string): string[] {
  return categorySearchKeywords[category] || [`go kart ${category}`];
}
