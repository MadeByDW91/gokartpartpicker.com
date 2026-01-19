import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { GuideForm } from '@/components/admin/GuideForm';

export default function NewGuidePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/guides"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Guides
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Create New Guide</h1>
        <p className="text-cream-300 mt-1">
          Create a new installation guide or tutorial
        </p>
      </div>

      {/* Form */}
      <GuideForm mode="create" />
    </div>
  );
}
