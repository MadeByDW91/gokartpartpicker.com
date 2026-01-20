'use client';

import { useState } from 'react';
import { useTemplates } from '@/hooks/use-templates';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { Sparkles, Rocket, Zap, Wallet, GraduationCap, Trophy, Baby } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BuildTemplate, TemplateGoal } from '@/types/database';
import { TEMPLATE_GOALS } from '@/types/database';

const GOAL_LABELS: Record<TemplateGoal, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  speed: { label: 'Speed', icon: Rocket },
  torque: { label: 'Torque', icon: Zap },
  budget: { label: 'Budget', icon: Wallet },
  beginner: { label: 'Beginner', icon: GraduationCap },
  competition: { label: 'Competition', icon: Trophy },
  kids: { label: 'Kids', icon: Baby },
};

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<TemplateGoal | undefined>();
  const [previewTemplate, setPreviewTemplate] = useState<BuildTemplate | null>(null);
  
  const { data: templates, isLoading, error } = useTemplates(selectedGoal);

  const handleApplyTemplate = (template: BuildTemplate) => {
    router.push(`/builder?template=${template.id}`);
  };

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-orange-400" />
            <h1 className="text-display text-3xl sm:text-4xl text-cream-100">
              Build Templates
            </h1>
          </div>
          <p className="text-cream-400 max-w-2xl">
            Get started quickly with preset builds for common goals. Apply a template to the builder and customize it to your needs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter: compact pill row */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm text-cream-400 mr-1">Show:</span>
          <button
            onClick={() => setSelectedGoal(undefined)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedGoal === undefined
                ? 'bg-orange-500 text-cream-100'
                : 'bg-olive-700 text-cream-400 hover:bg-olive-600 hover:text-cream-300 border border-olive-600'
            )}
          >
            All
          </button>
          {TEMPLATE_GOALS.map((goal) => {
            const config = GOAL_LABELS[goal];
            const Icon = config.icon;
            const isActive = selectedGoal === goal;
            return (
              <button
                key={goal}
                onClick={() => setSelectedGoal(goal)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  isActive ? 'bg-orange-500 text-cream-100' : 'bg-olive-700 text-cream-400 hover:bg-olive-600 hover:text-cream-300 border border-olive-600'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[var(--error)]">Failed to load templates. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-4/5 mb-2" />
                  <Skeleton className="h-3 w-16 mb-4" />
                  <Skeleton className="h-4 w-2/5 mb-5" />
                  <div className="h-px bg-olive-600/60 mb-5" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!templates || templates.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 text-olive-600 mx-auto mb-4" />
              <h2 className="text-xl text-cream-100 mb-2">No Templates Found</h2>
              <p className="text-cream-400">
                {selectedGoal
                  ? `No ${GOAL_LABELS[selectedGoal].label.toLowerCase()} templates available yet.`
                  : 'No templates available yet.'}
              </p>
              <p className="text-sm text-cream-500 mt-3">
                Run the build_templates seed migration if you haven’t yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Templates Grid */}
        {!isLoading && !error && templates && templates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onApply={(t) => {
                  setPreviewTemplate(t);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onApply={() => {
            handleApplyTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}
