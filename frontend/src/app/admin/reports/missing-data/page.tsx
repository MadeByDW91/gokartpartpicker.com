'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Download, Pencil, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/admin/DataTable';
import { getMissingDataReport, exportMissingDataReport } from '@/actions/admin/reports';
import type { AdminEngine, AdminPart } from '@/types/admin';

interface MissingDataReport {
  engines: {
    missingPrice: AdminEngine[];
    missingImage: AdminEngine[];
    missingAffiliate: AdminEngine[];
    missingNotes: AdminEngine[];
  };
  parts: {
    missingPrice: AdminPart[];
    missingImage: AdminPart[];
    missingAffiliate: AdminPart[];
    missingBrand: AdminPart[];
  };
}

type ReportSection = 'engines-price' | 'engines-image' | 'engines-affiliate' | 'engines-notes' | 'parts-price' | 'parts-image' | 'parts-affiliate' | 'parts-brand';

export default function MissingDataReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<MissingDataReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ReportSection>('engines-price');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getMissingDataReport();
        
        if (result.success && result.data) {
          setReport(result.data);
        } else if (!result.success) {
          setError('error' in result ? result.error : 'Failed to load report');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const result = await exportMissingDataReport();

      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `missing-data-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Export failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const getCurrentData = () => {
    if (!report) return [];

    const [type, field] = activeSection.split('-');
    
    // Map field names to report keys
    const fieldMap: Record<string, keyof typeof report.engines | keyof typeof report.parts> = {
      'price': 'missingPrice',
      'image': 'missingImage',
      'affiliate': 'missingAffiliate',
      'notes': 'missingNotes',
      'brand': 'missingBrand',
    };
    
    const reportKey = fieldMap[field];
    if (!reportKey) return [];
    
    if (type === 'engines') {
      const engineData = report.engines[reportKey as keyof typeof report.engines] as AdminEngine[] | undefined;
      if (!engineData || !Array.isArray(engineData)) return [];
      return engineData.map(e => ({ ...e, type: 'engine' }));
    } else {
      const partData = report.parts[reportKey as keyof typeof report.parts] as AdminPart[] | undefined;
      if (!partData || !Array.isArray(partData)) return [];
      return partData.map(p => ({ ...p, type: 'part' }));
    }
  };

  const sections = [
    { id: 'engines-price' as const, label: 'Engines Missing Price', count: report?.engines.missingPrice.length || 0 },
    { id: 'engines-image' as const, label: 'Engines Missing Image', count: report?.engines.missingImage.length || 0 },
    { id: 'engines-affiliate' as const, label: 'Engines Missing Affiliate Link', count: report?.engines.missingAffiliate.length || 0 },
    { id: 'engines-notes' as const, label: 'Engines Missing Notes', count: report?.engines.missingNotes.length || 0 },
    { id: 'parts-price' as const, label: 'Parts Missing Price', count: report?.parts.missingPrice.length || 0 },
    { id: 'parts-image' as const, label: 'Parts Missing Image', count: report?.parts.missingImage.length || 0 },
    { id: 'parts-affiliate' as const, label: 'Parts Missing Affiliate Link', count: report?.parts.missingAffiliate.length || 0 },
    { id: 'parts-brand' as const, label: 'Parts Missing Brand', count: report?.parts.missingBrand.length || 0 },
  ];

  const currentData = getCurrentData();

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (item: any) => (
        <div>
          <p className="font-medium text-cream-100">{item.name}</p>
          {item.slug && (
            <p className="text-xs text-cream-400">{item.slug}</p>
          )}
        </div>
      ),
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (item: any) => (
        <span className="text-cream-300">{item.brand || '—'}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: any) => {
        if (item.type === 'part' && item.category) {
          return <span className="text-cream-300 capitalize">{item.category.replace('_', ' ')}</span>;
        }
        return '—';
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (item: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const path = item.type === 'engine' 
              ? `/admin/engines/${item.id}`
              : `/admin/parts/${item.id}`;
            router.push(path);
          }}
          icon={<Pencil className="w-4 h-4" />}
        >
          Edit
        </Button>
      ),
    },
  ];

  const totalMissing = sections.reduce((sum, section) => sum + section.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-3xl text-cream-100">Missing Data Report</h1>
            <p className="text-cream-300 mt-1">
              {loading ? 'Loading...' : `${totalMissing} items need attention`}
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting || !report}
            loading={exporting}
            variant="secondary"
            icon={exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-4 rounded-lg border transition-colors text-left ${
              activeSection === section.id
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-olive-600 bg-olive-700/50 hover:border-olive-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-cream-100">{section.label}</p>
              <Badge variant={section.count > 0 ? 'warning' : 'success'}>
                {section.count}
              </Badge>
            </div>
            <p className="text-xs text-cream-400">
              {section.count === 0 ? 'All complete' : `${section.count} missing`}
            </p>
          </button>
        ))}
      </div>

      {/* Current Section Data */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
            <p className="text-cream-400">Loading report...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            <p className="text-sm text-cream-400 mt-1">
              {currentData.length} item{currentData.length !== 1 ? 's' : ''} with missing data
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={currentData}
              loading={false}
              emptyMessage="All items have this data. Great job!"
              keyExtractor={(item) => item.id}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
