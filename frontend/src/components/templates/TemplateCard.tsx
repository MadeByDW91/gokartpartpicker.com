'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatPrice, cn } from '@/lib/utils';
import type { BuildTemplate } from '@/types/database';
import { Package, Zap, Gauge, DollarSign, ArrowRight } from 'lucide-react';
import {
  Rocket,
  GraduationCap,
  Trophy,
  Baby,
  Mountain,
  Car,
  Flag,
  Wallet,
} from 'lucide-react';

interface TemplateCardProps {
  template: BuildTemplate;
  onApply?: (template: BuildTemplate) => void;
}

const GOAL_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  speed: { label: 'Speed', icon: Rocket },
  torque: { label: 'Torque', icon: Zap },
  budget: { label: 'Budget', icon: Wallet },
  beginner: { label: 'Beginner', icon: GraduationCap },
  competition: { label: 'Competition', icon: Trophy },
  kids: { label: 'Kids', icon: Baby },
  offroad: { label: 'Off-Road', icon: Mountain },
  onroad: { label: 'On-Road', icon: Car },
  racing: { label: 'Racing', icon: Flag },
};

export function TemplateCard({ template, onApply }: TemplateCardProps) {
  const engine = template.engine;
  const imageUrl = engine?.image_url;
  const goalConfig = GOAL_CONFIG[template.goal] || { label: template.goal, icon: Package };
  const GoalIcon = goalConfig.icon;

  // Parse template name for build type and engine name
  const nameParts = (template.name || '').includes(' – ')
    ? (template.name || '').split(' – ')
    : null;
  const buildType = nameParts?.[0] || '';
  const engineName = nameParts && nameParts.length >= 2 ? nameParts.slice(1).join(' – ') : template.name;

  return (
    <Card 
      hoverable 
      className={cn(
        "overflow-hidden group cursor-pointer transition-all duration-300",
        "border-olive-700/50 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5"
      )}
    >
      {/* Image Section - White background like EngineCard */}
      <div className="relative h-48 sm:h-56 bg-white overflow-hidden">
        {imageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
            <Image
              src={imageUrl}
              alt={engine?.name || 'Template'}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)',
                WebkitFilter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.05) contrast(1.1)'
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/placeholders/placeholder-engine-v1.svg"
              alt="Template placeholder"
              width={100}
              height={100}
              className="opacity-20"
            />
          </div>
        )}
        
        {/* Goal Badge - Top Left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-olive-900/90 backdrop-blur-sm border border-olive-700/40 shadow-lg z-10">
          <GoalIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="text-xs font-semibold text-cream-100">{goalConfig.label}</span>
        </div>
      </div>
      
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Title Section */}
        <div className="space-y-0.5">
          {buildType && (
            <p className="text-xs font-medium text-orange-400 uppercase tracking-wide">
              {buildType}
            </p>
          )}
          <h3 className="text-base sm:text-lg font-bold text-cream-100 line-clamp-2 leading-snug">
            {engineName}
          </h3>
        </div>
        
        {template.description && (
          <p className="text-sm text-cream-500 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}
        
        {/* Specs - Clean Pills like EngineCard */}
        <div className="flex flex-wrap gap-2">
          {template.total_price && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-colors">
              <DollarSign className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="text-xs font-bold text-cream-100 tabular-nums">{formatPrice(template.total_price)}</span>
            </div>
          )}
          {template.estimated_hp && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-cream-100 tabular-nums">{template.estimated_hp}</span>
              <span className="text-xs text-cream-400">HP</span>
            </div>
          )}
          {template.estimated_torque && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
              <Gauge className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-cream-100 tabular-nums">{template.estimated_torque}</span>
              <span className="text-xs text-cream-400">lb-ft</span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <div className="pt-2 border-t border-olive-700/30">
          {onApply ? (
            <Button
              variant="primary"
              size="sm"
              className="w-full font-semibold"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onApply(template)}
            >
              Apply to Builder
            </Button>
          ) : (
            <Link href={`/builder?template=${template.id}`} className="block">
              <Button
                variant="primary"
                size="sm"
                className="w-full font-semibold"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Apply to Builder
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
