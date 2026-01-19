/**
 * Export Products Needing Images
 * 
 * Exports all engines and parts without images to CSV for agent processing
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

interface Product {
  id: string;
  type: 'engine' | 'part';
  name: string;
  brand: string | null;
  slug: string;
  affiliate_url: string | null;
}

async function exportProductsNeedingImages() {
  console.log('📊 Exporting products without images...\n');

  // Get engines without images
  const { data: engines, error: enginesError } = await supabase
    .from('engines')
    .select('id, name, brand, slug, affiliate_url')
    .or('image_url.is.null,image_url.eq.');

  if (enginesError) {
    console.error('Error fetching engines:', enginesError);
    return;
  }

  // Get parts without images
  const { data: parts, error: partsError } = await supabase
    .from('parts')
    .select('id, name, brand, slug, affiliate_url')
    .or('image_url.is.null,image_url.eq.');

  if (partsError) {
    console.error('Error fetching parts:', partsError);
    return;
  }

  // Combine and format
  const products: Product[] = [
    ...(engines || []).map(e => ({ ...e, type: 'engine' as const, brand: e.brand || null })),
    ...(parts || []).map(p => ({ ...p, type: 'part' as const, brand: p.brand || null })),
  ];

  console.log(`Found ${engines?.length || 0} engines without images`);
  console.log(`Found ${parts?.length || 0} parts without images`);
  console.log(`Total: ${products.length} products need images\n`);

  // Generate CSV
  const csvRows = [
    ['id', 'type', 'name', 'brand', 'slug', 'affiliate_url'].join(','),
    ...products.map(p => [
      p.id,
      p.type,
      `"${p.name.replace(/"/g, '""')}"`,
      p.brand ? `"${p.brand.replace(/"/g, '""')}"` : '',
      p.slug,
      p.affiliate_url || '',
    ].join(',')),
  ];

  const csvContent = csvRows.join('\n');

  // Write to file
  const outputDir = path.join(process.cwd(), 'scripts', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = path.join(outputDir, `products-needing-images-${timestamp}.csv`);
  fs.writeFileSync(filename, csvContent);

  // Also write JSON for easier parsing
  const jsonFilename = path.join(outputDir, `products-needing-images-${timestamp}.json`);
  fs.writeFileSync(jsonFilename, JSON.stringify(products, null, 2));

  console.log(`✅ Exported to:`);
  console.log(`   CSV: ${filename}`);
  console.log(`   JSON: ${jsonFilename}\n`);

  // Generate summary
  console.log('📋 Summary by Brand:');
  const byBrand = products.reduce((acc, p) => {
    const brand = p.brand || 'Unknown';
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byBrand)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count}`);
    });

  console.log('\n✨ Done! Ready for agent processing.');
}

exportProductsNeedingImages().catch(console.error);
