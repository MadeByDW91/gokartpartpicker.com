import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { EngineForm } from '@/components/admin/EngineForm';

export default function NewEnginePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/engines"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Engines
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Add New Engine</h1>
        <p className="text-cream-300 mt-1">
          Create a new engine in the catalog
        </p>
      </div>

      {/* Form */}
      <EngineForm mode="create" />
    </div>
  );
}
