# Amazon Product Import System

## Overview

Automated system to import products from Amazon directly into the parts catalog. Paste an Amazon URL, and the system automatically:
- Extracts product information (name, description, price, images)
- Generates affiliate links
- Pre-fills the part creation form
- Allows bulk import of multiple products

## Features

### Single Product Import
1. Paste Amazon URL or ASIN
2. System fetches product data
3. Form auto-fills with:
   - Product name
   - Description
   - Price
   - Images (primary + additional)
   - Specifications (if available)
   - Auto-generated affiliate link
4. Admin selects category and adjusts as needed
5. One-click save

### Bulk Import
1. Paste multiple Amazon URLs (one per line)
2. System processes all products
3. Shows preview of what will be imported
4. Admin can review/edit before importing
5. Batch import all at once

## Implementation Options

### Option 1: Amazon Product Advertising API (Recommended)
**Pros:**
- Official Amazon API
- Reliable data
- No scraping issues
- Rich product data

**Cons:**
- Requires API approval from Amazon
- Rate limits
- Requires Access Key ID and Secret Key

**Setup:**
1. Apply for Product Advertising API access
2. Get Access Key ID and Secret Key
3. Add to environment variables

### Option 2: Web Scraping (Faster to Implement)
**Pros:**
- No API approval needed
- Works immediately
- Can extract rich data

**Cons:**
- May violate Amazon ToS
- Less reliable (Amazon can change HTML)
- Requires parsing HTML

**Note:** Use with caution and respect robots.txt

### Option 3: Hybrid Approach (Best)
**Implementation:**
1. Try Product Advertising API first
2. Fallback to web scraping if API unavailable
3. Cache results to reduce API calls

## Data Extraction

### From Amazon Product Page:
- **Title:** Product name
- **Price:** Current price (with currency)
- **Images:** Primary image + gallery images
- **Description:** Product description/bullet points
- **Specifications:** Technical details table
- **Brand:** Manufacturer name
- **ASIN:** For affiliate link generation
- **Dimensions:** If available
- **Weight:** If available

### Smart Category Detection:
- Analyze product title/description
- Match keywords to part categories
- Suggest category (admin can override)

## UI Flow

### Single Import:
```
Admin → Parts → "Import from Amazon" button
→ Paste URL → "Fetch Product" → Preview form
→ Edit if needed → "Create Part"
```

### Bulk Import:
```
Admin → Parts → "Bulk Import from Amazon"
→ Paste multiple URLs (one per line)
→ "Process All" → Preview table
→ Edit individual items → "Import Selected" or "Import All"
```

## Technical Implementation

### Server Actions:
- `fetchAmazonProduct(urlOrASIN)` - Fetches product data
- `bulkFetchAmazonProducts(urls)` - Fetches multiple products
- `extractProductSpecs(html)` - Extracts specifications
- `detectPartCategory(productData)` - Suggests category

### Components:
- `AmazonProductImporter.tsx` - Single product import
- `BulkAmazonImporter.tsx` - Bulk import interface
- `ProductPreview.tsx` - Preview before saving

## Environment Variables Needed

```bash
# Amazon Product Advertising API (if using)
AMAZON_ACCESS_KEY_ID=your-access-key
AMAZON_SECRET_ACCESS_KEY=your-secret-key
AMAZON_ASSOCIATE_TAG=your-tag (already have this)

# Or use existing
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-tag
```

## Error Handling

- Invalid URL/ASIN
- Product not found
- API rate limits
- Network errors
- Missing required data
- Duplicate products (by ASIN)

## Success Criteria

- [ ] Paste Amazon URL → Form auto-fills
- [ ] Images automatically imported
- [ ] Affiliate link auto-generated
- [ ] Category suggested (can override)
- [ ] Bulk import works (10+ products)
- [ ] Preview before saving
- [ ] Error handling for invalid products
- [ ] Duplicate detection
