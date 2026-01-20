'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, ChevronDown, Rocket, Zap, Wallet, GraduationCap, Trophy, Baby, Loader2 } from 'lucide-react';
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

interface TemplateSelectorProps {
  className?: string;
}

export function TemplateSelector({ className }: TemplateSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: templates, isLoading } = useTemplates();

  const handleApplyTemplate = (templateId: string) => {
    router.push(`/builder?template=${templateId}`);
    setIsOpen(false);
  };

  // Group templates by goal for compact display
  const templatesByGoal = templates?.reduce((acc, template) => {
    const goal = template.goal || 'beginner';
    if (!acc[goal]) acc[goal] = [];
    acc[goal].push(template);
    return acc;
  }, {} as Record<string, BuildTemplate[]>) || {};

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        icon={<Sparkles className="w-4 h-4" />}
        className="min-h-[44px]"
      >
        <span className="hidden sm:inline">Templates</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
            <Card className="max-h-[600px] overflow-hidden flex flex-col shadow-xl border-olive-600">
              <div className="p-4 border-b border-olive-600 bg-olive-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-cream-100">Quick Start Templates</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-cream-400 hover:text-cream-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                  </div>
                ) : templates && templates.length > 0 ? (
                  Object.entries(templatesByGoal).map(([goal, goalTemplates]) => {
                    const Icon = GOAL_ICONS[goal as TemplateGoal] || Sparkles;
                    return (
                      <div key={goal} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-cream-300">
                          <Icon className="w-4 h-4" />
                          <span className="capitalize">{goal}</span>
                        </div>
                        <div className="space-y-1.5 pl-6">
                          {goalTemplates.slice(0, 3).map((template) => (
                            <button
                              key={template.id}
                              onClick={() => handleApplyTemplate(template.id)}
                              className="w-full text-left p-2.5 rounded-md bg-olive-700/50 hover:bg-olive-700 border border-olive-600 hover:border-orange-500/50 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-cream-100 truncate group-hover:text-orange-400 transition-colors">
                                    {template.name}
                                  </p>
                                  {template.estimated_hp && (
                                    <p className="text-xs text-cream-500 mt-0.5">
                                      ~{template.estimated_hp} HP
                                    </p>
                                  )}
                                </div>
                                <Sparkles className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-0.5" />
                              </div>
                            </button>
                          ))}
                          {goalTemplates.length > 3 && (
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                router.push(`/templates?goal=${goal}`);
                              }}
                              className="w-full text-left p-2 text-xs text-cream-400 hover:text-orange-400 transition-colors"
                            >
                              +{goalTemplates.length - 3} more {goal} templates
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-olive-600 mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-cream-400">No templates available</p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/templates');
                      }}
                      className="mt-3 text-sm text-orange-400 hover:text-orange-300"
                    >
                      Browse all templates
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-olive-600 bg-olive-800">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/templates');
                  }}
                >
                  View All Templates
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
