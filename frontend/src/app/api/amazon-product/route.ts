import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for fetching Amazon product data
 * This uses a CORS proxy to bypass Amazon's bot detection
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const asin = searchParams.get('asin');

  if (!asin) {
    return NextResponse.json(
      { error: 'ASIN parameter is required' },
      { status: 400 }
    );
  }

  try {
    const amazonUrl = `https://www.amazon.com/dp/${asin}`;
    
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

    // Parse HTML to extract product data
    let title: string | null = null;
    const titleSelectors = [
      /<span[^>]*id="productTitle"[^>]*>([^<]+)<\/span>/i,
      /<h1[^>]*class="[^"]*product-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      /<title>([^<]+)<\/title>/i,
    ];

    for (const selector of titleSelectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        const extractedTitle = match[1].trim();
        const cleanedTitle = extractedTitle
          .replace(/\s*:\s*Amazon\.com.*$/i, '')
          .replace(/\s*-\s*Amazon\.com.*$/i, '');
        if (cleanedTitle.length > 5) {
          title = cleanedTitle;
          break;
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
    const brandMatch = html.match(/<a[^>]*id="brand"[^>]*>([^<]+)<\/a>/i) ||
                      html.match(/"brand":\s*"([^"]+)"/i);
    if (brandMatch && brandMatch[1]) {
      brand = brandMatch[1].trim();
    }

    return NextResponse.json({
      success: true,
      data: {
        title: title || null,
        price,
        imageUrl: imageUrl || `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
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
          imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
          brand: null,
          description: null,
        },
      },
      { status: 500 }
    );
  }
}
