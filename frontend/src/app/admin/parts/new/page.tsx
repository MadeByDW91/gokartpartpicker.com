import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PartForm } from '@/components/admin/PartForm';

export default function NewPartPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/parts"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Parts
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Add New Part</h1>
        <p className="text-cream-300 mt-1">
          Create a new part in the catalog
        </p>
      </div>

      {/* Form */}
      <PartForm mode="create" />
    </div>
  );
}
