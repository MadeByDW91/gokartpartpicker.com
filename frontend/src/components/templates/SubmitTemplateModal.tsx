'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { createTemplate } from '@/actions/templates';
import { useBuildStore } from '@/store/build-store';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { TEMPLATE_GOALS, type TemplateGoal } from '@/types/database';
import type { BuildTemplate } from '@/types/database';

interface SubmitTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (template: BuildTemplate) => void;
}

export function SubmitTemplateModal({ isOpen, onClose, onSuccess }: SubmitTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<TemplateGoal>('beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { selectedEngine, selectedParts, getTotalPrice, getPartIds } = useBuildStore();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!selectedEngine && selectedParts.size === 0) {
      setError('Please select an engine or parts before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        goal,
        engine_id: selectedEngine?.id || undefined,
        parts: getPartIds(),
        total_price: getTotalPrice(),
        estimated_hp: selectedEngine?.horsepower || undefined,
        estimated_torque: selectedEngine?.torque || undefined,
        is_public: true,
        is_active: true,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(result.data);
          onClose();
          setName('');
          setDescription('');
          setGoal('beginner');
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit template');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const GOAL_LABELS: Record<TemplateGoal, string> = {
    speed: 'Speed',
    torque: 'Torque',
    budget: 'Budget',
    beginner: 'Beginner',
    competition: 'Competition',
    kids: 'Kids',
    offroad: 'Off-Road',
    onroad: 'On-Road',
    racing: 'Racing',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-olive-900/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-lg">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-display text-xl text-cream-100">Submit Template</h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-4 h-4" />} />
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-cream-100 mb-2">Template Submitted!</h3>
              <p className="text-cream-400">
                Your template is pending admin approval. You&apos;ll be notified once it&apos;s reviewed.
              </p>
            </div>
          ) : (
            <>
              <div>
                <Input
                  label="Template Name"
                  placeholder="Budget Racer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-cream-300 mb-2 block">
                  Goal
                </label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_GOALS.map((g) => (
                    <Button
                      key={g}
                      variant={goal === g ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setGoal(g)}
                    >
                      {GOAL_LABELS[g]}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-cream-300 mb-2 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this template build..."
                  className="w-full h-24 bg-olive-800 border border-olive-600 rounded px-3 py-2 text-cream-100 placeholder-cream-500 resize-none"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-olive-800 rounded-lg border border-olive-600">
                <h3 className="text-sm font-semibold text-cream-100 mb-2">Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cream-400">Engine:</span>
                    <span className="text-cream-100">
                      {selectedEngine ? `${selectedEngine.brand} ${selectedEngine.name}` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream-400">Parts:</span>
                    <span className="text-cream-100">{selectedParts.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream-400">Total Price:</span>
                    <span className="text-orange-400 font-bold">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[rgba(166,61,64,0.2)] border border-[rgba(166,61,64,0.3)] rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[var(--error)]" />
                  <p className="text-sm text-[var(--error)]">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  className="flex-1"
                  loading={isSubmitting}
                  disabled={!name.trim() || (!selectedEngine && selectedParts.size === 0)}
                >
                  Submit for Approval
                </Button>
              </div>

              <p className="text-xs text-cream-500 text-center">
                Templates require admin approval before being made public.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
