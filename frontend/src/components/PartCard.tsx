'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ExternalLink, Plus, DollarSign, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, getCategoryLabel, cn } from '@/lib/utils';
import type { Part } from '@/types/database';

interface PartCardProps {
  part: Part;
  onAddToBuild?: (part: Part) => void;
  isSelected?: boolean;
  showAddButton?: boolean;
  compact?: boolean;
}

export function PartCard({
  part,
  onAddToBuild,
  isSelected = false,
  showAddButton = true,
  compact = false,
}: PartCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [part.image_url]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    router.push(`/parts/${part.slug}`);
  };

  // Compact variant: simpler layout for tight grids
  if (compact) {
    return (
      <Card
        variant={isSelected ? 'accent' : 'default'}
        hoverable
        className={cn(
          'overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col h-full',
          isSelected ? 'border-orange-500/60 bg-gradient-to-br from-orange-500/10 to-transparent' : 'border-olive-700/50 hover:border-orange-500/40'
        )}
        onClick={handleCardClick}
      >
        <div className="relative aspect-[4/3] sm:aspect-square bg-white overflow-hidden border-b border-olive-700/40">
          {part.image_url && !imageError ? (
            <Image
              src={part.image_url}
              alt={part.name}
              fill
              className="object-contain p-3 sm:p-4 transition-transform duration-300 group-hover:scale-105"
              unoptimized={
                part.image_url.includes('harborfreight.com') ||
                part.image_url.includes('amazon.com') ||
                part.image_url.includes('m.media-amazon.com')
              }
              sizes="144px"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/placeholders/placeholder-part-v1.svg" alt="" width={64} height={64} className="opacity-30" />
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-olive-800/90 border-l-2 border-l-orange-500 text-[10px] font-semibold text-cream-100 uppercase tracking-wide">
            {getCategoryLabel(part.category)}
          </div>
          {isSelected && (
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-md border border-olive-900 z-10">
              <Plus className="w-3 h-3 text-white rotate-45" />
            </div>
          )}
        </div>
        <CardContent className="p-3 flex flex-col flex-1 min-h-0">
          <Link
            href={`/parts/${part.slug}`}
            className="text-sm font-bold text-cream-100 hover:text-orange-400 line-clamp-2 leading-snug"
            onClick={(e) => e.stopPropagation()}
          >
            {part.name}
          </Link>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
              <Package className="w-2.5 h-2.5 text-orange-400 shrink-0" />
              <span className="text-[10px] font-bold text-cream-100">{getCategoryLabel(part.category)}</span>
            </div>
            {part.price != null && (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                <DollarSign className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-bold text-cream-100 tabular-nums">{formatPrice(part.price)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-olive-700/30">
            <span className="text-sm font-bold text-orange-400 tabular-nums">{part.price != null ? formatPrice(part.price) : 'Contact'}</span>
            {showAddButton && (
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToBuild?.(part);
                }}
                icon={isSelected ? undefined : <Plus className="w-3 h-3" />}
                className="shrink-0 text-xs"
              >
                {isSelected ? 'Selected' : 'Add'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default grid variant – match EngineCard layout
  return (
    <Card
      variant={isSelected ? 'accent' : 'default'}
      hoverable
      className={cn(
        'overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col h-full',
        isSelected
          ? 'border-orange-500/60 bg-gradient-to-br from-orange-500/10 to-transparent shadow-lg shadow-orange-500/10'
          : 'border-olive-700/50 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5'
      )}
      onClick={handleCardClick}
    >
      {/* Image section – white background like engine card */}
      <div className="relative h-56 sm:h-64 bg-white overflow-hidden">
        {part.image_url && !imageError ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
            <Image
              src={part.image_url}
              alt={part.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))',
                WebkitFilter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))',
              }}
              unoptimized={
                part.image_url.includes('harborfreight.com') ||
                part.image_url.includes('amazon.com') ||
                part.image_url.includes('m.media-amazon.com')
              }
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src="/placeholders/placeholder-part-v1.svg" alt="Part placeholder" width={120} height={120} className="opacity-20" />
          </div>
        )}
        {/* Category badge – top right with orange accent (like engine PREDATOR badge) */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-olive-800/95 backdrop-blur-sm border border-olive-700/50 shadow-lg z-10 border-l-2 border-l-orange-500">
          <span className="text-[10px] sm:text-xs font-bold text-cream-100 uppercase tracking-wide">
            {getCategoryLabel(part.category)}
          </span>
        </div>
        {isSelected && (
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg border-2 border-olive-900 z-10">
            <Plus className="w-3.5 h-3.5 text-white rotate-45" />
          </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Title – same hierarchy as engine card */}
        <div className="space-y-0.5">
          <Link
            href={`/parts/${part.slug}`}
            className="text-base sm:text-lg font-bold text-cream-100 hover:text-orange-400 transition-colors line-clamp-2 leading-snug"
            onClick={(e) => e.stopPropagation()}
          >
            {part.name}
          </Link>
          {part.brand && <p className="text-xs text-cream-500 font-medium">{part.brand}</p>}
        </div>

        {/* Spec chips – same style as engine card (3 pills) */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-colors">
            <Package className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100">{getCategoryLabel(part.category)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
            <DollarSign className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 tabular-nums">{part.price != null ? formatPrice(part.price) : '—'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-colors">
            <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 truncate max-w-[80px]" title={part.brand || undefined}>{part.brand || '—'}</span>
          </div>
        </div>

        {/* Price & actions – same layout as engine card */}
        <div className="pt-2 border-t border-olive-700/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {part.price != null ? (
                <span className="text-xl sm:text-2xl font-bold text-orange-400 tabular-nums">{formatPrice(part.price)}</span>
              ) : (
                <span className="text-sm text-cream-500">Contact for price</span>
              )}
              {part.affiliate_url && (
                <a
                  href={part.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600/50 rounded-md transition-colors"
                  title="Buy (affiliate link)"
                  aria-label="Buy (affiliate link)"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
            </div>
            {showAddButton && (
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToBuild?.(part);
                }}
                icon={isSelected ? undefined : <Plus className="w-4 h-4" />}
                className={cn('shrink-0 font-semibold', isSelected && 'bg-olive-700/50 border-olive-600/50')}
              >
                {isSelected ? 'Selected' : 'Add'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
