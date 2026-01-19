import Link from 'next/link';
import { Suspense } from 'react';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { AmazonProductImporter } from '@/components/lazy';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function PartsImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/parts"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Parts
        </Link>
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-display text-3xl text-cream-100">Import Parts from Amazon</h1>
            <p className="text-cream-300 mt-1">
              Quickly add parts to your catalog by importing from Amazon
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="animate-pulse bg-olive-800 h-64 rounded-lg" />}>
        <AmazonProductImporter />
      </Suspense>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">How It Works</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-cream-300">
          <div>
            <h3 className="font-semibold text-cream-100 mb-1">1. Find Product on Amazon</h3>
            <p className="text-cream-400">
              Browse Amazon and find the go-kart part you want to add. Copy the product URL or ASIN.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-cream-100 mb-1">2. Paste URL</h3>
            <p className="text-cream-400">
              Paste the Amazon URL or ASIN into the import tool above. The system will automatically fetch product information.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-cream-100 mb-1">3. Review & Edit</h3>
            <p className="text-cream-400">
              Review the automatically filled information. Edit the name, category, price, or any other details as needed.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-cream-100 mb-1">4. Create Part</h3>
            <p className="text-cream-400">
              Click "Create Part" to add it to your catalog. The affiliate link is automatically generated with your Amazon Associates tag.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Tips for Fast Importing</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-cream-300">
          <ul className="list-disc list-inside space-y-1 text-cream-400">
            <li>Use Amazon product URLs or just the ASIN (10-character code)</li>
            <li>Verify the category suggestion - it's usually correct but may need adjustment</li>
            <li>Check the price - Amazon prices change frequently</li>
            <li>Review the product image - sometimes you may want to use a different one</li>
            <li>The affiliate link is automatically generated - no need to create it manually</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
