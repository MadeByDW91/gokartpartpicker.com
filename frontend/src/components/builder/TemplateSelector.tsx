'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, ChevronDown, Rocket, Zap, Wallet, GraduationCap, Trophy, Baby, Loader2, X, Mountain, Car, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BuildTemplate, TemplateGoal } from '@/types/database';

const GOAL_ICONS: Record<TemplateGoal, React.ComponentType<{ className?: string }>> = {
  speed: Rocket,
  torque: Zap,
  budget: Wallet,
  beginner: GraduationCap,
  competition: Trophy,
  kids: Baby,
  offroad: Mountain,
  onroad: Car,
  racing: Flag,
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

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        icon={<Sparkles className="w-4 h-4" />}
        className="min-h-[44px] touch-manipulation"
        aria-label="Select template"
        aria-expanded={isOpen}
      >
        <span className="hidden sm:inline">Templates</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform flex-shrink-0', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <>
          {/* Mobile: Full-screen drawer with backdrop */}
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="flex-1 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer Panel */}
            <div className="w-[85vw] max-w-sm bg-olive-900 border-l border-olive-700 shadow-xl flex flex-col">
              <Card className="h-full flex flex-col shadow-xl border-0 md:border md:rounded-lg bg-olive-900">
              {/* Header */}
              <div className="p-4 border-b border-olive-600 bg-olive-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-cream-100">Quick Start Templates</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded-md transition-colors touch-manipulation"
                  aria-label="Close templates"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-4 space-y-4 safe-area-bottom">
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
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="capitalize">{goal}</span>
                        </div>
                        <div className="space-y-1.5 pl-6">
                          {goalTemplates.slice(0, 3).map((template) => (
                            <button
                              key={template.id}
                              onClick={() => handleApplyTemplate(template.id)}
                              className="w-full text-left p-3 min-h-[44px] rounded-md bg-olive-700/50 hover:bg-olive-700 border border-olive-600 hover:border-orange-500/50 transition-all group touch-manipulation active:bg-olive-600"
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
                              className="w-full text-left p-2.5 min-h-[44px] text-xs text-cream-400 hover:text-orange-400 transition-colors touch-manipulation rounded-md hover:bg-olive-700/30"
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
                      className="mt-3 text-sm text-orange-400 hover:text-orange-300 min-h-[44px] px-4 py-2 rounded-md hover:bg-olive-700/30 touch-manipulation"
                    >
                      Browse all templates
                    </button>
                  </div>
                )}
              </div>
              
              {/* Footer - View All Button */}
              <div className="p-4 border-t border-olive-600 bg-olive-800 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full min-h-[44px] touch-manipulation"
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
          </div>
          
          {/* Desktop: Dropdown positioned from button */}
          <div className="hidden md:block absolute right-0 top-full mt-2 w-96 max-w-[90vw] z-50">
            {/* Backdrop for desktop (transparent overlay for click-outside-to-close) */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <Card className="max-h-[600px] overflow-hidden flex flex-col shadow-xl border-olive-600 z-50 relative bg-olive-900">
              {/* Header */}
              <div className="p-4 border-b border-olive-600 bg-olive-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-cream-100">Quick Start Templates</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded-md transition-colors touch-manipulation"
                  aria-label="Close templates"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Scrollable Content */}
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
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="capitalize">{goal}</span>
                        </div>
                        <div className="space-y-1.5 pl-6">
                          {goalTemplates.slice(0, 3).map((template) => (
                            <button
                              key={template.id}
                              onClick={() => handleApplyTemplate(template.id)}
                              className="w-full text-left p-3 min-h-[44px] rounded-md bg-olive-700/50 hover:bg-olive-700 border border-olive-600 hover:border-orange-500/50 transition-all group touch-manipulation active:bg-olive-600"
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
                              className="w-full text-left p-2.5 min-h-[44px] text-xs text-cream-400 hover:text-orange-400 transition-colors touch-manipulation rounded-md hover:bg-olive-700/30"
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
                      className="mt-3 text-sm text-orange-400 hover:text-orange-300 min-h-[44px] px-4 py-2 rounded-md hover:bg-olive-700/30 touch-manipulation"
                    >
                      Browse all templates
                    </button>
                  </div>
                )}
              </div>
              
              {/* Footer - View All Button */}
              <div className="p-4 border-t border-olive-600 bg-olive-800 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full min-h-[44px] touch-manipulation"
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
