'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice, getMotorBrandDisplay } from '@/lib/utils';
import { Search, Check, ExternalLink, Loader2, Cog, Battery, Layers } from 'lucide-react';
import { 
  searchAmazonByCategory, 
  createAmazonCategoryImport,
  type AmazonProduct 
} from '@/actions/admin/amazon-category-search';
import { useEngines } from '@/hooks/use-engines';
import { useMotors } from '@/hooks/use-motors';
import { PART_CATEGORIES } from '@/types/database';
import { getCategoryLabel, GAS_ONLY_CATEGORIES, ELECTRIC_ONLY_CATEGORIES } from '@/lib/utils';
import type { PartCategory, Engine, ElectricMotor } from '@/types/database';

type PartTypeFilter = 'gas' | 'electric' | 'both';

export default function AmazonCategorySearchPage() {
  const router = useRouter();
  const [partType, setPartType] = useState<PartTypeFilter>('both');
  const [category, setCategory] = useState<PartCategory>('clutch');
  const [selectedPowerSourceId, setSelectedPowerSourceId] = useState<string>('');

  const allowedCategories = (
    partType === 'gas'
      ? PART_CATEGORIES.filter((c) => !ELECTRIC_ONLY_CATEGORIES.includes(c))
      : partType === 'electric'
        ? PART_CATEGORIES.filter((c) => !GAS_ONLY_CATEGORIES.includes(c))
        : [...PART_CATEGORIES]
  ) as PartCategory[];
  const [maxResults, setMaxResults] = useState(20);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch engines and motors for selection
  const { data: engines } = useEngines();
  const { data: motors } = useMotors();

  const handleSearch = async () => {
    setSearching(true);
    setError(null);
    setProducts([]);
    setSelectedProducts(new Set());

    try {
      const result = await searchAmazonByCategory(category, {
        maxResults,
        minPrice,
        maxPrice,
      });

      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error || 'Failed to search Amazon');
      }
    } catch (err) {
      console.error('Error searching Amazon:', err);
      setError(err instanceof Error ? err.message : 'Failed to search Amazon');
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async () => {
    if (selectedProducts.size === 0) {
      alert('Please select at least one product to import');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const asins = Array.from(selectedProducts);
      
      // Determine if selected ID is an engine or motor
      const isEngine = selectedPowerSourceId ? engines?.some(e => e.id === selectedPowerSourceId) : false;
      const isMotor = selectedPowerSourceId ? motors?.some(m => m.id === selectedPowerSourceId) : false;
      
      const result = await createAmazonCategoryImport(category, asins, {
        maxResults,
        minPrice,
        maxPrice,
        engineId: isEngine ? selectedPowerSourceId : undefined,
        motorId: isMotor ? selectedPowerSourceId : undefined,
      });

      if (result.success) {
        const powerSourceType = isEngine ? 'engine' : isMotor ? 'motor' : '';
        alert(`Successfully imported ${selectedProducts.size} products!${selectedPowerSourceId ? ` Compatibility proposals created for selected ${powerSourceType}.` : ''}`);
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

  const toggleProduct = (asin: string) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(asin)) {
      newSet.delete(asin);
    } else {
      newSet.add(asin);
    }
    setSelectedProducts(newSet);
  };

  const selectAll = () => {
    setSelectedProducts(new Set(products.map(p => p.asin)));
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cream-100">Amazon Category Search</h1>
        <p className="text-cream-400 mt-1">
          Search Amazon for products by category and import them with affiliate links
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-olive-800 border border-olive-600 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Part type (EV or Gas)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
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
                  onClick={() => {
                    setPartType(value);
                    const nextAllowed = value === 'gas'
                      ? PART_CATEGORIES.filter((c) => !ELECTRIC_ONLY_CATEGORIES.includes(c))
                      : value === 'electric'
                        ? PART_CATEGORIES.filter((c) => !GAS_ONLY_CATEGORIES.includes(c))
                        : [...PART_CATEGORIES];
                    if (!nextAllowed.includes(category)) setCategory(nextAllowed[0] as PartCategory);
                  }}
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
            <p className="text-xs text-cream-500">Identify whether you're searching for gas, EV, or universal parts. Category list updates to match.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Part Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PartCategory)}
              className="w-full px-3 py-2 bg-olive-900 border border-olive-600 rounded-md text-cream-100"
            >
              {allowedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
            <p className="text-xs text-cream-400 mt-1">Select the type of part to search for</p>
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
                      {getMotorBrandDisplay(motor.brand)} {motor.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-xs text-cream-400 mt-1">
              Auto-create compatibility proposals for this engine or motor
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Max Results
            </label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full px-3 py-2 bg-olive-900 border border-olive-600 rounded-md text-cream-100"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Min Price ($)
            </label>
            <Input
              type="number"
              value={minPrice || ''}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Optional"
              className="bg-olive-900 border-olive-600 text-cream-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Max Price ($)
            </label>
            <Input
              type="number"
              value={maxPrice || ''}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Optional"
              className="bg-olive-900 border-olive-600 text-cream-100"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={handleSearch}
            disabled={searching}
            className="bg-orange-500 hover:bg-orange-600 text-cream-100"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Amazon
              </>
            )}
          </Button>
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

      {/* Results */}
      {products.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-cream-100">
              Results ({products.length} found)
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={selectAll}
                className="bg-olive-700 hover:bg-olive-600 text-cream-100"
                size="sm"
              >
                Select All
              </Button>
              <Button
                onClick={clearSelection}
                className="bg-olive-700 hover:bg-olive-600 text-cream-100"
                size="sm"
              >
                Clear
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || selectedProducts.size === 0}
                className="bg-orange-500 hover:bg-orange-600 text-cream-100"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import Selected ({selectedProducts.size})
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.asin}
                className={`bg-olive-800 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProducts.has(product.asin)
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-olive-600 hover:border-olive-500'
                }`}
                onClick={() => toggleProduct(product.asin)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.asin)}
                    onChange={() => toggleProduct(product.asin)}
                    className="mt-1 rounded border-olive-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
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
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-cream-500">ASIN: {product.asin}</span>
                      {product.customerRating && (
                        <span className="text-yellow-400">
                          ⭐ {product.customerRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://www.amazon.com/dp/${product.asin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-orange-400 hover:text-orange-300 text-xs mt-2 inline-flex items-center gap-1"
                    >
                      View on Amazon
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searching && products.length === 0 && !error && (
        <div className="bg-olive-800 border border-olive-600 rounded-lg p-12 text-center">
          <p className="text-cream-400">Search Amazon to find products for this category</p>
          <p className="text-cream-500 text-sm mt-2">
            Select a category and optionally choose an engine/motor to auto-link compatibility
          </p>
        </div>
      )}
    </div>
  );
}
