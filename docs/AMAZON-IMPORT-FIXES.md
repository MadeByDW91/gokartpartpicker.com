# Amazon Product Import - Fixes & Solutions

## Problem
Amazon blocks direct server-side fetch requests, so product names aren't auto-populating.

## Solution Implemented

### ✅ Option 1: API Route with CORS Proxy (Current Implementation)

**How it works:**
1. Server action calls our API route (`/api/amazon-product`)
2. API route uses a CORS proxy service (allorigins.win) to fetch Amazon
3. API route parses HTML and extracts product data
4. Returns structured data to the server action

**Files:**
- `frontend/src/app/api/amazon-product/route.ts` - API route handler
- `frontend/src/actions/admin/amazon-import.ts` - Updated to use API route

**Pros:**
- Works immediately
- No API keys needed
- Free tier available

**Cons:**
- CORS proxy may have rate limits
- Less reliable than official API

**Status:** ✅ Implemented

---

## Alternative Solutions

### Option 2: Amazon Product Advertising API (Recommended for Production)

**Steps:**
1. Apply for Product Advertising API at [Amazon Associates Central](https://affiliate-program.amazon.com/)
2. Get Access Key ID and Secret Access Key
3. Add to `.env.local`:
   ```bash
   AMAZON_ACCESS_KEY_ID=your-key
   AMAZON_SECRET_ACCESS_KEY=your-secret
   AMAZON_ASSOCIATE_TAG=your-tag
   ```
4. Install SDK:
   ```bash
   npm install paapi5-nodejs-sdk
   ```
5. Update `fetchProductFromAmazon()` to use API

**Pros:**
- Official Amazon API
- Reliable, structured data
- No scraping issues
- Rich product information

**Cons:**
- Requires approval (can take time)
- API rate limits
- More complex setup

**Implementation:**
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
    ItemIds: [asin],
    ItemIdType: 'ASIN',
    PartnerType: 'Associates',
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG!,
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'ItemInfo.Images',
      'ItemInfo.Classifications',
      'Offers.Listings.Price',
    ],
  };

  const response = await client.getItems(request);
  const item = response.ItemsResult?.Items?.[0];
  
  return {
    title: item?.ItemInfo?.Title?.DisplayValue || null,
    price: parseFloat(item?.Offers?.Listings?.[0]?.Price?.Amount || '0') || null,
    imageUrl: item?.ItemInfo?.Images?.Primary?.Large?.URL || null,
    brand: item?.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || null,
    description: null,
    specifications: {},
  };
}
```

---

### Option 3: Third-Party Scraping Service

**Services:**
- **ScraperAPI** (https://www.scraperapi.com/)
- **Bright Data** (https://brightdata.com/)
- **RapidAPI Amazon Scraper**

**Pros:**
- Handles anti-scraping measures
- Reliable
- Easy to implement

**Cons:**
- Costs money (usually $20-100/month)
- Dependency on third party

**Implementation with ScraperAPI:**
```typescript
async function fetchProductFromAmazon(asin: string) {
  const apiKey = process.env.SCRAPER_API_KEY;
  const url = `https://www.amazon.com/dp/${asin}`;
  const proxyUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl);
  const html = await response.text();
  // Parse HTML...
}
```

---

### Option 4: Client-Side Browser Extension

**How it works:**
- User installs browser extension
- Extension extracts product data when on Amazon page
- Extension sends data to your app

**Pros:**
- Works perfectly (real browser)
- No server-side issues
- Can extract rich data

**Cons:**
- Requires user to install extension
- More complex setup

---

## Testing the Current Implementation

1. **Test the API route directly:**
   ```
   http://localhost:3000/api/amazon-product?asin=B08XYZ1234
   ```

2. **Check browser console** for errors

3. **Try different ASINs** to see if extraction works

4. **If it fails**, try:
   - Different CORS proxy service
   - Check if allorigins.win is working
   - Use Option 2 (Product Advertising API) for production

---

## Environment Variables Needed

For current implementation (CORS proxy):
- None required (uses free proxy)

For Product Advertising API:
```bash
AMAZON_ACCESS_KEY_ID=your-key
AMAZON_SECRET_ACCESS_KEY=your-secret
AMAZON_ASSOCIATE_TAG=your-tag
```

For ScraperAPI:
```bash
SCRAPER_API_KEY=your-key
```

---

## Troubleshooting

### Product name still shows "Amazon Product ASIN"

1. **Check API route is working:**
   - Visit `/api/amazon-product?asin=TESTASIN123`
   - Should return JSON with product data

2. **Check CORS proxy:**
   - allorigins.win may be down
   - Try alternative: `https://cors-anywhere.herokuapp.com/` (requires setup)

3. **Check server logs:**
   - Look for errors in console
   - Check if HTML is being fetched

4. **Try different ASIN:**
   - Some products may have different HTML structure
   - Test with a popular product

### Rate Limiting

If you hit rate limits:
- Use Product Advertising API (Option 2)
- Upgrade CORS proxy service
- Add caching to reduce requests

---

## Recommended Path Forward

1. **Short term:** Use current CORS proxy implementation (Option 1)
2. **Medium term:** Apply for Product Advertising API (Option 2)
3. **Long term:** Use Product Advertising API for production, keep proxy as fallback

---

**Last Updated:** 2026-01-16  
**Status:** Option 1 Implemented, Options 2-4 Documented
