'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ExternalLink, Plus, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, getCategoryLabel, cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
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
  compact = false 
}: PartCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Reset error state if image_url changes
  useEffect(() => {
    setImageError(false);
  }, [part.image_url]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the link or button
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    // Navigate to part detail page
    router.push(`/parts/${part.slug}`);
  };

  return (
    <Card 
      variant={isSelected ? 'accent' : 'default'} 
      hoverable 
      className={cn(
        "overflow-hidden group cursor-pointer transition-all",
        isSelected && "ring-2 ring-orange-500"
      )}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className={`relative ${compact ? 'h-32' : 'h-40'} bg-olive-800 overflow-hidden`}>
        {part.image_url && !imageError ? (
          <Image
            src={part.image_url}
            alt={part.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={part.image_url.includes('harborfreight.com') || part.image_url.includes('amazon.com') || part.image_url.includes('m.media-amazon.com')}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            src="/placeholders/placeholder-part-v1.svg"
            alt="Part placeholder"
            fill
            className="object-contain p-4 opacity-60"
          />
        )}
        {/* Category Badge */}
        <Badge className="absolute top-2 left-2" variant="default" size="sm">
          {getCategoryLabel(part.category)}
        </Badge>
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-cream-100" />
          </div>
        )}
      </div>
      
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        {/* Brand */}
        <p className="text-xs text-cream-400 uppercase tracking-wide mb-1">
          {part.brand}
        </p>
        
        {/* Title */}
        <Link 
          href={`/parts/${part.slug}`}
          className={`font-bold text-cream-100 hover:text-orange-400 transition-colors line-clamp-2 ${
            compact ? 'text-sm' : 'text-base'
          }`}
        >
          {part.name}
        </Link>
        
        {/* Key Specs (if available) */}
        {!compact && part.specifications && Object.keys(part.specifications).length > 0 && (
          <div className="mt-2 text-xs text-cream-400">
            {Object.entries(part.specifications).slice(0, 2).map(([key, value]) => (
              <span key={key} className="mr-3">
                {key.replace(/_/g, ' ')}: <span className="text-cream-200">{String(value)}</span>
              </span>
            ))}
          </div>
        )}
        
        {/* Price & Actions */}
        <div className={`flex items-center justify-between ${compact ? 'mt-2' : 'mt-3 pt-3 border-t border-olive-600'}`}>
          <span className={`font-bold text-orange-400 ${compact ? 'text-lg' : 'text-xl'}`}>
            {part.price ? formatPrice(part.price) : 'Contact'}
          </span>
          
          <div className="flex items-center gap-1">
            {part.affiliate_url && !compact && (
              <a
                href={part.affiliate_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="p-1.5 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded-md transition-colors"
                title="Buy Now (affiliate link)"
                aria-label="Buy Now (affiliate link)"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
            {showAddButton && (
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onAddToBuild?.(part);
                }}
                icon={isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                className={compact ? 'px-2 py-1 text-xs' : ''}
              >
                {compact ? '' : isSelected ? 'Selected' : 'Add'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
