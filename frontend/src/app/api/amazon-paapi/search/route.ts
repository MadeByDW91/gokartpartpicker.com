import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DefaultApi } from 'paapi5-nodejs-sdk';

/**
 * API Route for Amazon PA API SearchItems operation
 * Handles category-based product search
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { keywords, searchIndex = 'Automotive', itemCount = 20, minPrice, maxPrice } = body;

    if (!keywords) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
    }

    // Get PA API credentials
    const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY;
    const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY;
    const partnerTag = process.env.AMAZON_PAAPI_PARTNER_TAG || process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;
    const marketplace = process.env.AMAZON_PAAPI_MARKETPLACE || 'www.amazon.com';
    const host = process.env.AMAZON_PAAPI_HOST || 'webservices.amazon.com';
    const region = process.env.AMAZON_PAAPI_REGION || 'us-east-1';

    if (!accessKey || !secretKey || !partnerTag) {
      return NextResponse.json(
        { error: 'Amazon PA API credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize PA API client
    const api = new DefaultApi();
    api.setAccessKey(accessKey);
    api.setSecretKey(secretKey);
    api.setPartnerTag(partnerTag);
    api.setHost(host);
    api.setRegion(region);
    api.setMarketplace(marketplace);

    // Build search request
    const searchItemsRequest: any = {
      Keywords: keywords,
      SearchIndex: searchIndex,
      ItemCount: itemCount,
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.Classifications',
        'ItemInfo.Features',
        'ItemInfo.ExternalIds',
        'ItemInfo.Images',
        'ItemInfo.Offers',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price',
        'Offers.Listings.Availability',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count',
      ],
    };

    // Add price filters if provided
    if (minPrice !== undefined) {
      searchItemsRequest.MinPrice = Math.round(minPrice * 100); // Convert to cents
    }
    if (maxPrice !== undefined) {
      searchItemsRequest.MaxPrice = Math.round(maxPrice * 100);
    }

    // Execute search
    const response = await api.searchItems(searchItemsRequest);

    if (!response.SearchResult || !response.SearchResult.Items) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Transform response to our format
    const products = response.SearchResult.Items.map((item: any) => {
      const itemInfo = item.ItemInfo || {};
      const offers = item.Offers || {};
      const listings = offers.Listings?.[0] || {};
      const price = listings.Price || {};
      const images = itemInfo.Images || {};
      const primaryImage = images.Primary || {};
      const byLine = itemInfo.ByLineInfo || {};
      const features = itemInfo.Features || {};
      const customerReviews = item.CustomerReviews || {};
      const starRating = customerReviews.StarRating || {};
      const reviewCount = customerReviews.Count || {};

      return {
        asin: item.ASIN || '',
        title: itemInfo.Title?.DisplayValue || '',
        price: price.Amount ? price.Amount / 100 : null,
        currency: price.Currency || 'USD',
        imageUrl: primaryImage.Large?.URL || primaryImage.Medium?.URL || null,
        brand: byLine.Brand?.DisplayValue || null,
        description: itemInfo.Features?.DisplayValues?.join(' ') || null,
        features: features.DisplayValues || [],
        specifications: {},
        availability: listings.Availability?.Message || 'Unknown',
        customerRating: starRating.Value ? parseFloat(starRating.Value) : null,
        reviewCount: reviewCount ? parseInt(reviewCount) : null,
      };
    });

    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    console.error('[Amazon PA API Search] Error:', err);
    return NextResponse.json(
      { 
        error: err.message || 'Failed to search Amazon products',
        details: err.response?.data || err.body || null,
      },
      { status: 500 }
    );
  }
}
