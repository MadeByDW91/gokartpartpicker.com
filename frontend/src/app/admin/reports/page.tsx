'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  BarChart3,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ReportTab = 'missing-data' | 'data-quality' | 'export';

export default function ReportsHubPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('missing-data');

  const tabs = [
    { id: 'missing-data' as const, label: 'Missing Data', icon: AlertTriangle, href: '/admin/reports/missing-data' },
    { id: 'data-quality' as const, label: 'Data Quality', icon: TrendingUp, href: '/admin/reports/data-quality' },
    { id: 'export' as const, label: 'Export', icon: Download, href: '/admin/reports/export' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display text-3xl text-cream-100">Reports Hub</h1>
        <p className="text-cream-300 mt-1">
          Monitor data quality, missing information, and export catalog data
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-olive-600">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                  // Navigate to the specific report page
                  window.location.href = tab.href;
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-cream-400 hover:text-cream-200 hover:border-olive-500'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Missing Data</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">Report</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <Link href="/admin/reports/missing-data">
              <Button variant="secondary" className="w-full mt-4" size="sm">
                View Report
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Data Quality</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">Scorecard</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <Link href="/admin/reports/data-quality">
              <Button variant="secondary" className="w-full mt-4" size="sm">
                View Scorecard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Export</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">Catalog</p>
              </div>
              <Download className="w-8 h-8 text-blue-400" />
            </div>
            <Link href="/admin/reports/export">
              <Button variant="secondary" className="w-full mt-4" size="sm">
                Export Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-cream-100 mb-2">About Reports</h3>
          <ul className="space-y-2 text-sm text-cream-300">
            <li>
              <strong className="text-cream-100">Missing Data:</strong> Identify items missing prices, images, affiliate links, and other critical fields
            </li>
            <li>
              <strong className="text-cream-100">Data Quality:</strong> Comprehensive scoring system to monitor catalog completeness and identify improvement opportunities
            </li>
            <li>
              <strong className="text-cream-100">Export:</strong> Download catalog data in CSV format for backup, analysis, or migration
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
