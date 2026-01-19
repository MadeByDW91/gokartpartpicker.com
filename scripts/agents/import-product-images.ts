/**
 * Agent 3: Database Updater
 * 
 * Bulk updates database with validated image URLs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ValidatedImageResult {
  product_id: string;
  product_type: 'engine' | 'part';
  product_name: string;
  image_url: string | null;
  source: string | null;
  valid: boolean;
  http_status: number;
  validation_errors: string[];
}

interface UpdateResult {
  product_id: string;
  product_type: 'engine' | 'part';
  success: boolean;
  error?: string;
}

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args.find(arg => arg.startsWith('--input='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');

  if (!inputFile) {
    console.error('Usage: ts-node import-product-images.ts --input=validated-images.json [--dry-run]');
    process.exit(1);
  }

  console.log('💾 Agent 3: Database Updater\n');
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  // Read validated images
  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const images: ValidatedImageResult[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const validImages = images.filter(img => img.valid && img.image_url);

  console.log(`📦 Updating ${validImages.length} products with images...\n`);

  const results: UpdateResult[] = [];
  let processed = 0;
  let successCount = 0;
  let errorCount = 0;

  // Update in batches
  for (const image of validImages) {
    processed++;
    process.stdout.write(`\r⚙️  Updating ${processed}/${validImages.length}: ${image.product_name}...`);

    try {
      if (!dryRun) {
        const table = image.product_type === 'engine' ? 'engines' : 'parts';
        const { error } = await supabase
          .from(table)
          .update({ image_url: image.image_url })
          .eq('id', image.product_id);

        if (error) {
          results.push({
            product_id: image.product_id,
            product_type: image.product_type,
            success: false,
            error: error.message,
          });
          errorCount++;
        } else {
          results.push({
            product_id: image.product_id,
            product_type: image.product_type,
            success: true,
          });
          successCount++;
        }
      } else {
        // Dry run - just check what would be updated
        results.push({
          product_id: image.product_id,
          product_type: image.product_type,
          success: true,
        });
        successCount++;
      }
    } catch (error) {
      results.push({
        product_id: image.product_id,
        product_type: image.product_type,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      errorCount++;
    }
  }

  console.log('\n');

  // Save results
  const outputDir = path.join(path.dirname(inputPath), '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const resultsFile = path.join(outputDir, `import-results-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  // Summary
  console.log('✅ Database Update Complete!\n');
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${processed}\n`);

  if (errorCount > 0) {
    console.log('❌ Errors encountered:');
    results
      .filter(r => !r.success)
      .slice(0, 5)
      .forEach(r => {
        console.log(`   ${r.product_id}: ${r.error}`);
      });
    if (errorCount > 5) {
      console.log(`   ... and ${errorCount - 5} more`);
    }
    console.log();
  }

  console.log(`💾 Results saved to: ${resultsFile}`);

  if (!dryRun) {
    console.log('\n✅ Images imported successfully!');
    console.log('   → Check your database to verify the updates');
  } else {
    console.log('\n💡 Run without --dry-run to actually update the database');
  }
}

main().catch(console.error);
