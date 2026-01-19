'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { TemplateForm } from '@/components/admin/TemplateForm';
import { getTemplate } from '@/actions/templates';
import type { BuildTemplate } from '@/types/templates';

export default function EditTemplatePage() {
  const params = useParams();
  const id = params.id as string;
  const [template, setTemplate] = useState<BuildTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTemplate(id);

      if (result.success) {
        setTemplate(result.data);
      } else {
        setError(result.error || 'Failed to load template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/templates"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Templates
          </Link>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error || 'Template not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/templates"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Templates
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Edit Template</h1>
        <p className="text-cream-300 mt-1">{template.name}</p>
      </div>

      <TemplateForm template={template} mode="edit" />
    </div>
  );
}
