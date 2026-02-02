'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { Upload, ExternalLink, Loader2, Check } from 'lucide-react';
import { 
  importAmazonProductsFromLinks,
  getAmazonProductByASIN,
  type AmazonProduct 
} from '@/actions/admin/amazon-category-search';
import { useEngines } from '@/hooks/use-engines';
import { useMotors } from '@/hooks/use-motors';
import { PART_CATEGORIES } from '@/types/database';
import { getCategoryLabel } from '@/lib/utils';
import { Cog, Battery } from 'lucide-react';
import type { PartCategory, Engine, ElectricMotor } from '@/types/database';

export default function AmazonLinksImportPage() {
  const router = useRouter();
  const [urlsText, setUrlsText] = useState('');
  const [category, setCategory] = useState<PartCategory | ''>('');
  const [selectedPowerSourceId, setSelectedPowerSourceId] = useState<string>('');
  const [useSiteStripeTags, setUseSiteStripeTags] = useState(true);
  const [previewProducts, setPreviewProducts] = useState<Array<AmazonProduct & { affiliateLink: string; url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch engines and motors for selection
  const { data: engines } = useEngines();
  const { data: motors } = useMotors();

  const handlePreview = async () => {
    if (!urlsText.trim()) {
      alert('Please paste Amazon URLs or ASINs');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewProducts([]);

    try {
      const lines = urlsText.trim().split('\n').filter(line => line.trim());
      const products: Array<AmazonProduct & { affiliateLink: string; url: string }> = [];

      for (const line of lines) {
        const urlOrASIN = line.trim();
        if (!urlOrASIN) continue;

        try {
          const result = await getAmazonProductByASIN(urlOrASIN);
          if (result.success && result.data) {
            products.push({
              ...result.data,
              url: urlOrASIN,
            });
          }
        } catch (err) {
          console.error(`Error fetching ${urlOrASIN}:`, err);
          // Continue with other products
        }
      }

      setPreviewProducts(products);
    } catch (err) {
      console.error('Error previewing products:', err);
      setError(err instanceof Error ? err.message : 'Failed to preview products');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!urlsText.trim()) {
      alert('Please paste Amazon URLs or ASINs');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const lines = urlsText.trim().split('\n').filter(line => line.trim());
      
      // Determine if selected ID is an engine or motor
      const isEngine = selectedPowerSourceId ? engines?.some(e => e.id === selectedPowerSourceId) : false;
      const isMotor = selectedPowerSourceId ? motors?.some(m => m.id === selectedPowerSourceId) : false;
      
      const result = await importAmazonProductsFromLinks(
        lines,
        category || undefined,
        {
          engineId: isEngine ? selectedPowerSourceId : undefined,
          motorId: isMotor ? selectedPowerSourceId : undefined,
        }
      );

      if (result.success) {
        alert(`Successfully imported ${lines.length} products!`);
        router.push(`/admin/ingestion/${result.data.importJobId}`);
      } else {
        setError(result.error || 'Failed to import products');
      }
    } catch (err) {
      console.error('Error importing products:', err);
      setError(err instanceof Error ? err.message : 'Failed to import products');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cream-100">Import from SiteStripe Links</h1>
        <p className="text-cream-400 mt-1">
          Paste Amazon URLs, ASINs, or SiteStripe affiliate links to import products
        </p>
      </div>

      {/* Import Form */}
      <div className="bg-olive-800 border border-olive-600 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Amazon URLs, ASINs, or SiteStripe Links (one per line)
            </label>
            <textarea
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              placeholder="https://www.amazon.com/dp/B08XYZ1234?tag=your-tag-20&#10;B09ABC5678&#10;https://www.amazon.com/dp/B10DEF9012"
              rows={10}
              className="w-full px-3 py-2 bg-olive-900 border border-olive-600 rounded-md text-cream-100 font-mono text-sm"
            />
            <p className="text-xs text-cream-400 mt-1">
              Paste one URL, ASIN, or SiteStripe link per line. The system will extract ASINs and fetch product data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-2">
                Category (Optional - will auto-detect if not provided)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PartCategory | '')}
                className="w-full px-3 py-2 bg-olive-900 border border-olive-600 rounded-md text-cream-100"
              >
                <option value="">Auto-detect</option>
                {PART_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-200 mb-2">
                Engine/Motor (Optional)
              </label>
              <select
                value={selectedPowerSourceId}
                onChange={(e) => setSelectedPowerSourceId(e.target.value)}
                className="w-full px-3 py-2 bg-olive-900 border border-olive-600 rounded-md text-cream-100"
              >
                <option value="">None - Don't auto-link compatibility</option>
                {(engines || []).length > 0 && (
                  <optgroup label="Gas Engines">
                    {(engines || []).map((engine: Engine) => (
                      <option key={engine.id} value={engine.id}>
                        {engine.brand} {engine.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {(motors || []).length > 0 && (
                  <optgroup label="Electric Motors">
                    {(motors || []).map((motor: ElectricMotor) => (
                      <option key={motor.id} value={motor.id}>
                        {motor.brand} {motor.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="text-xs text-cream-400 mt-1">
                Auto-create compatibility proposals for this engine or motor
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSiteStripeTags}
                  onChange={(e) => setUseSiteStripeTags(e.target.checked)}
                  className="rounded border-olive-600"
                />
                <span className="text-sm text-cream-200">
                  Use SiteStripe affiliate tags (if present in links)
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePreview}
              disabled={loading || !urlsText.trim()}
              className="bg-olive-700 hover:bg-olive-600 text-cream-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Previewing...
                </>
              ) : (
                <>
                  Preview Products
                </>
              )}
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !urlsText.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-cream-100"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Products
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {selectedPowerSourceId && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            {engines?.some(e => e.id === selectedPowerSourceId) ? (
              <Cog className="w-4 h-4 text-blue-400" />
            ) : (
              <Battery className="w-4 h-4 text-blue-400" />
            )}
            <p className="text-blue-400 text-sm">
              Compatibility proposals will be auto-created for{' '}
              <span className="font-medium">
                {engines?.find(e => e.id === selectedPowerSourceId)?.name || 
                 motors?.find(m => m.id === selectedPowerSourceId)?.name || 
                 'selected engine/motor'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Preview Results */}
      {previewProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-cream-100">
            Preview ({previewProducts.length} products)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewProducts.map((product) => (
              <div
                key={product.asin}
                className="bg-olive-800 border border-olive-600 rounded-lg p-4"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-32 object-contain bg-olive-900 rounded mb-2"
                  />
                )}
                <h3 className="font-medium text-cream-100 text-sm line-clamp-2 mb-1">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-cream-400 mb-2">
                  <span>{product.brand || 'Unknown Brand'}</span>
                  {product.price && (
                    <span className="font-bold text-orange-400">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-cream-500">ASIN: {product.asin}</div>
                  {'siteStripeTag' in product && (product as any).siteStripeTag && (
                    <div className="text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      SiteStripe tag: {(product as any).siteStripeTag}
                    </div>
                  )}
                  <div className="text-cream-400 break-all">
                    Affiliate: {product.affiliateLink}
                  </div>
                </div>
                <a
                  href={product.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 text-xs mt-2 inline-flex items-center gap-1"
                >
                  View Link
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
