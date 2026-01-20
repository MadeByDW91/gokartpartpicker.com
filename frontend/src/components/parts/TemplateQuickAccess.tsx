'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { useParts } from '@/hooks/use-parts';
import { Button } from '@/components/ui/Button';
import { Sparkles, Rocket, Zap, Wallet, GraduationCap, Trophy, Baby, ArrowRight, ChevronDown, ChevronUp, Cog, Package } from 'lucide-react';
import { cn, getCategoryLabel, formatPrice } from '@/lib/utils';
import type { BuildTemplate, TemplateGoal, PartCategory } from '@/types/database';

const GOAL_ICONS: Record<TemplateGoal, React.ComponentType<{ className?: string }>> = {
  speed: Rocket,
  torque: Zap,
  budget: Wallet,
  beginner: GraduationCap,
  competition: Trophy,
  kids: Baby,
};

const GOAL_LABELS: Record<TemplateGoal, string> = {
  speed: 'Speed',
  torque: 'Torque',
  budget: 'Budget',
  beginner: 'Beginner',
  competition: 'Competition',
  kids: 'Kids',
};

interface ExpandedTemplateProps {
  template: BuildTemplate;
  parts: any[];
  onApply: () => void;
  onClose: () => void;
}

function ExpandedTemplate({ template, parts, onApply, onClose }: ExpandedTemplateProps) {
  const partEntries = Object.entries(template.parts || {});
  const partsMap = useMemo(() => {
    const map = new Map();
    parts.forEach(part => {
      if (part) map.set(part.id, part);
    });
    return map;
  }, [parts]);

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-olive-800 border border-olive-600 rounded-lg shadow-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-cream-100 mb-1">{template.name}</h3>
          {template.description && (
            <p className="text-sm text-cream-400 mb-2">{template.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-cream-500">
            {template.estimated_hp && (
              <span>~{template.estimated_hp} HP</span>
            )}
            {template.total_price && (
              <span>{formatPrice(template.total_price)}</span>
            )}
            {template.engine && (
              <span className="flex items-center gap-1">
                <Cog className="w-3 h-3" />
                {template.engine.name}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-cream-400 hover:text-cream-100 transition-colors ml-2"
        >
          ×
        </button>
      </div>

      {partEntries.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-cream-400 mb-2 uppercase tracking-wide">Parts Included</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {partEntries.map(([category, partId]) => {
              const part = partsMap.get(partId);
              return (
                <div
                  key={category}
                  className="flex items-center gap-2 p-2 rounded-md bg-olive-700/50 border border-olive-600"
                >
                  <Package className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cream-500 capitalize">{getCategoryLabel(category as PartCategory)}</p>
                    <p className="text-sm text-cream-100 truncate">
                      {part ? part.name : 'Part not found'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-olive-600">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onApply}
          className="flex-1"
        >
          Apply Template
        </Button>
      </div>
    </div>
  );
}

export function TemplateQuickAccess() {
  const router = useRouter();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: allParts } = useParts();
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  if (templatesLoading || !templates || templates.length === 0) {
    return null;
  }

  // Get one template per goal for quick access
  const quickTemplates = templates.reduce((acc, template) => {
    const goal = template.goal || 'beginner';
    if (!acc[goal] && acc[Object.keys(acc).length] === undefined) {
      acc[goal] = template;
    }
    return acc;
  }, {} as Record<string, BuildTemplate>);

  const quickTemplateEntries = Object.entries(quickTemplates).slice(0, 6);

  if (quickTemplateEntries.length === 0) {
    return null;
  }

  const handleTemplateClick = (templateId: string) => {
    setExpandedTemplateId(expandedTemplateId === templateId ? null : templateId);
  };

  const handleApplyTemplate = (templateId: string) => {
    router.push(`/builder?template=${templateId}`);
    setExpandedTemplateId(null);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-cream-100">Quick Start Templates</h2>
        </div>
        <button
          onClick={() => router.push('/templates')}
          className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide relative">
        {quickTemplateEntries.map(([goal, template]) => {
          const Icon = GOAL_ICONS[goal as TemplateGoal] || Sparkles;
          const isExpanded = expandedTemplateId === template.id;
          
          return (
            <div key={template.id} className="flex-shrink-0 relative min-w-[180px] sm:min-w-[200px]">
              <button
                onClick={() => handleTemplateClick(template.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-3 rounded-lg',
                  'bg-olive-800 border transition-all group',
                  isExpanded
                    ? 'border-orange-500 bg-olive-700'
                    : 'border-olive-600 hover:border-orange-500/50 hover:bg-olive-700'
                )}
              >
                <div className={cn(
                  'p-2 rounded-md transition-colors flex-shrink-0',
                  isExpanded
                    ? 'bg-orange-500/20'
                    : 'bg-olive-700 group-hover:bg-orange-500/20'
                )}>
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-cream-500 mb-0.5 capitalize">{GOAL_LABELS[goal as TemplateGoal] || goal}</p>
                  <p className="text-sm font-medium text-cream-100 truncate group-hover:text-orange-400 transition-colors">
                    {template.name}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-orange-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                )}
              </button>

              {isExpanded && allParts && (
                <ExpandedTemplate
                  template={template}
                  parts={allParts}
                  onApply={() => handleApplyTemplate(template.id)}
                  onClose={() => setExpandedTemplateId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
