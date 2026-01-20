'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Gauge, ExternalLink, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
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
}

export function EngineCard({ 
  engine, 
  onAddToBuild, 
  isSelected = false,
  showAddButton = true 
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

  return (
    <Card 
      variant={isSelected ? 'accent' : 'default'} 
      hoverable 
      className="overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 lg:h-56 bg-olive-800 overflow-hidden">
        {engine.image_url && !imageError ? (
          <Image
            src={engine.image_url}
            alt={engine.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={engine.image_url.includes('harborfreight.com') || engine.image_url.includes('amazon.com') || engine.image_url.includes('m.media-amazon.com')}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            src="/placeholders/placeholder-engine-v1.svg"
            alt="Engine placeholder"
            fill
            className="object-contain p-4 opacity-60"
          />
        )}
        {/* Engine Brand Badge */}
        {getEngineBadge(engine.brand) ? (
          <div className="absolute top-3 left-3 w-16 h-16">
            <Image
              src={getEngineBadge(engine.brand)!}
              alt={`${engine.brand} badge`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <Badge className="absolute top-3 left-3" variant="default">
            {engine.brand}
          </Badge>
        )}
      </div>
      
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5">
        {/* Title */}
        <div>
          <Link 
            href={`/engines/${engine.slug}`}
            className="text-base sm:text-lg lg:text-xl font-bold text-cream-100 hover:text-orange-400 transition-colors line-clamp-2"
          >
            {engine.name}
          </Link>
        </div>
        
        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
            <span className="text-cream-300">
              <span className="font-bold text-cream-100">{engine.horsepower}</span> HP
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
            <span className="text-cream-300">
              <span className="font-bold text-cream-100">{engine.displacement_cc}</span> cc
            </span>
          </div>
          <div className="text-xs sm:text-sm text-cream-400">
            Shaft: {engine.shaft_diameter}&quot; {engine.shaft_type}
          </div>
          <div className="text-xs sm:text-sm text-cream-400">
            Torque: {engine.torque} lb-ft
          </div>
        </div>
        
        {/* Price & Actions */}
        <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-olive-600">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {engine.price ? (
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-400">
                {formatPrice(engine.price)}
              </span>
            ) : (
              <span className="text-base sm:text-lg text-cream-400">—</span>
            )}
            
            <div className="flex items-center gap-2">
              {showAddButton && (
                <Button
                  variant={isSelected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToBuild?.(engine);
                  }}
                  icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="min-h-[44px] px-3 sm:px-4 touch-manipulation"
                >
                  {isSelected ? 'Selected' : 'Add'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Harbor Freight Link for Predator Engines */}
          {engine.brand.toLowerCase().includes('predator') ? (
            <a
              href="https://www.harborfreight.com/brands/predator/engines.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-cream-400 hover:text-orange-400 transition-colors group py-1.5 sm:py-2 touch-manipulation min-h-[44px]"
              title="View Predator Engines on Harbor Freight"
            >
              <ExternalLink className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>View on Harbor Freight</span>
            </a>
          ) : engine.affiliate_url ? (
            <a
              href={engine.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-cream-400 hover:text-orange-400 transition-colors group py-1.5 sm:py-2 touch-manipulation min-h-[44px]"
              title="View Product"
            >
              <ExternalLink className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Buy Now</span>
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
