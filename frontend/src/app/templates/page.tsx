'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { TemplatesListing } from '@/components/templates/TemplatesListing';
import type { TemplateGoal } from '@/types/database';
import { TEMPLATE_GOALS } from '@/types/database';

function isValidGoal(g: string): g is TemplateGoal {
  return TEMPLATE_GOALS.includes(g as TemplateGoal);
}

function TemplatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalParam = searchParams.get('goal');
  const [selectedGoal, setSelectedGoal] = useState<TemplateGoal | undefined>(() =>
    goalParam && isValidGoal(goalParam) ? goalParam : undefined
  );

  useEffect(() => {
    if (goalParam && isValidGoal(goalParam) && goalParam !== selectedGoal) {
      setSelectedGoal(goalParam);
    }
  }, [goalParam]);

  const updateUrl = useCallback(
    (goal: TemplateGoal | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (goal) params.set('goal', goal);
      else params.delete('goal');
      const q = params.toString();
      router.replace(q ? `/templates?${q}` : '/templates', { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-800/90 via-olive-800 to-olive-900" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(201,106,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,106,36,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-olive-700/50">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Sparkles className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-display text-3xl sm:text-4xl font-bold text-cream-100 tracking-tight">
                Build Templates
              </h1>
              <p className="text-cream-400 mt-1 max-w-xl">
                Pre-built configurations for common goals. Apply a template to the builder and customize it.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplatesListing
          initialGoal={selectedGoal}
          onGoalChange={(goal) => {
            setSelectedGoal(goal);
            updateUrl(goal);
          }}
        />
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-olive-900 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Sparkles className="w-10 h-10 text-olive-600" />
            <p className="text-sm text-cream-500">Loading templates…</p>
          </div>
        </div>
      }
    >
      <TemplatesPageContent />
    </Suspense>
  );
}
