/**
 * Agent 1: Image Finder
 * 
 * Finds product image URLs from supplier websites
 * Uses affiliate URLs, searches supplier sites, extracts image URLs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import * as zlib from 'zlib';
import { URL } from 'url';

interface Product {
  id: string;
  type: 'engine' | 'part';
  name: string;
  brand: string | null;
  slug: string;
  affiliate_url: string | null;
}

interface ImageResult {
  product_id: string;
  product_type: 'engine' | 'part';
  product_name: string;
  image_url: string | null;
  source: string | null;
  confidence: number;
  metadata: {
    dimensions?: { width: number; height: number };
    format?: string;
    notes?: string;
  };
  errors?: string[];
}

/**
 * Fetch HTML content from a URL
 */
function fetchHTML(url: string, timeout = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
        },
      };

      const request = protocol.request(options, (response) => {
        if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        // Handle compressed responses (gzip, deflate, br)
        let stream: NodeJS.ReadableStream = response;
        const encoding = response.headers['content-encoding'];
        
        if (encoding === 'gzip') {
          stream = response.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          stream = response.pipe(zlib.createInflate());
        } else if (encoding === 'br') {
          stream = response.pipe(zlib.createBrotliDecompress());
        }

        let html = '';
        stream.on('data', (chunk: Buffer) => {
          html += chunk.toString('utf8');
        });

        stream.on('end', () => {
          resolve(html);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(timeout, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Extract image URL from Harbor Freight product page HTML
 * Harbor Freight uses various image patterns in their product pages
 */
function extractHarborFreightImageFromHTML(html: string, productUrl: string): string | null {
  // Pattern 1: Look for main product image in img tags with data attributes
  // Harbor Freight often uses: data-src or src with product image patterns
  const imagePatterns = [
    // Main product image in gallery/carousel
    /<img[^>]*data-src=["']([^"']*\/products\/[^"']*\.(?:jpg|jpeg|png|webp))[^"']*["'][^>]*>/i,
    /<img[^>]*src=["']([^"']*\/products\/[^"']*\.(?:jpg|jpeg|png|webp))[^"']*["'][^>]*>/i,
    // Product image in JSON-LD structured data
    /"image":\s*"([^"]*\/products\/[^"]*\.(?:jpg|jpeg|png|webp))"/i,
    // OpenGraph image
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    // Any img tag with harborfreight.com/products in src
    /<img[^>]*src=["'](https?:\/\/[^"']*harborfreight\.com[^"']*\/products[^"']*\.(?:jpg|jpeg|png|webp))[^"']*["'][^>]*>/i,
  ];

  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let imageUrl = match[1];
      
      // Convert relative URLs to absolute
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        try {
          const baseUrl = new URL(productUrl);
          imageUrl = baseUrl.origin + imageUrl;
        } catch {
          // If URL parsing fails, try to construct manually
          const urlMatch = productUrl.match(/^(https?:\/\/[^\/]+)/);
          if (urlMatch) {
            imageUrl = urlMatch[1] + imageUrl;
          }
        }
      }
      
      // Clean up URL (remove query parameters that might resize the image)
      // Keep the base URL but prefer high-res versions
      if (imageUrl.includes('?')) {
        const [baseUrl, query] = imageUrl.split('?');
        // Prefer full-size images
        if (!query.includes('w=') && !query.includes('width=')) {
          // Try to get full resolution by removing size restrictions
          imageUrl = baseUrl + '?v=full';
        } else {
          imageUrl = baseUrl; // Remove query to get default size
        }
      }
      
      return imageUrl;
    }
  }

  return null;
}

/**
 * Extract image URL from Harbor Freight product page
 * Scrapes the product page to find the main product image
 */
async function extractHarborFreightImage(affiliateUrl: string): Promise<string | null> {
  if (!affiliateUrl || !affiliateUrl.includes('harborfreight.com')) {
    return null;
  }

  try {
    const html = await fetchHTML(affiliateUrl);
    return extractHarborFreightImageFromHTML(html, affiliateUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Harbor Freight often blocks requests with 403 Forbidden (anti-bot protection)
    if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      console.error(`Harbor Freight blocked request (403): ${errorMessage}`);
      // Note: May require cookies/authentication or use of their API if available
    } else {
      console.error(`Error fetching Harbor Freight page: ${errorMessage}`);
    }
    return null;
  }
}

/**
 * Extract ASIN from Amazon URL
 */
function extractASIN(amazonUrl: string): string | null {
  const asinPatterns = [
    /(?:dp|product|gp\/product|ASIN)\/([A-Z0-9]{10})/i,
    /\/dp\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of asinPatterns) {
    const match = amazonUrl.match(pattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Extract image URL from Amazon product page HTML
 * Amazon stores images in various places: img tags, JSON-LD, meta tags
 */
function extractAmazonImageFromHTML(html: string, asin: string): string | null {
  // Pattern 1: Look for main product image in img tags (id="landingImage" or similar)
  const imagePatterns = [
    // Main landing image (most reliable)
    /id=["']landingImage["'][^>]*src=["']([^"']+)["']/i,
    /id=["']landingImage["'][^>]*data-src=["']([^"']+)["']/i,
    /id=["']landingImage["'][^>]*data-a-dynamic-image=["']([^"']+)["']/i,
    // JSON-LD structured data
    /"image":\s*\[?\s*"([^"]*\.media-amazon\.com[^"]*)"\s*\]?/i,
    // OpenGraph image
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    // Product image in data attributes (dynamic image JSON)
    // This matches the data-a-dynamic-image attribute which contains JSON with multiple sizes
    /data-a-dynamic-image=["'](\{[^"']*\})["']/i,
    // Any img tag with media-amazon.com/images
    /<img[^>]*src=["'](https?:\/\/[^"']*media-amazon\.com\/images\/I\/[^"']*\.(?:jpg|jpeg|png|webp))[^"']*["'][^>]*>/i,
  ];

  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let imageUrl = match[1];
      
      // Handle data-a-dynamic-image JSON format
      if (imageUrl.startsWith('{')) {
        try {
          // Decode HTML entities first
          imageUrl = imageUrl.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
          
          // Parse the JSON object with multiple image sizes
          const dynamicImages = JSON.parse(imageUrl);
          
          // Find the largest image (highest resolution)
          let largestUrl = '';
          let largestSize = 0;
          
          for (const [url, dimensions] of Object.entries(dynamicImages)) {
            if (Array.isArray(dimensions) && dimensions.length >= 2) {
              const size = (dimensions[0] as number) * (dimensions[1] as number);
              if (size > largestSize) {
                largestSize = size;
                largestUrl = url as string;
              }
            }
          }
          
          if (largestUrl) {
            imageUrl = largestUrl;
          } else {
            // Fallback to first URL if dimensions not available
            imageUrl = Object.keys(dynamicImages)[0];
          }
        } catch (parseError) {
          // If JSON parsing fails, skip this match and try next pattern
          continue;
        }
      }
      
      // Decode HTML entities
      imageUrl = imageUrl.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      
      // Convert relative URLs to absolute
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = 'https://www.amazon.com' + imageUrl;
      }
      
      // Clean up URL to get high-res version
      // Amazon image URLs often have size parameters
      // Prefer _AC_SL1500_ (large) or _AC_SX679_ (extra large) for best quality
      if (imageUrl.includes('._AC_')) {
        // Replace with larger size if current is small
        if (imageUrl.includes('_AC_SX569_') || imageUrl.includes('_AC_SX355_') || imageUrl.includes('_AC_SX425_')) {
          imageUrl = imageUrl.replace(/\._AC_[^.]+\./, '._AC_SL1500_.');
        } else if (!imageUrl.includes('_AC_SL1500_') && !imageUrl.includes('_AC_SX679_')) {
          // If no large size indicator, try to upgrade to SL1500
          imageUrl = imageUrl.replace(/\._AC_[^.]+\./, '._AC_SL1500_.');
        }
      }
      
      return imageUrl;
    }
  }

  // Fallback: Try to construct URL from ASIN (less reliable)
  if (asin) {
    // This is a fallback - Amazon image URLs aren't easily predictable from ASIN alone
    // But we can try a common pattern
    return null; // Let's rely on scraping rather than guessing
  }

  return null;
}

/**
 * Extract image URL from Amazon product page
 * Scrapes the product page to find the main product image
 */
async function extractAmazonImage(affiliateUrl: string): Promise<string | null> {
  if (!affiliateUrl || !affiliateUrl.includes('amazon.com')) {
    return null;
  }

  const asin = extractASIN(affiliateUrl);
  if (!asin) {
    return null;
  }

  try {
    const html = await fetchHTML(affiliateUrl);
    const imageUrl = extractAmazonImageFromHTML(html, asin);
    
    if (imageUrl) {
      return imageUrl;
    }
  } catch (error) {
    console.error(`Error fetching Amazon page: ${error instanceof Error ? error.message : String(error)}`);
    // Fall through to try alternative approach
  }

  // Alternative: Try Amazon product image API pattern (if available)
  // Note: This requires Amazon Product Advertising API access
  return null;
}

/**
 * Search for product image using product name and brand
 * This would use web scraping or APIs in production
 */
async function findImageForProduct(product: Product): Promise<ImageResult> {
  const result: ImageResult = {
    product_id: product.id,
    product_type: product.type,
    product_name: product.name,
    image_url: null,
    source: null,
    confidence: 0,
    metadata: {},
    errors: [],
  };

  // Strategy 1: Use affiliate URL if available
  if (product.affiliate_url) {
    try {
      if (product.affiliate_url.includes('harborfreight.com')) {
        const imageUrl = await extractHarborFreightImage(product.affiliate_url);
        if (imageUrl) {
          result.image_url = imageUrl;
          result.source = 'harbor_freight';
          result.confidence = 0.9;
          result.metadata.notes = 'Extracted from Harbor Freight product page';
          return result;
        } else {
          result.errors?.push('Could not find image on Harbor Freight product page');
        }
      } else if (product.affiliate_url.includes('amazon.com')) {
        const imageUrl = await extractAmazonImage(product.affiliate_url);
        if (imageUrl) {
          result.image_url = imageUrl;
          result.source = 'amazon';
          result.confidence = 0.85;
          result.metadata.notes = 'Extracted from Amazon product page';
          return result;
        } else {
          result.errors?.push('Could not find image on Amazon product page');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors?.push(`Failed to extract from affiliate URL: ${errorMessage}`);
    }
  }

  // Strategy 2: Search manufacturer websites
  // This would require web scraping or APIs
  // For Predator engines, we know Harbor Freight is the source
  if (product.type === 'engine' && product.brand?.toLowerCase() === 'predator') {
    // Predator engines are from Harbor Freight
    // Would need to search Harbor Freight by model number
    result.errors?.push('Manual search required for Predator engines on Harbor Freight');
  }

  // Strategy 3: Google Image Search (via API or scraping)
  // This would be implemented with Google Custom Search API
  result.errors?.push('Image not found automatically - requires manual review');

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args.find(arg => arg.startsWith('--input='))?.split('=')[1];
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1];
  const sources = args.find(arg => arg.startsWith('--sources='))?.split('=')[1]?.split(',') || [];

  if (!inputFile) {
    console.error('Usage: ts-node find-product-images.ts --input=products.json --output=found-images.json [--sources=harbor_freight,amazon]');
    process.exit(1);
  }

  console.log('🔍 Agent 1: Image Finder\n');
  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile || 'found-images.json'}`);
  console.log(`Sources: ${sources.join(', ') || 'all'}\n`);

  // Read products
  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const products: Product[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`📦 Processing ${products.length} products...\n`);

  const results: ImageResult[] = [];
  let processed = 0;

  // Process each product
  for (const product of products) {
    processed++;
    process.stdout.write(`\r⚙️  Processing ${processed}/${products.length}: ${product.name}...`);

    const result = await findImageForProduct(product);
    results.push(result);

    // Rate limiting - be respectful when making HTTP requests
    // Add longer delay if we made an HTTP request (has image_url or errors from scraping)
    const delay = result.image_url || (result.errors && result.errors.length > 0) ? 500 : 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.log('\n');

  // Save results
  const outputPath = outputFile 
    ? path.resolve(outputFile) 
    : path.join(path.dirname(inputPath), 'found-images.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // Summary
  const found = results.filter(r => r.image_url).length;
  const notFound = results.length - found;

  console.log('✅ Image Finder Complete!\n');
  console.log(`   Found: ${found}/${results.length} (${Math.round(found/results.length*100)}%)`);
  console.log(`   Not Found: ${notFound} (${Math.round(notFound/results.length*100)}%)\n`);

  console.log('📊 Results by Source:');
  const bySource = results.reduce((acc, r) => {
    const source = r.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`   ${source}: ${count}`);
  });

  console.log(`\n💾 Results saved to: ${outputPath}`);
  console.log('   → Next step: Run Agent 2 (Image Validator)');
}

main().catch(console.error);
