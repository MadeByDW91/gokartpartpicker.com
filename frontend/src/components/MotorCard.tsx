'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Battery, Gauge, ExternalLink, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';
import type { ElectricMotor } from '@/types/database';

interface MotorCardProps {
  motor: ElectricMotor;
  onAddToBuild?: (motor: ElectricMotor) => void;
  isSelected?: boolean;
  showAddButton?: boolean;
}

export function MotorCard({ 
  motor, 
  onAddToBuild, 
  isSelected = false,
  showAddButton = true 
}: MotorCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Reset error state if image_url changes
  useEffect(() => {
    setImageError(false);
  }, [motor.image_url]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the link or button
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    // Navigate to motor detail page
    router.push(`/motors/${motor.slug}`);
  };

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
        
        {motor.image_url && !imageError ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
            <Image
              src={motor.image_url}
              alt={motor.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)',
                WebkitFilter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)'
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/placeholders/placeholder-engine-v1.svg"
              alt="Motor placeholder"
              width={120}
              height={120}
              className="opacity-20"
            />
          </div>
        )}
        
        {/* Voltage Badge - Top Right */}
        <Badge className="absolute top-3 right-3 bg-olive-900/90 backdrop-blur-sm border-olive-700/50 shadow-lg z-10" variant="default">
          {motor.voltage}V
        </Badge>
        
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
            href={`/motors/${motor.slug}`}
            className="text-base sm:text-lg font-bold text-cream-100 hover:text-orange-400 transition-colors line-clamp-2 leading-snug"
            onClick={(e) => e.stopPropagation()}
          >
            {motor.name}
          </Link>
          {motor.brand && (
            <p className="text-xs text-cream-500 font-medium">{motor.brand}</p>
          )}
        </div>
        
        {/* Specs - Clean, Consistent Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-colors">
            <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 tabular-nums">{motor.horsepower}</span>
            <span className="text-xs text-cream-400">HP</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
            <Battery className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 tabular-nums">{motor.voltage}</span>
            <span className="text-xs text-cream-400">V</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-colors">
            <Gauge className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-xs font-bold text-cream-100 tabular-nums">{motor.power_kw}</span>
            <span className="text-xs text-cream-400">kW</span>
          </div>
          {motor.torque_lbft && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
              <Gauge className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-cream-100 tabular-nums">{motor.torque_lbft}</span>
              <span className="text-xs text-cream-400">lb-ft</span>
            </div>
          )}
        </div>
        
        {/* Price & Action - Clean Separation */}
        <div className="pt-2 border-t border-olive-700/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {motor.price ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-orange-400 tabular-nums">
                    {formatPrice(motor.price)}
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
                  onAddToBuild?.(motor);
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
          
          {/* Affiliate Link */}
          {motor.affiliate_url && (
            <a
              href={motor.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-cream-400 hover:text-orange-400 transition-colors mt-2"
              title="View Product"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Buy Now</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
