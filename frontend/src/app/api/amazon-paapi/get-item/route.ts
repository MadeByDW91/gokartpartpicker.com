import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DefaultApi } from 'paapi5-nodejs-sdk';

/**
 * API Route for Amazon PA API GetItems operation
 * Fetches product details by ASIN
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const asin = searchParams.get('asin');

  if (!asin || !/^[A-Z0-9]{10}$/i.test(asin)) {
    return NextResponse.json({ error: 'Valid ASIN required' }, { status: 400 });
  }

  try {
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

    // Build get items request
    const getItemsRequest = {
      ItemIds: [asin.toUpperCase()],
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

    // Execute get items
    const response = await api.getItems(getItemsRequest);

    if (!response.ItemsResult || !response.ItemsResult.Items || response.ItemsResult.Items.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const item = response.ItemsResult.Items[0];
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

    const product = {
      asin: item.ASIN || asin.toUpperCase(),
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

    return NextResponse.json({ success: true, data: product });
  } catch (err: any) {
    console.error('[Amazon PA API GetItem] Error:', err);
    return NextResponse.json(
      { 
        error: err.message || 'Failed to fetch Amazon product',
        details: err.response?.data || err.body || null,
      },
      { status: 500 }
    );
  }
}
