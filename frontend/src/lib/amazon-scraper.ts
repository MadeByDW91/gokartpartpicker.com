/**
 * Client-side Amazon product scraper
 * This runs in the browser to avoid CORS and bot detection issues
 */

export interface AmazonProductData {
  title: string | null;
  price: number | null;
  imageUrl: string | null;
  description: string | null;
  brand: string | null;
}

/**
 * Extract product data from Amazon page HTML
 */
function parseAmazonHTML(html: string): AmazonProductData {
  // Extract product title
  let title: string | null = null;
  const titleSelectors = [
    /<span[^>]*id="productTitle"[^>]*>([^<]+)<\/span>/i,
    /<h1[^>]*class="[^"]*product-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
    /<h1[^>]*data-automation-id="title"[^>]*>([^<]+)<\/h1>/i,
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    /<title>([^<]+)<\/title>/i,
  ];

  for (const selector of titleSelectors) {
    const match = html.match(selector);
    if (match && match[1]) {
      title = match[1].trim();
      // Clean up common Amazon suffixes
      title = title.replace(/\s*:\s*Amazon\.com.*$/i, '');
      title = title.replace(/\s*-\s*Amazon\.com.*$/i, '');
      title = title.replace(/\s*\([^)]*Amazon[^)]*\)/i, '');
      if (title.length > 5) {
        break;
      }
    }
  }

  // Extract price
  let price: number | null = null;
  const priceSelectors = [
    /<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)<\/span>/i,
    /<span[^>]*id="priceblock_[^"]*"[^>]*>\$?([\d,]+\.?\d*)<\/span>/i,
    /<span[^>]*class="[^"]*a-price[^"]*"[^>]*>\$?([\d,]+\.?\d*)<\/span>/i,
    /"price":\s*"([\d.]+)"/i,
    /"lowPrice":\s*"([\d.]+)"/i,
  ];

  for (const selector of priceSelectors) {
    const match = html.match(selector);
    if (match && match[1]) {
      const priceStr = match[1].replace(/,/g, '');
      const parsed = parseFloat(priceStr);
      if (!isNaN(parsed) && parsed > 0) {
        price = parsed;
        break;
      }
    }
  }

  // Extract image URL
  let imageUrl: string | null = null;
  const imageSelectors = [
    /<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i,
    /<img[^>]*data-old-src="([^"]+)"/i,
    /<img[^>]*data-src="([^"]+)"[^>]*class="[^"]*product-image[^"]*"/i,
    /"mainImage":\s*"([^"]+)"/i,
  ];

  for (const selector of imageSelectors) {
    const match = html.match(selector);
    if (match && match[1]) {
      imageUrl = match[1].trim();
      if (imageUrl.startsWith('http')) {
        break;
      }
    }
  }

  // Extract brand
  let brand: string | null = null;
  const brandSelectors = [
    /<a[^>]*id="brand"[^>]*>([^<]+)<\/a>/i,
    /<span[^>]*class="[^"]*brand[^"]*"[^>]*>([^<]+)<\/span>/i,
    /"brand":\s*"([^"]+)"/i,
    /<tr[^>]*>[\s\S]*?<th[^>]*>Brand[\s\S]*?<td[^>]*>([^<]+)<\/td>/i,
  ];

  for (const selector of brandSelectors) {
    const match = html.match(selector);
    if (match && match[1]) {
      brand = match[1].trim();
      if (brand.length > 0 && brand.length < 50) {
        break;
      }
    }
  }

  // Extract description
  let description: string | null = null;
  const descSelectors = [
    /<div[^>]*id="productDescription"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i,
    /<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([^<]+)<\/div>/i,
  ];

  for (const selector of descSelectors) {
    const match = html.match(selector);
    if (match && match[1]) {
      description = match[1].trim().substring(0, 500);
      if (description.length > 10) {
        break;
      }
    }
  }

  return {
    title,
    price,
    imageUrl,
    description,
    brand,
  };
}

/**
 * Fetch Amazon product data using client-side fetch
 * This works because it's coming from a real browser
 */
export async function fetchAmazonProductClient(asin: string): Promise<AmazonProductData> {
  const url = `https://www.amazon.com/dp/${asin}`;
  
  try {
    // Use CORS proxy or direct fetch (browser handles CORS)
    const response = await fetch(url, {
      method: 'GET',
      mode: 'no-cors', // This won't work for reading response
      // Try with CORS proxy instead
    });

    // If direct fetch fails, try CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
      throw new Error('Failed to fetch product page');
    }

    const data = await proxyResponse.json();
    const html = data.contents || '';

    return parseAmazonHTML(html);
  } catch (err) {
    console.error('[fetchAmazonProductClient] Error:', err);
    // Return fallback data
    return {
      title: null,
      price: null,
      imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
      description: null,
      brand: null,
    };
  }
}
