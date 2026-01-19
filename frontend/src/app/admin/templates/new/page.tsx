'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TemplateForm } from '@/components/admin/TemplateForm';

export default function NewTemplatePage() {
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
        <h1 className="text-display text-3xl text-cream-100">New Template</h1>
        <p className="text-cream-300 mt-1">Create a new build template</p>
      </div>

      <TemplateForm mode="create" />
    </div>
  );
}
