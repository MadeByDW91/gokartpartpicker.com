'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart, Upload, PenLine } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { AmazonProductImporter } from '@/components/admin/AmazonProductImporter';
import { CSVImporter } from '@/components/admin/CSVImporter';
import { PartForm } from '@/components/admin/PartForm';

type TabId = 'amazon' | 'csv' | 'manual';

const TABS: { value: TabId; label: string; icon: React.ReactNode }[] = [
  { value: 'amazon', label: 'From Amazon', icon: <ShoppingCart className="w-4 h-4" /> },
  { value: 'csv', label: 'From CSV', icon: <Upload className="w-4 h-4" /> },
  { value: 'manual', label: 'Create manually', icon: <PenLine className="w-4 h-4" /> },
];

function getInitialTab(searchParams: URLSearchParams): TabId {
  const m = searchParams.get('method');
  if (m === 'amazon' || m === 'csv' || m === 'manual') return m;
  return 'amazon';
}

export default function AddPartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabId>(() => getInitialTab(searchParams));

  // Sync tab from URL on load and when navigating back
  useEffect(() => {
    const m = searchParams.get('method');
    if (m === 'amazon' || m === 'csv' || m === 'manual') setTab(m);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    const next = value as TabId;
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set('method', next);
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const handleImportComplete = () => {
    router.push('/admin/parts');
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/parts"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Parts
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Add Part</h1>
        <p className="text-cream-300 mt-1">
          Ingest parts from Amazon, CSV, or create one manually—all in one place.
        </p>
      </div>

      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={handleTabChange}
        className="w-full sm:w-auto"
      />

      <div className="min-h-[400px]">
        {tab === 'amazon' && <AmazonProductImporter />}
        {tab === 'csv' && (
          <CSVImporter type="parts" onImportComplete={handleImportComplete} />
        )}
        {tab === 'manual' && <PartForm mode="create" />}
      </div>
    </div>
  );
}
