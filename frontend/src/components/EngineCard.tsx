'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Gauge, ExternalLink, Plus, FileText, Ruler, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { Engine } from '@/types/database';

/**
 * Get engine badge SVG path based on brand
 */
function getEngineBadge(brand: string): string | null {
  const brandLower = brand.toLowerCase();
  if (brandLower.includes('predator')) return '/badges/badge-engine-predator-v1.svg';
  if (brandLower.includes('clone')) return '/badges/badge-engine-clone-v1.svg';
  if (brandLower.includes('tillotson')) return '/badges/badge-engine-tillotson-v1.svg';
  if (brandLower.includes('briggs')) return '/badges/badge-engine-briggs-v1.svg';
  return null;
}

interface EngineCardProps {
  engine: Engine;
  onAddToBuild?: (engine: Engine) => void;
  isSelected?: boolean;
  showAddButton?: boolean;
  variant?: 'grid' | 'compact';
}

export function EngineCard({ 
  engine, 
  onAddToBuild, 
  isSelected = false,
  showAddButton = true,
  variant = 'grid'
}: EngineCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Reset error state if image_url changes
  useEffect(() => {
    setImageError(false);
  }, [engine.image_url]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the link or button
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    // Navigate to engine detail page
    router.push(`/engines/${engine.slug}`);
  };

  // Compact variant - modern, professional horizontal layout
  if (variant === 'compact') {
    return (
      <Card 
        variant={isSelected ? 'accent' : 'default'} 
        hoverable 
        className={cn(
          "overflow-hidden group cursor-pointer transition-all duration-300",
          isSelected 
            ? "border-orange-500/60 bg-gradient-to-r from-orange-500/10 to-transparent shadow-md" 
            : "border-olive-700/50 hover:border-orange-500/40 hover:shadow-lg"
        )}
        onClick={handleCardClick}
      >
        <div className="flex gap-4 p-4">
          {/* Compact Image */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 rounded-lg bg-white overflow-hidden border border-olive-700/40">
            
            {engine.image_url && !imageError ? (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <Image
                  src={engine.image_url}
                  alt={engine.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)',
                    WebkitFilter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)'
                  }}
                  unoptimized={engine.image_url.includes('harborfreight.com') || engine.image_url.includes('amazon.com') || engine.image_url.includes('m.media-amazon.com')}
                  sizes="144px"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/placeholders/placeholder-engine-v1.svg"
                  alt="Engine placeholder"
                  width={60}
                  height={60}
                  className="opacity-20"
                />
              </div>
            )}
            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-md border border-olive-900 z-10">
                <Plus className="w-3 h-3 text-white rotate-45" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Title */}
              <div>
                <Link 
                  href={`/engines/${engine.slug}`}
                  className="text-base font-bold text-cream-100 hover:text-orange-400 transition-colors line-clamp-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {engine.name}
                </Link>
                {!getEngineBadge(engine.brand) && (
                  <p className="text-xs text-cream-500 mt-0.5 font-medium">{engine.brand}</p>
                )}
              </div>
              
              {/* Compact Specs - Clean Pills */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
                  <Zap className="w-3 h-3 text-orange-400 shrink-0" />
                  <span className="text-xs font-bold text-cream-100 tabular-nums">{engine.horsepower}</span>
                  <span className="text-xs text-cream-400">HP</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <Gauge className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="text-xs font-bold text-cream-100 tabular-nums">{engine.displacement_cc}</span>
                  <span className="text-xs text-cream-400">cc</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <Ruler className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="text-xs font-bold text-cream-100 tabular-nums">{engine.shaft_diameter}&quot;</span>
                </div>
              </div>
            </div>
            
            {/* Price & Action */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-olive-700/30">
              <div className="flex items-baseline gap-1.5">
                {engine.price ? (
                  <>
                    <span className="text-lg font-bold text-orange-400 tabular-nums">
                      {formatPrice(engine.price)}
                    </span>
                    <span className="text-[10px] text-cream-500/70 uppercase tracking-wide">Est.</span>
                  </>
                ) : (
                  <span className="text-sm text-cream-500">Price on request</span>
                )}
              </div>
              
              {showAddButton && (
                <Button
                  variant={isSelected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToBuild?.(engine);
                  }}
                  icon={isSelected ? undefined : <Plus className="w-4 h-4" />}
                  className={cn(
                    "shrink-0 font-semibold",
                    isSelected && "bg-olive-700/50 border-olive-600/50"
                  )}
                >
                  {isSelected ? 'Selected' : 'Add'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default grid variant - modern, professional design
  return (
    <Card 
      variant={isSelected ? 'accent' : 'default'} 
      hoverable 
      className={cn(
        "overflow-hidden group cursor-pointer transition-all duration-300",
        isSelected 
          ? "border-orange-500/60 bg-gradient-to-br from-orange-500/10 to-transparent shadow-lg shadow-orange-500/10" 
          : "border-olive-700/50 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5"
      )}
      onClick={handleCardClick}
    >
      {/* Image Section - Larger, More Integrated */}
      <div className="relative h-56 sm:h-64 bg-white overflow-hidden">
        
        {engine.image_url && !imageError ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
            <Image
              src={engine.image_url}
              alt={engine.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)',
                WebkitFilter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)'
              }}
              unoptimized={engine.image_url.includes('harborfreight.com') || engine.image_url.includes('amazon.com') || engine.image_url.includes('m.media-amazon.com')}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/placeholders/placeholder-engine-v1.svg"
              alt="Engine placeholder"
              width={120}
              height={120}
              className="opacity-20"
            />
          </div>
        )}
        
        {/* Brand Badge - Top Right Corner */}
        {getEngineBadge(engine.brand) ? (
          <div className="absolute top-3 right-3 w-10 h-10 sm:w-12 sm:h-12 bg-olive-900/90 backdrop-blur-sm rounded-lg border border-olive-700/40 p-1.5 shadow-lg z-10">
            <Image
              src={getEngineBadge(engine.brand)!}
              alt={`${engine.brand} badge`}
              fill
              className="object-contain"
            />
          </div>
        ) : null}
        
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg border-2 border-olive-900 z-10">
            <Plus className="w-3.5 h-3.5 text-white rotate-45" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Title Section */}
        <div className="space-y-0.5">
          <Link 
            href={`/engines/${engine.slug}`}
            className="text-base sm:text-lg font-bold text-cream-100 hover:text-orange-400 transition-colors line-clamp-2 leading-snug"
            onClick={(e) => e.stopPropagation()}
          >
            {engine.name}
          </Link>
          {!getEngineBadge(engine.brand) && (
            <p className="text-xs text-cream-500 font-medium">{engine.brand}</p>
          )}
        </div>
        
        {/* Specs - Clean, Consistent Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-colors">
            <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 tabular-nums">{engine.horsepower}</span>
            <span className="text-xs text-cream-400">HP</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
            <Gauge className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 tabular-nums">{engine.displacement_cc}</span>
            <span className="text-xs text-cream-400">cc</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-colors">
            <Ruler className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 tabular-nums">{engine.shaft_diameter}&quot;</span>
          </div>
        </div>
        
        {/* Price & Action - Clean Separation */}
        <div className="pt-2 border-t border-olive-700/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {engine.price ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-orange-400 tabular-nums">
                    {formatPrice(engine.price)}
                  </span>
                  <span className="text-[10px] text-cream-500/70 uppercase tracking-wide">Est.</span>
                </div>
              ) : (
                <span className="text-sm text-cream-500">Price on request</span>
              )}
            </div>
            
            {showAddButton && (
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToBuild?.(engine);
                }}
                icon={isSelected ? undefined : <Plus className="w-4 h-4" />}
                className={cn(
                  "shrink-0 font-semibold",
                  isSelected && "bg-olive-700/50 border-olive-600/50"
                )}
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
