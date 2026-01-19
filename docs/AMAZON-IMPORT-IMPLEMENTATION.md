# Amazon Import Implementation Guide

## Current Status

The Amazon import system is **partially implemented**. The UI and structure are complete, but the actual product data fetching needs to be implemented based on your preferred method.

## What's Already Built

✅ **UI Components:**
- `AmazonProductImporter.tsx` - Single product import interface
- Import page at `/admin/parts/import`
- Form auto-fill functionality
- Affiliate link generation
- Category detection logic

✅ **Server Actions:**
- `fetchAmazonProduct()` - Fetches single product
- `bulkFetchAmazonProducts()` - Fetches multiple products
- ASIN extraction from URLs
- Affiliate link generation

✅ **Integration:**
- Added to parts admin page
- "Import from Amazon" button
- Direct link to import page

## What Needs Implementation

### Option 1: Amazon Product Advertising API (Recommended)

**Pros:**
- Official Amazon API
- Reliable, structured data
- No scraping issues
- Rich product information

**Steps:**
1. Apply for Product Advertising API access at Amazon Associates Central
2. Get Access Key ID and Secret Access Key
3. Add to environment variables:
   ```bash
   AMAZON_ACCESS_KEY_ID=your-key
   AMAZON_SECRET_ACCESS_KEY=your-secret
   ```
4. Install API client library:
   ```bash
   npm install paapi5-nodejs-sdk
   ```
5. Implement `fetchProductFromAmazon()` in `amazon-import.ts`

**Example Implementation:**
```typescript
import { ProductAdvertisingAPIv1 } from 'paapi5-nodejs-sdk';

async function fetchProductFromAmazon(asin: string) {
  const client = new ProductAdvertisingAPIv1({
    accessKey: process.env.AMAZON_ACCESS_KEY_ID!,
    secretKey: process.env.AMAZON_SECRET_ACCESS_KEY!,
    host: 'webservices.amazon.com',
    region: 'us-east-1',
  });

  const request = {
    Keywords: asin,
    SearchIndex: 'All',
    ItemCount: 1,
    PartnerType: 'Associates',
    PartnerTag: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG!,
  };

  const response = await client.searchItems(request);
  // Parse response and return product data
}
```

### Option 2: Web Scraping (Faster to Implement)

**Pros:**
- No API approval needed
- Works immediately
- Can extract rich data

**Cons:**
- May violate Amazon ToS
- Less reliable (HTML changes)
- Requires HTML parsing

**Implementation:**
Use a library like `cheerio` or `puppeteer`:

```typescript
import * as cheerio from 'cheerio';

async function fetchProductFromAmazon(asin: string) {
  const url = `https://www.amazon.com/dp/${asin}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0...', // Amazon requires user agent
    },
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  return {
    title: $('#productTitle').text().trim(),
    price: parseFloat($('#priceblock_ourprice').text().replace('$', '')),
    imageUrl: $('#landingImage').attr('src'),
    description: $('#feature-bullets').text(),
    // ... extract more data
  };
}
```

**Note:** Amazon may block scraping. Consider using a proxy service or headless browser.

### Option 3: Third-Party Service

**Services:**
- RapidAPI Amazon Scraper
- ScraperAPI
- Bright Data (formerly Luminati)

**Pros:**
- Handles anti-scraping measures
- Reliable
- Easy to implement

**Cons:**
- Costs money
- Dependency on third party

## Implementation Priority

1. **MVP (Quick Start):**
   - Use web scraping with `cheerio`
   - Extract: title, price, image, basic description
   - Manual category selection (no auto-detect)

2. **Enhanced:**
   - Add Product Advertising API support
   - Better category detection
   - Extract specifications table
   - Multiple image support

3. **Advanced:**
   - Bulk import with progress tracking
   - Duplicate detection by ASIN
   - Price monitoring
   - Auto-update prices

## Testing

Once implemented, test with these products:
- Go-kart clutch: Search Amazon for "MaxTorque clutch"
- Chain: Search for "#35 chain go kart"
- Sprocket: Search for "go kart sprocket"

## Next Steps

1. Choose implementation method (API vs scraping)
2. Implement `fetchProductFromAmazon()` function
3. Test with real Amazon products
4. Enhance category detection
5. Add bulk import UI

## Files to Update

- `frontend/src/actions/admin/amazon-import.ts` - Implement `fetchProductFromAmazon()`
- Add environment variables for API keys (if using API)
- Install required npm packages

---

**Status:** UI Complete, Data Fetching Needs Implementation  
**Priority:** High - This will significantly speed up product entry
