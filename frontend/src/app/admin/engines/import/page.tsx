'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CSVImporter } from '@/components/admin/CSVImporter';
import { useRouter } from 'next/navigation';

export default function ImportEnginesPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/engines"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Engines
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Import Engines</h1>
        <p className="text-cream-300 mt-1">
          Bulk import engines from CSV file
        </p>
      </div>

      <CSVImporter type="engines" onImportComplete={() => {
        // Refresh or redirect after import
        router.push('/admin/engines');
      }} />
    </div>
  );
}
