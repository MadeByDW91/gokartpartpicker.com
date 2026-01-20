'use client';

import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { Sparkles, Rocket, Zap, Wallet, GraduationCap, Trophy, Baby, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BuildTemplate, TemplateGoal } from '@/types/database';

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

export function TemplateQuickAccess() {
  const router = useRouter();
  const { data: templates, isLoading } = useTemplates();

  if (isLoading || !templates || templates.length === 0) {
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
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {quickTemplateEntries.map(([goal, template]) => {
          const Icon = GOAL_ICONS[goal as TemplateGoal] || Sparkles;
          return (
            <button
              key={template.id}
              onClick={() => router.push(`/builder?template=${template.id}`)}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg',
                'bg-olive-800 border border-olive-600 hover:border-orange-500/50',
                'hover:bg-olive-700 transition-all group',
                'min-w-[180px] sm:min-w-[200px]'
              )}
            >
              <div className={cn(
                'p-2 rounded-md bg-olive-700 group-hover:bg-orange-500/20 transition-colors',
                'flex-shrink-0'
              )}>
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs text-cream-500 mb-0.5 capitalize">{GOAL_LABELS[goal as TemplateGoal] || goal}</p>
                <p className="text-sm font-medium text-cream-100 truncate group-hover:text-orange-400 transition-colors">
                  {template.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
