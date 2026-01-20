'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, CheckCircle, ThumbsUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { markGuideHelpful } from '@/actions/guides';
import { PrintableGuide } from './PrintableGuide';
import type { GuideWithSteps } from '@/types/guides';
import { sanitizeForDisplay } from '@/lib/sanitization';

interface GuideViewerProps {
  guide: GuideWithSteps;
  engineName?: string;
}

export function GuideViewer({ guide, engineName }: GuideViewerProps) {
  const [helpfulCount, setHelpfulCount] = useState(guide.helpful_count);
  const [hasVoted, setHasVoted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleMarkHelpful = async () => {
    if (hasVoted) return;
    
    const result = await markGuideHelpful(guide.id, true);
    if (result.success && result.data) {
      setHelpfulCount(result.data.helpful_count);
      setHasVoted(true);
    }
  };

  const toggleStepComplete = (stepNumber: number) => {
    const newSet = new Set(completedSteps);
    if (newSet.has(stepNumber)) {
      newSet.delete(stepNumber);
    } else {
      newSet.add(stepNumber);
    }
    setCompletedSteps(newSet);
  };

  const isMaintenanceGuide = guide.category === 'Maintenance';

  return (
    <div className="space-y-6">
      {/* Printable Guide Component (for maintenance guides) */}
      {isMaintenanceGuide && (
        <PrintableGuide guide={guide} engineName={engineName} />
      )}

      {/* Featured Image */}
      {guide.featured_image_url && (
        <div className="relative w-full h-64 md:h-96 bg-olive-800 rounded-lg overflow-hidden">
          <Image
            src={guide.featured_image_url}
            alt={guide.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Introduction */}
      {guide.body && (
        <Card>
          <CardContent className="pt-6">
            <div 
              className="prose prose-invert max-w-none text-cream-300 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-2 [&_strong]:text-cream-100 [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(guide.body) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      {guide.steps && guide.steps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-cream-100 mb-4">Step-by-Step Instructions</h2>
          {guide.steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.step_number);
            
            return (
              <Card key={step.id} className={isCompleted ? 'border-green-500/50 bg-green-500/5' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      isCompleted 
                        ? 'bg-green-500 text-cream-100' 
                        : 'bg-orange-500 text-cream-100'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : step.step_number}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-semibold text-cream-100">
                          {step.title}
                        </h3>
                        <button
                          onClick={() => toggleStepComplete(step.step_number)}
                          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                            isCompleted
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-olive-700 text-cream-400 hover:bg-olive-600'
                          }`}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {step.description && (
                        <p className="text-cream-300 mb-3">{step.description}</p>
                      )}
                      
                      {/* Instructions */}
                      <div className="prose prose-invert max-w-none text-cream-300 mb-4 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-2 [&_strong]:text-cream-100 [&_strong]:font-semibold">
                        <div dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(step.instructions) }} />
                      </div>
                      
                      {/* Image */}
                      {step.image_url && (
                        <div className="relative w-full h-64 bg-olive-800 rounded-lg overflow-hidden mb-4">
                          <Image
                            src={step.image_url}
                            alt={step.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      
                      {/* Warning */}
                      {step.warning && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-yellow-400 mb-1">Warning</p>
                              <p className="text-cream-300 text-sm">{step.warning}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Tips */}
                      {step.tips && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-blue-400 mb-1">Tip</p>
                              <p className="text-cream-300 text-sm">{step.tips}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Helpful Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cream-100 font-semibold mb-1">Was this guide helpful?</p>
              <p className="text-sm text-cream-400">
                {helpfulCount} {helpfulCount === 1 ? 'person' : 'people'} found this helpful
              </p>
            </div>
            <Button
              variant={hasVoted ? 'secondary' : 'primary'}
              onClick={handleMarkHelpful}
              disabled={hasVoted}
              icon={<ThumbsUp className="w-4 h-4" />}
            >
              {hasVoted ? 'Thank you!' : 'Yes, helpful'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
