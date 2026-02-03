'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, X } from 'lucide-react';
import { cn, getPartBrandDisplay } from '@/lib/utils';
import { useEngines } from '@/hooks/use-engines';
import { useParts } from '@/hooks/use-parts';
import type { Engine, Part } from '@/types/database';

interface AdvancedSearchProps {
  onResultClick?: (result: Engine | Part) => void;
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch({ 
  onResultClick,
  placeholder = 'Search engines and parts...',
  className 
}: AdvancedSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { data: engines = [] } = useEngines();
  const { data: allParts = [] } = useParts();

  // Search logic - search entire site (engines and parts)
  const results = useMemo(() => {
    const searchQuery = query.toLowerCase().trim();
    if (!searchQuery) return { engines: [], parts: [] };

    // Search engines
    const engineResults = engines.filter((engine) => 
      engine.name.toLowerCase().includes(searchQuery) ||
      engine.brand.toLowerCase().includes(searchQuery) ||
      engine.slug.toLowerCase().includes(query)
    );

    // Search parts
    const partResults = allParts.filter((part) =>
      part.name.toLowerCase().includes(searchQuery) ||
      getPartBrandDisplay(part.brand).toLowerCase().includes(searchQuery) ||
      part.slug.toLowerCase().includes(searchQuery) ||
      part.category.toLowerCase().includes(searchQuery)
    );

    // Simple relevance sort: exact matches first, then by name
    const sortByRelevance = (a: Engine | Part, b: Engine | Part) => {
      const aExact = a.name.toLowerCase() === searchQuery;
      const bExact = b.name.toLowerCase() === searchQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    };

    engineResults.sort(sortByRelevance as (a: Engine, b: Engine) => number);
    partResults.sort(sortByRelevance as (a: Part, b: Part) => number);

    return { engines: engineResults.slice(0, 5), parts: partResults.slice(0, 5) };
  }, [query, engines, allParts]);

  const totalResults = results.engines.length + results.parts.length;
  const hasResults = totalResults > 0;

  const handleResultClick = (result: Engine | Part) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default navigation
      if ('category' in result) {
        router.push(`/parts/${result.slug}`);
      } else {
        router.push(`/engines/${result.slug}`);
      }
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'Enter' && hasResults) {
              handleResultClick(results.engines[0] || results.parts[0]);
            }
          }}
          className="w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {hasResults ? (
              <div className="divide-y divide-olive-600">
                {/* Engines */}
                {results.engines.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-olive-800 border-b border-olive-600">
                      <p className="text-xs font-semibold text-cream-300 uppercase">
                        Engines ({results.engines.length})
                      </p>
                    </div>
                    {results.engines.map((engine) => (
                      <button
                        key={engine.id}
                        onClick={() => handleResultClick(engine)}
                        className="w-full px-4 py-3 text-left hover:bg-olive-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-cream-100">{engine.name}</p>
                            <p className="text-xs text-cream-400">{engine.brand}</p>
                          </div>
                          {engine.price && (
                            <span className="text-sm font-bold text-orange-400">
                              ${engine.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Parts */}
                {results.parts.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-olive-800 border-b border-olive-600">
                      <p className="text-xs font-semibold text-cream-300 uppercase">
                        Parts ({results.parts.length})
                      </p>
                    </div>
                    {results.parts.map((part) => (
                      <button
                        key={part.id}
                        onClick={() => handleResultClick(part)}
                        className="w-full px-4 py-3 text-left hover:bg-olive-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-cream-100">{part.name}</p>
                            <p className="text-xs text-cream-400">{getPartBrandDisplay(part.brand)} • {part.category}</p>
                          </div>
                          {part.price && (
                            <span className="text-sm font-bold text-orange-400">
                              ${part.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-cream-400">No results found</p>
                <p className="text-xs text-cream-500 mt-1">Try a different search term</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
