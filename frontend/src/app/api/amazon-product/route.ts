import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** ASIN format: 10 alphanumeric (e.g. B001234567) */
const ASIN_REGEX = /^[A-Z0-9]{10}$/;

/**
 * API Route for fetching Amazon product data
 * Requires authentication. Uses a CORS proxy to bypass Amazon's bot detection.
 * Rate limited by middleware (60/min per IP).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const asin = searchParams.get('asin');

  if (!asin) {
    return NextResponse.json(
      { error: 'ASIN parameter is required' },
      { status: 400 }
    );
  }

  const normalized = asin.trim().toUpperCase();
  if (!ASIN_REGEX.test(normalized)) {
    return NextResponse.json(
      { error: 'Invalid ASIN format; must be 10 alphanumeric characters' },
      { status: 400 }
    );
  }

  try {
    const amazonUrl = `https://www.amazon.com/dp/${normalized}`;
    
    // Option 1: Use CORS proxy service (free tier available)
    // Using allorigins.win as a free CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(amazonUrl)}`;
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status}`);
    }

    const data = await response.json();
    const html = data.contents || '';
    
    // Check if we got HTML content
    if (!html || html.length < 100) {
      console.warn(`[Amazon Product API] Received minimal or no HTML content for ASIN: ${normalized}`);
      // Still try to extract what we can, but this is likely a proxy issue
    }

    // Parse HTML to extract product data
    let title: string | null = null;
    
    // Try multiple title extraction methods with improved patterns
    const titleSelectors = [
      // Method 1: productTitle span (most reliable)
      /<span[^>]*id="productTitle"[^>]*>([^<]+)<\/span>/i,
      // Method 2: data-product-title attribute
      /data-product-title="([^"]+)"/i,
      // Method 3: h1 with product title classes
      /<h1[^>]*class="[^"]*product-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
      // Method 4: og:title meta tag
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      // Method 5: JSON-LD structured data
      /"name"\s*:\s*"([^"]+)"/i,
      // Method 6: title tag (last resort, needs cleaning)
      /<title>([^<]+)<\/title>/i,
      // Method 7: h1 a-size-large (common Amazon pattern)
      /<h1[^>]*class="[^"]*a-size-large[^"]*"[^>]*>([^<]+)<\/h1>/i,
      // Method 8: span with data-asin and title
      /<span[^>]*data-asin="[^"]*"[^>]*>([^<]+)<\/span>/i,
    ];

    for (const selector of titleSelectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        let extractedTitle = match[1]
          .trim()
          // Decode HTML entities
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          // Remove Amazon branding
          .replace(/\s*:\s*Amazon\.com.*$/i, '')
          .replace(/\s*-\s*Amazon\.com.*$/i, '')
          .replace(/\s*Amazon\.com.*$/i, '')
          .replace(/\s*Amazon.*$/i, '')
          // Clean up extra whitespace
          .replace(/\s+/g, ' ')
          .trim();
        
        // Only use if it's a reasonable length and not just "Amazon" or generic text
        if (extractedTitle.length > 10 && 
            !extractedTitle.match(/^(Amazon|Error|Page Not Found)/i) &&
            extractedTitle.length < 500) {
          title = extractedTitle;
          break;
        }
      }
    }
    
    // If still no title, try extracting from JSON-LD structured data
    if (!title) {
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/i);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.name && typeof jsonLd.name === 'string' && jsonLd.name.length > 10) {
            title = jsonLd.name
              .replace(/\s*:\s*Amazon\.com.*$/i, '')
              .replace(/\s*-\s*Amazon\.com.*$/i, '')
              .trim();
          }
        } catch (e) {
          // JSON parse failed, continue
        }
      }
    }

    // Extract price
    let price: number | null = null;
    const priceMatch = html.match(/"price":\s*"([\d.]+)"/i) || 
                      html.match(/<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)<\/span>/i);
    if (priceMatch && priceMatch[1]) {
      const priceStr = priceMatch[1].replace(/,/g, '');
      const parsed = parseFloat(priceStr);
      if (!isNaN(parsed) && parsed > 0) {
        price = parsed;
      }
    }

    // Extract image
    let imageUrl: string | null = null;
    const imageMatch = html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i) ||
                      html.match(/"mainImage":\s*"([^"]+)"/i);
    if (imageMatch && imageMatch[1]) {
      imageUrl = imageMatch[1].trim();
    }

    // Extract brand
    let brand: string | null = null;
    const brandSelectors = [
      /<a[^>]*id="brand"[^>]*>([^<]+)<\/a>/i,
      /"brand":\s*"([^"]+)"/i,
      /<span[^>]*class="[^"]*po-brand[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<tr[^>]*class="[^"]*po-brand[^"]*"[^>]*>[\s\S]*?<td[^>]*class="[^"]*a-span9[^"]*"[^>]*>([^<]+)<\/td>/i,
    ];
    
    for (const selector of brandSelectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        brand = match[1].trim();
        break;
      }
    }

    // Log extraction results for debugging
    console.log(`[Amazon Product API] ASIN: ${normalized}, Title: ${title ? `"${title.substring(0, 50)}..."` : 'NOT FOUND'}, Brand: ${brand || 'NOT FOUND'}`);

    return NextResponse.json({
      success: true,
      data: {
        title: title || null,
        price,
        imageUrl: imageUrl || `https://images-na.ssl-images-amazon.com/images/I/${normalized}.jpg`,
        brand: brand || null,
        description: null,
      },
    });
  } catch (error) {
    console.error('[Amazon Product API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
        data: {
          title: null,
          price: null,
          imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${normalized}.jpg`,
          brand: null,
          description: null,
        },
      },
      { status: 500 }
    );
  }
}
