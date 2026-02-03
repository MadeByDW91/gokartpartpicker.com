'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertCircle, Loader2, ExternalLink, Check, X, Cog, Battery, Layers } from 'lucide-react';
import { fetchAmazonProduct } from '@/actions/admin/amazon-import';
import { createPart } from '@/actions/admin';
import { suggestEngineCompatibility, searchVideosForPart, autoLinkVideosToPart } from '@/actions/admin/auto-video-linker';
import { PART_CATEGORIES } from '@/types/database';
import { getCategoryLabel, GAS_ONLY_CATEGORIES, ELECTRIC_ONLY_CATEGORIES } from '@/lib/utils';
import { slugify } from '@/lib/utils';
import type { ActionResult } from '@/lib/api/types';
import type { PartCategory } from '@/types/database';

interface AmazonProductData {
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  description: string | null;
  brand: string | null;
  category: string | null;
  affiliateUrl: string;
  specifications: Record<string, any>;
}

export function AmazonProductImporter() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<AmazonProductData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [createdPartId, setCreatedPartId] = useState<string | null>(null);
  const [suggestedVideos, setSuggestedVideos] = useState<any[]>([]);
  const [suggestedEngines, setSuggestedEngines] = useState<any[]>([]);
  const [linkingVideos, setLinkingVideos] = useState(false);

  // Part type: Gas / EV / Both — filters which categories are shown
  type PartTypeFilter = 'gas' | 'electric' | 'both';
  const [partType, setPartType] = useState<PartTypeFilter>('both');

  // Categories allowed for current part type (same logic as PartForm)
  const allowedCategories = (
    partType === 'gas'
      ? PART_CATEGORIES.filter((c) => !ELECTRIC_ONLY_CATEGORIES.includes(c))
      : partType === 'electric'
        ? PART_CATEGORIES.filter((c) => !GAS_ONLY_CATEGORIES.includes(c))
        : [...PART_CATEGORIES]
  ) as PartCategory[];

  // No-brand checkbox for unbranded parts
  const [noBrand, setNoBrand] = useState(false);

  // Form state for editing before saving
  const [formData, setFormData] = useState({
    name: '',
    category: 'clutch',
    brand: '',
    price: null as number | null,
    imageUrl: null as string | null,
    affiliateUrl: '',
    specifications: {} as Record<string, any>,
  });

  // When part type changes, if current category is not in allowed list, reset to first allowed
  const handlePartTypeChange = (value: PartTypeFilter) => {
    setPartType(value);
    const nextAllowed =
      value === 'gas'
        ? PART_CATEGORIES.filter((c) => !ELECTRIC_ONLY_CATEGORIES.includes(c))
        : value === 'electric'
          ? PART_CATEGORIES.filter((c) => !GAS_ONLY_CATEGORIES.includes(c))
          : [...PART_CATEGORIES];
    const current = formData.category;
    if (current && !nextAllowed.includes(current as PartCategory)) {
      setFormData((prev) => ({ ...prev, category: (nextAllowed[0] as string) || 'clutch' }));
    }
  };

  const handleFetch = async () => {
    if (!url.trim()) {
      setError('Please enter an Amazon URL or ASIN');
      return;
    }

    setLoading(true);
    setError(null);
    setProductData(null);
    setSaveSuccess(false);

    try {
      const result = await fetchAmazonProduct(url);
      
      if (result.success && result.data) {
        const data = result.data;
        const category = (data.category || 'clutch') as PartCategory;
        setProductData(data);
        // Infer part type from suggested category so admin sees the right filter
        if (GAS_ONLY_CATEGORIES.includes(category)) setPartType('gas');
        else if (ELECTRIC_ONLY_CATEGORIES.includes(category)) setPartType('electric');
        else setPartType('both');
        setNoBrand(!data.brand || data.brand.trim() === '');
        setFormData({
          name: data.name,
          category,
          brand: data.brand || '',
          price: data.price,
          imageUrl: data.imageUrl,
          affiliateUrl: data.affiliateUrl,
          specifications: data.specifications,
        });
      } else {
        setError('error' in result ? result.error : 'Failed to fetch product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const slug = slugify(formData.name);
      
      const result = await createPart({
        slug,
        name: formData.name,
        category: formData.category as any,
        brand: noBrand ? null : (formData.brand?.trim() || null),
        price: formData.price,
        image_url: formData.imageUrl?.trim() || null,
        affiliate_url: formData.affiliateUrl?.trim() || null,
        specifications: formData.specifications,
        is_active: true,
      });

      if (result.success && result.data) {
        setCreatedPartId(result.data.id);
        setSaveSuccess(true);
        
        // Auto-search for videos and suggest compatibility
        const [videosResult, compatibilityResult] = await Promise.all([
          searchVideosForPart(
            result.data.id,
            formData.name,
            formData.brand || null,
            formData.category as PartCategory
          ),
          suggestEngineCompatibility(
            result.data.id,
            formData.category as PartCategory,
            formData.specifications
          ),
        ]);

        if (videosResult.success && videosResult.data) {
          setSuggestedVideos(videosResult.data);
        }
        if (compatibilityResult.success && compatibilityResult.data) {
          setSuggestedEngines(compatibilityResult.data);
        }

        // Show review interface
        setShowReview(true);
      } else {
        setError(result.success ? 'Unknown error' : (result.error || 'Failed to create part'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create part');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-cream-100">Import from Amazon</h2>
        <p className="text-sm text-cream-400 mt-1">
          Paste an Amazon product URL or ASIN to automatically import product data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="https://www.amazon.com/dp/B08XYZ1234 or B08XYZ1234"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleFetch();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            loading={loading}
          >
            {loading ? 'Fetching...' : 'Fetch Product'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Product Preview & Edit Form */}
        {productData && (
          <div className="space-y-4 p-4 bg-olive-800/50 rounded-lg border border-olive-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-cream-100">Product Preview</h3>
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Part created successfully!</span>
                </div>
              )}
            </div>

            {/* Product Image */}
            {formData.imageUrl && (
              <div className="mb-4">
                <img
                  src={formData.imageUrl}
                  alt={formData.name}
                  className="w-32 h-32 object-contain bg-olive-900 rounded border border-olive-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Editable Fields */}
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            {/* Part type: Gas / EV / Both — identifies whether this part is for gas, electric, or universal builds */}
            <div>
              <label className="block text-sm font-medium text-cream-300 mb-2">Part type (EV or Gas)</label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: 'gas' as const, label: 'Gas only', icon: Cog },
                    { value: 'electric' as const, label: 'Electric (EV) only', icon: Battery },
                    { value: 'both' as const, label: 'Both (universal)', icon: Layers },
                  ]
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handlePartTypeChange(value)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      partType === value
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                        : 'border-olive-600 bg-olive-800/50 text-cream-300 hover:border-olive-500 hover:text-cream-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-cream-500 mt-1.5">
                Choose whether this part is for gas builds, EV builds, or both. Category list below updates to match.
              </p>
            </div>

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: '', label: 'Select Category' },
                ...allowedCategories.map((cat) => ({
                  value: cat,
                  label: getCategoryLabel(cat),
                })),
              ]}
              required
            />

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noBrand}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setNoBrand(checked);
                    if (checked) setFormData((prev) => ({ ...prev, brand: '' }));
                  }}
                  className="rounded border-olive-500 bg-olive-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-cream-200">No brand (unbranded part)</span>
              </label>
              <Input
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                disabled={noBrand}
              />
            </div>

            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                price: e.target.value ? parseFloat(e.target.value) : null 
              })}
            />

            <Input
              label="Image URL"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value || null })}
            />

            <div>
              <label className="block text-sm font-medium text-cream-300 mb-2">
                Affiliate Link
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.affiliateUrl}
                  onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                  className="flex-1"
                />
                <a
                  href={formData.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-olive-700 border border-olive-600 rounded-md text-cream-200 hover:text-orange-400 hover:border-orange-500 transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* ASIN Display */}
            <div className="text-xs text-cream-400">
              <strong>ASIN:</strong> {productData.asin}
            </div>

            {/* Save Button */}
            <div className="flex gap-2 pt-4 border-t border-olive-600">
              <Button
                onClick={handleSave}
                disabled={saving || !formData.name.trim() || !formData.category}
                loading={saving}
                className="flex-1"
              >
                {saving ? 'Creating Part...' : 'Create Part'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setProductData(null);
                  setUrl('');
                  setError(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Review Interface - Videos & Compatibility */}
        {showReview && createdPartId && (
          <div className="mt-6 p-4 bg-olive-800/50 rounded-lg border border-olive-600">
            <h3 className="text-md font-semibold text-cream-100 mb-4">
              Auto-Suggested Videos & Compatibility
            </h3>
            
            {/* Suggested Videos */}
            {suggestedVideos.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-cream-200 mb-2">
                  Suggested Videos ({suggestedVideos.length})
                </h4>
                <p className="text-xs text-cream-400 mb-3">
                  Search YouTube for "{formData.name} go kart" to find videos, then paste URLs below:
                </p>
                <div className="space-y-2 mb-3">
                  {suggestedVideos.slice(0, 5).map((video, idx) => (
                    <div key={idx} className="p-2 bg-olive-700/50 rounded text-xs text-cream-400">
                      <strong className="text-cream-200">{video.title}</strong> ({video.category})
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <textarea
                    placeholder="Paste YouTube video URLs here (one per line)"
                    className="w-full px-3 py-2 bg-olive-900 border border-olive-600 rounded text-sm text-cream-100 placeholder:text-cream-500"
                    rows={3}
                    id="video-urls-input"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={async () => {
                      const textarea = document.getElementById('video-urls-input') as HTMLTextAreaElement;
                      const urls = textarea.value.split('\n').filter(u => u.trim());
                      if (urls.length === 0) return;
                      
                      setLinkingVideos(true);
                      const result = await autoLinkVideosToPart(
                        createdPartId,
                        formData.name,
                        formData.brand || null,
                        formData.category as PartCategory,
                        urls
                      );
                      setLinkingVideos(false);
                      
                      if (result.success) {
                        setError(null);
                        textarea.value = '';
                      } else {
                        setError(result.error || 'Failed to link videos');
                      }
                    }}
                    disabled={linkingVideos}
                    loading={linkingVideos}
                  >
                    {linkingVideos ? 'Linking...' : 'Link Videos'}
                  </Button>
                </div>
              </div>
            )}

            {/* Suggested Engine Compatibility */}
            {suggestedEngines.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-cream-200 mb-2">
                  Suggested Engine Compatibility ({suggestedEngines.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {suggestedEngines.map((engine) => (
                    <div key={engine.engineId} className="p-2 bg-olive-700/50 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-cream-100">{engine.engineName}</div>
                          <div className="text-xs text-cream-400 mt-1">{engine.compatibilityReason}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          engine.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                          engine.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {engine.confidence}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-cream-500 mt-2">
                  Review these suggestions and add compatibility rules in the Compatibility admin tool if needed.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-olive-600">
              <Button
                variant="primary"
                onClick={() => {
                  setShowReview(false);
                  setUrl('');
                  setProductData(null);
                  setFormData({
                    name: '',
                    category: 'clutch',
                    brand: '',
                    price: null,
                    imageUrl: null,
                    affiliateUrl: '',
                    specifications: {},
                  });
                  setSaveSuccess(false);
                  setCreatedPartId(null);
                  setSuggestedVideos([]);
                  setSuggestedEngines([]);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-olive-700/30 rounded-md">
          <p className="text-xs text-cream-400">
            <strong className="text-cream-200">How it works:</strong>
          </p>
          <ul className="text-xs text-cream-400 mt-1 space-y-1 list-disc list-inside">
            <li>Paste any Amazon product URL or ASIN</li>
            <li>System fetches product data automatically</li>
            <li>Review and edit the information</li>
            <li>Select the appropriate category</li>
            <li>Click "Create Part" to add to catalog</li>
            <li>System auto-suggests videos and engine compatibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
