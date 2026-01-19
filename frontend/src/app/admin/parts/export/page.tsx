'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Download, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { exportPartsCSV } from '@/actions/admin/export';

export default function ExportPartsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await exportPartsCSV();

      if (result.success) {
        if (result.data) {
          // Download CSV file
          const blob = new Blob([result.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `parts-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      } else {
        setError(result.error || 'Export failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-display text-3xl text-cream-100">Export Parts</h1>
        <p className="text-cream-300 mt-1">
          Export all parts to CSV format
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Export Parts</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-olive-700/50 rounded-md">
            <FileText className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-cream-100">CSV Export</p>
              <p className="text-xs text-cream-400 mt-1">
                Download all parts with all fields as CSV
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push('/admin/parts')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading}
              loading={loading}
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
