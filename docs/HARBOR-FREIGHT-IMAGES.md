# Harbor Freight Image URLs Guide

This guide explains how to get product images from Harbor Freight and use them in the GoKartPartPicker engine catalog.

## How to Get Harbor Freight Product Images

### Method 1: Direct Image URL from Product Page (Recommended)

1. **Navigate to the Harbor Freight product page**
   - Go to https://www.harborfreight.com/brands/predator/engines.html
   - Click on the specific engine you want

2. **Find the product image**
   - Right-click on the main product image
   - Select "Copy image address" or "Copy image URL"
   - The URL will look something like:
     ```
     https://hft-media.s3.amazonaws.com/images/products/12345.jpg
     ```
   - Or:
     ```
     https://hft-media.s3.amazonaws.com/images/products/12345_1000.jpg
     ```

3. **Use the high-resolution image URL**
   - Harbor Freight often uses numbered suffixes for different sizes (e.g., `_1000.jpg`, `_500.jpg`)
   - Use the largest size available (usually `_1000.jpg` or no suffix for full size)

### Method 2: Extract from Page Source

1. **View page source**
   - On the Harbor Freight product page, right-click → "View Page Source"
   - Search for `img` or `data-image` or `product-image`

2. **Find the image URL in the HTML**
   - Look for patterns like:
     ```html
     <img src="https://hft-media.s3.amazonaws.com/images/products/12345_1000.jpg" />
     ```
   - Or in JSON data:
     ```json
     "imageUrl": "https://hft-media.s3.amazonaws.com/images/products/12345_1000.jpg"
     ```

### Method 3: Browser Developer Tools

1. **Open Developer Tools** (F12 or Right-click → Inspect)
2. **Go to Network tab**
3. **Filter by "Img"**
4. **Reload the page**
5. **Find the main product image request**
6. **Copy the image URL from the request**

## Common Harbor Freight Image URL Patterns

Harbor Freight uses Amazon S3 for image hosting:

```
https://hft-media.s3.amazonaws.com/images/products/{ITEM_ID}_{SIZE}.jpg
```

Examples:
- `https://hft-media.s3.amazonaws.com/images/products/12345.jpg` (full size)
- `https://hft-media.s3.amazonaws.com/images/products/12345_1000.jpg` (1000px)
- `https://hft-media.s3.amazonaws.com/images/products/12345_500.jpg` (500px)

## Adding Images to Engines via Admin Panel

1. **Go to Admin Panel** → **Engines**
2. **Click "Edit" on an engine** (or create a new one)
3. **In the "Pricing & Links" section:**
   - **Image URL**: Paste the Harbor Freight image URL
   - **Price**: Enter the price from Harbor Freight's website
   - **Harbor Freight Link**: The product page URL (for reference)

4. **Save the engine**

## Bulk Update Script (Future Enhancement)

A script could be created to:
1. Take a CSV of engine SKUs/names and Harbor Freight URLs
2. Scrape/fetch image URLs from Harbor Freight pages
3. Update the database with images and prices

This would require:
- Web scraping library (Puppeteer, Playwright, or Cheerio)
- Harbor Freight URL mapping for each engine
- Database update logic

## Legal Considerations

⚠️ **Important**: Always check Harbor Freight's Terms of Service and robots.txt before:
- Automatically scraping their website
- Using their images in bulk
- Creating automated tools that access their site frequently

**Best Practices**:
- Use images for display purposes only
- Link back to Harbor Freight product pages
- Don't hotlink images directly (consider downloading and hosting, or use their CDN with proper attribution)
- Respect rate limits if scraping

## Example: Predator 212 Engine

1. **Product Page**: https://www.harborfreight.com/212cc-predator-hemi-6hp-horizontal-shaft-gas-engine-63133.html
2. **Image URL**: `https://hft-media.s3.amazonaws.com/images/products/63133_1000.jpg`
3. **Price**: Check the current price on the page

In the admin form:
- **Image URL**: `https://hft-media.s3.amazonaws.com/images/products/63133_1000.jpg`
- **Price**: `299.99` (example - check current price)
- **Harbor Freight Link**: `https://www.harborfreight.com/212cc-predator-hemi-6hp-horizontal-shaft-gas-engine-63133.html`
