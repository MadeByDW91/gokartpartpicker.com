'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getCategoryLabel, cn } from '@/lib/utils';
import { ExternalLink, Plus, Check, ChevronUp, ChevronDown } from 'lucide-react';
import type { Part, PartCategory } from '@/types/database';

interface PartsTableViewProps {
  parts: Part[];
  onAddToBuild?: (part: Part) => void;
  selectedParts?: Map<PartCategory, Part[]>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

type SortField = 'name' | 'price' | 'created_at';

// Map display fields to backend sort fields
const SORT_FIELD_MAP: Record<string, SortField> = {
  name: 'name',
  brand: 'name', // Sort by name for brand (closest match)
  price: 'price',
  category: 'created_at', // Default to created_at for category
};

export function PartsTableView({
  parts,
  onAddToBuild,
  selectedParts = new Map(),
  sortBy = 'name',
  sortOrder = 'asc',
  onSort,
}: PartsTableViewProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleSort = (field: string) => {
    // Map display field to backend sort field
    const backendField = SORT_FIELD_MAP[field] || 'name';
    onSort?.(backendField);
  };

  const SortButton = ({ field, backendField, children }: { field: string; backendField?: SortField; children: React.ReactNode }) => {
    const sortField = backendField || SORT_FIELD_MAP[field] || 'name';
    const isActive = sortBy === sortField;
    return (
      <button
        onClick={() => handleSort(field)}
        className={cn(
          'flex items-center gap-1 text-xs font-semibold text-cream-300 hover:text-orange-400 transition-colors uppercase tracking-wide',
          isActive && 'text-orange-400'
        )}
      >
        {children}
        {isActive ? (
          sortOrder === 'asc' ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : (
          <ChevronUp className="w-3 h-3 opacity-30" />
        )}
      </button>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-olive-600">
            <th className="px-4 py-3 text-left">
              <SortButton field="name" backendField="name">Name</SortButton>
            </th>
            <th className="px-4 py-3 text-left hidden md:table-cell">
              <span className="text-xs font-semibold text-cream-300 uppercase tracking-wide">Category</span>
            </th>
            <th className="px-4 py-3 text-left hidden lg:table-cell">
              <span className="text-xs font-semibold text-cream-300 uppercase tracking-wide">Brand</span>
            </th>
            <th className="px-4 py-3 text-left hidden xl:table-cell">
              <span className="text-xs font-semibold text-cream-300 uppercase tracking-wide">Specs</span>
            </th>
            <th className="px-4 py-3 text-right">
              <SortButton field="price" backendField="price">Price</SortButton>
            </th>
            <th className="px-4 py-3 text-center w-24">
              <span className="text-xs font-semibold text-cream-300 uppercase tracking-wide">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => {
            const partsArray = selectedParts.get(part.category) || [];
            const isSelected = partsArray.some(p => p.id === part.id);
            const hasImageError = imageErrors.has(part.id);

            return (
              <tr
                key={part.id}
                className={cn(
                  'border-b border-olive-700/50 hover:bg-olive-800/50 transition-colors',
                  isSelected && 'bg-orange-500/10'
                )}
              >
                {/* Name & Image */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-olive-800 rounded-lg overflow-hidden border border-olive-700/50">
                      {part.image_url && !hasImageError ? (
                        <Image
                          src={part.image_url}
                          alt={part.name}
                          fill
                          className="object-contain p-2 sm:p-3"
                          sizes="(max-width: 640px) 80px, 96px"
                          unoptimized={part.image_url.includes('harborfreight.com') || part.image_url.includes('amazon.com') || part.image_url.includes('m.media-amazon.com')}
                          onError={() => {
                            setImageErrors((prev) => new Set(prev).add(part.id));
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                          <Image
                            src="/placeholders/placeholder-part-v1.svg"
                            alt="Part placeholder"
                            width={48}
                            height={48}
                            className="object-contain opacity-40"
                          />
                        </div>
                      )}
                      {/* Category badge overlay */}
                      <Badge
                        className="absolute top-1 left-1 opacity-90 z-10"
                        variant="default"
                        size="sm"
                      >
                        {getCategoryLabel(part.category).split(' ')[0]}
                      </Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/parts/${part.slug}`}
                        className="block font-semibold text-cream-100 hover:text-orange-400 transition-colors line-clamp-2 mb-1"
                      >
                        {part.name}
                      </Link>
                      <p className="text-xs text-cream-400 uppercase tracking-wide">{part.brand}</p>
                    </div>
                  </div>
                </td>

                {/* Category (hidden on mobile) */}
                <td className="px-4 py-4 hidden md:table-cell">
                  <Badge variant="default" size="sm">
                    {getCategoryLabel(part.category)}
                  </Badge>
                </td>

                {/* Brand (hidden on tablet) */}
                <td className="px-4 py-4 hidden lg:table-cell">
                  <span className="text-sm text-cream-300 uppercase tracking-wide">{part.brand}</span>
                </td>

                {/* Specs (hidden on smaller screens) */}
                <td className="px-4 py-4 hidden xl:table-cell">
                  {part.specifications && Object.keys(part.specifications).length > 0 ? (
                    <div className="flex flex-col gap-1 text-xs text-cream-400">
                      {Object.entries(part.specifications)
                        .slice(0, 2)
                        .map(([key, value]) => (
                          <span key={key}>
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>:{' '}
                            <span className="text-cream-200 font-medium">{String(value)}</span>
                          </span>
                        ))}
                    </div>
                  ) : (
                    <span className="text-xs text-cream-400/50">—</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-4 py-4 text-right">
                  <span className="font-bold text-lg text-orange-400">
                    {part.price ? formatPrice(part.price) : 'Contact'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {part.affiliate_url && (
                      <a
                        href={part.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-700 rounded-md transition-colors"
                        title="Buy Now"
                        aria-label="Buy Now"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Button
                      variant={isSelected ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => onAddToBuild?.(part)}
                      icon={isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      className="min-w-[80px]"
                    >
                      {isSelected ? 'Added' : 'Add'}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {parts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-cream-400">No parts found</p>
        </div>
      )}
    </div>
  );
}
