/**
 * Agent 2: Image Validator
 * 
 * Validates product image URLs - checks accessibility, format, dimensions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

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

interface ValidatedImageResult extends ImageResult {
  valid: boolean;
  http_status: number;
  format?: string;
  dimensions?: { width: number; height: number };
  file_size?: number;
  load_time_ms?: number;
  validation_errors: string[];
}

/**
 * Check if URL is accessible (HTTP HEAD request)
 */
function checkUrlAccessible(url: string): Promise<{ status: number; headers: Record<string, string> }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.request(url, { method: 'HEAD' }, (response) => {
      const headers: Record<string, string> = {};
      Object.keys(response.headers).forEach(key => {
        headers[key] = response.headers[key] as string;
      });
      
      response.on('end', () => {
        resolve({ status: response.statusCode || 0, headers });
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.end();
  });
}

/**
 * Validate image URL
 */
async function validateImage(imageResult: ImageResult): Promise<ValidatedImageResult> {
  const validated: ValidatedImageResult = {
    ...imageResult,
    valid: false,
    http_status: 0,
    validation_errors: [],
  };

  if (!imageResult.image_url) {
    validated.validation_errors.push('No image URL provided');
    return validated;
  }

  const startTime = Date.now();

  try {
    // Check URL accessibility
    const { status, headers } = await checkUrlAccessible(imageResult.image_url);
    validated.http_status = status;

    if (status !== 200) {
      validated.validation_errors.push(`HTTP ${status}: URL not accessible`);
      return validated;
    }

    // Check content type
    const contentType = headers['content-type'] || '';
    if (contentType.startsWith('image/')) {
      validated.format = contentType.split('/')[1].split(';')[0];
      validated.valid = true;
    } else {
      validated.validation_errors.push(`Invalid content type: ${contentType}`);
    }

    // Check file size from Content-Length header
    const contentLength = headers['content-length'];
    if (contentLength) {
      validated.file_size = parseInt(contentLength, 10);
      if (validated.file_size > 10 * 1024 * 1024) {
        validated.validation_errors.push(`File too large: ${(validated.file_size / 1024 / 1024).toFixed(2)}MB`);
      }
    }

    // Note: Getting dimensions would require downloading the image
    // For now, we skip this or use a library like 'image-size'
    validated.load_time_ms = Date.now() - startTime;

  } catch (error) {
    validated.validation_errors.push(`Network error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return validated;
}

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args.find(arg => arg.startsWith('--input='))?.split('=')[1];
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

  if (!inputFile) {
    console.error('Usage: ts-node validate-product-images.ts --input=found-images.json --output=validated-images.json');
    process.exit(1);
  }

  console.log('✅ Agent 2: Image Validator\n');

  // Read found images
  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const images: ImageResult[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const imagesToValidate = images.filter(img => img.image_url);

  console.log(`📦 Validating ${imagesToValidate.length} images...\n`);

  const validated: ValidatedImageResult[] = [];
  let processed = 0;

  for (const image of images) {
    processed++;
    
    if (image.image_url) {
      process.stdout.write(`\r⚙️  Validating ${processed}/${images.length}: ${image.product_name}...`);
      const result = await validateImage(image);
      validated.push(result);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      // Keep images without URLs in results
      validated.push({
        ...image,
        valid: false,
        http_status: 0,
        validation_errors: ['No image URL to validate'],
      });
    }
  }

  console.log('\n');

  // Save results
  const outputPath = outputFile 
    ? path.resolve(outputFile) 
    : path.join(path.dirname(inputPath), 'validated-images.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2));

  // Summary
  const valid = validated.filter(v => v.valid).length;
  const invalid = validated.filter(v => !v.valid && v.image_url).length;
  const noUrl = validated.filter(v => !v.image_url).length;

  console.log('✅ Image Validator Complete!\n');
  console.log(`   Valid: ${valid} (${Math.round(valid/validated.length*100)}%)`);
  console.log(`   Invalid: ${invalid}`);
  console.log(`   No URL: ${noUrl}\n`);

  if (invalid > 0) {
    console.log('⚠️  Validation Errors:');
    validated
      .filter(v => !v.valid && v.validation_errors.length > 0)
      .slice(0, 5)
      .forEach(v => {
        console.log(`   ${v.product_name}: ${v.validation_errors[0]}`);
      });
    if (invalid > 5) {
      console.log(`   ... and ${invalid - 5} more`);
    }
    console.log();
  }

  console.log(`💾 Results saved to: ${outputPath}`);
  console.log('   → Next step: Review in Admin UI or run Agent 3 (Database Updater)');
}

main().catch(console.error);
