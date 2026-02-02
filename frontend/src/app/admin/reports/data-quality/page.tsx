'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, RefreshCw, AlertTriangle, CheckCircle, Info, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/admin/DataTable';
import { getDataQualityReport, type DataQualityReport, type DataQualityScore } from '@/actions/admin/reports';
import { cn } from '@/lib/utils';

export default function DataQualityPage() {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterScore, setFilterScore] = useState<number | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDataQualityReport();
      if (result.success && result.data) {
        setReport(result.data);
      } else {
        setError('error' in result ? result.error : 'Failed to load data quality report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'success' as const, label: 'Excellent' };
    if (score >= 70) return { variant: 'warning' as const, label: 'Good' };
    if (score >= 50) return { variant: 'default' as const, label: 'Fair' };
    return { variant: 'error' as const, label: 'Poor' };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const filteredScores = report?.itemScores.filter(
    (item) => filterScore === null || item.score <= filterScore
  ) || [];

  type Row = DataQualityScore & { id: string };
  const dataWithId: Row[] = filteredScores.map((s) => ({
    ...s,
    id: `${s.entityType}-${s.entityId}`,
  }));

  const columns: Array<{
    key: string;
    header: string;
    className?: string;
    render: (item: Row) => ReactNode;
  }> = [
    {
      key: 'entityName',
      header: 'Item',
      render: (item: DataQualityScore) => (
        <div>
          <p className="font-medium text-cream-100">{item.entityName}</p>
          <p className="text-xs text-cream-400 capitalize">{item.entityType}</p>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      render: (item: DataQualityScore) => {
        const badge = getScoreBadge(item.score);
        return (
          <div className="flex items-center gap-2">
            <span className={cn('text-lg font-bold', getScoreColor(item.score))}>
              {item.score}
            </span>
            <Badge variant={badge.variant} size="sm">
              {badge.label}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'completeness',
      header: 'Completeness',
      render: (item: DataQualityScore) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-olive-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${item.completeness * 100}%` }}
            />
          </div>
          <span className="text-xs text-cream-400 w-12 text-right">
            {Math.round(item.completeness * 100)}%
          </span>
        </div>
      ),
    },
    {
      key: 'issues',
      header: 'Issues',
      render: (item: DataQualityScore) => (
        <div className="flex flex-wrap gap-1">
          {item.issues.slice(0, 3).map((issue, idx) => (
            <Badge
              key={idx}
              variant="default"
              size="sm"
              className={cn('text-xs', getSeverityColor(issue.severity))}
            >
              {issue.field}
            </Badge>
          ))}
          {item.issues.length > 3 && (
            <Badge variant="default" size="sm" className="text-xs">
              +{item.issues.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (item: DataQualityScore) => (
        <Link
          href={`/admin/${item.entityType === 'motor' ? 'motors' : `${item.entityType}s`}/${item.entityId}`}
        >
          <Button size="sm" variant="secondary">
            Fix
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Reports
          </Link>
          <h1 className="text-display text-3xl text-cream-100">Data Quality Scorecard</h1>
        </div>
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error || 'Failed to load report'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Reports
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-3xl text-cream-100">Data Quality Scorecard</h1>
            <p className="text-cream-300 mt-1">
              Monitor catalog completeness and identify improvement opportunities
            </p>
          </div>
          <Button
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchReport}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Overall Data Quality</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className={cn('text-6xl font-bold mb-2', getScoreColor(report.overallScore))}>
                {report.overallScore}
              </div>
              <Badge variant={getScoreBadge(report.overallScore).variant} size="md">
                {getScoreBadge(report.overallScore).label}
              </Badge>
              <p className="text-cream-400 mt-2">Out of 100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-cream-100">Engines</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={cn('text-4xl font-bold mb-2', getScoreColor(report.categoryScores.engines))}>
                {report.categoryScores.engines}
              </div>
              <Badge variant={getScoreBadge(report.categoryScores.engines).variant}>
                {getScoreBadge(report.categoryScores.engines).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-cream-100">Electric Motors</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={cn('text-4xl font-bold mb-2', getScoreColor(report.categoryScores.motors))}>
                {report.categoryScores.motors}
              </div>
              <Badge variant={getScoreBadge(report.categoryScores.motors).variant}>
                {getScoreBadge(report.categoryScores.motors).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-cream-100">Parts</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={cn('text-4xl font-bold mb-2', getScoreColor(report.categoryScores.parts))}>
                {report.categoryScores.parts}
              </div>
              <Badge variant={getScoreBadge(report.categoryScores.parts).variant}>
                {getScoreBadge(report.categoryScores.parts).label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide">Total Items</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">{report.summary.totalItems}</p>
              </div>
              <FileText className="w-8 h-8 text-cream-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide">Items with Issues</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{report.summary.itemsWithIssues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide">Critical Issues</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{report.summary.criticalIssues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide">Warnings</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">{report.summary.warnings}</p>
              </div>
              <Info className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Issues */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Top Issues</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.topIssues.map((issue, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-olive-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="default"
                    size="sm"
                    className={cn(getSeverityColor(issue.severity))}
                  >
                    {issue.severity}
                  </Badge>
                  <span className="text-cream-200 capitalize">{issue.field.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-cream-400 font-medium">{issue.count} items</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items with Low Scores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cream-100">Items Needing Attention</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setFilterScore(filterScore === 50 ? null : 50)}
              >
                {filterScore === 50 ? 'Show All' : 'Show ≤50'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setFilterScore(filterScore === 70 ? null : 70)}
              >
                {filterScore === 70 ? 'Show All' : 'Show ≤70'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={dataWithId}
            loading={false}
            emptyMessage="No items with quality issues found. Great job! 🎉"
            keyExtractor={(item) => item.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
