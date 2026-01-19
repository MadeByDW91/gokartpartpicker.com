'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TableActions } from '@/components/admin/DataTable';
import { 
  DollarSign, 
  Link as LinkIcon, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  ExternalLink,
  Filter,
  Download,
  Lightbulb
} from 'lucide-react';
import { AffiliateOptimization } from './AffiliateOptimization';
import { 
  getAffiliateLinkStats, 
  getAffiliateLinkItems,
  checkAffiliateLink 
} from '@/actions/admin/affiliate-analytics';
import type { AffiliateLinkStats, AffiliateLinkItem } from '@/actions/admin/affiliate-analytics';
import type { ActionResult } from '@/lib/api/types';

export function AffiliateAnalytics() {
  const [stats, setStats] = useState<AffiliateLinkStats | null>(null);
  const [items, setItems] = useState<AffiliateLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all' as 'engine' | 'part' | 'all',
    status: 'all' as 'active' | 'broken' | 'missing' | 'all',
    program: 'all' as 'amazon' | 'ebay' | 'other' | 'all',
  });
  const [checkingLinks, setCheckingLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResult, itemsResult] = await Promise.all([
        getAffiliateLinkStats(),
        getAffiliateLinkItems(filters),
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        setError('error' in statsResult ? statsResult.error : 'Failed to load stats');
      }

      if (itemsResult.success && itemsResult.data) {
        setItems(itemsResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckLink = async (item: AffiliateLinkItem) => {
    if (!item.affiliate_url) return;

    setCheckingLinks(prev => new Set(prev).add(item.id));

    try {
      const result = await checkAffiliateLink(item.affiliate_url);
      // Could update item status here if needed
    } catch (err) {
      console.error('Link check failed:', err);
    } finally {
      setCheckingLinks(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const statusColors = {
    active: 'success',
    broken: 'error',
    missing: 'warning',
  } as const;

  const programColors = {
    amazon: 'default',
    ebay: 'secondary',
    other: 'warning',
  } as const;

  const columns = [
    {
      key: 'name',
      header: 'Item',
      render: (item: AffiliateLinkItem) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-cream-100">{item.name}</span>
            <Badge variant="default" className="text-xs">
              {item.type}
            </Badge>
          </div>
          <Link
            href={`/${item.type === 'engine' ? 'engines' : 'parts'}/${item.slug}`}
            target="_blank"
            className="text-xs text-cream-400 hover:text-orange-400 flex items-center gap-1"
          >
            View Page
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AffiliateLinkItem) => (
        <Badge variant={statusColors[item.status]}>
          {item.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
          {item.status === 'broken' && <XCircle className="w-3 h-3 mr-1" />}
          {item.status === 'missing' && <AlertCircle className="w-3 h-3 mr-1" />}
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'program',
      header: 'Program',
      render: (item: AffiliateLinkItem) => (
        item.program ? (
          <Badge variant={programColors[item.program] as 'default' | 'warning' | 'info'}>
            {item.program.charAt(0).toUpperCase() + item.program.slice(1)}
          </Badge>
        ) : (
          <span className="text-cream-500">—</span>
        )
      ),
    },
    {
      key: 'link',
      header: 'Affiliate Link',
      render: (item: AffiliateLinkItem) => (
        item.affiliate_url ? (
          <div className="flex items-center gap-2">
            <a
              href={item.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-400 hover:text-orange-300 truncate max-w-xs"
            >
              {item.affiliate_url.substring(0, 50)}...
            </a>
            <button
              onClick={() => handleCheckLink(item)}
              disabled={checkingLinks.has(item.id)}
              className="p-1 text-cream-400 hover:text-orange-400 transition-colors"
              title="Check link"
            >
              <RefreshCw className={`w-3 h-3 ${checkingLinks.has(item.id) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : (
          <span className="text-cream-500 text-sm">No link</span>
        )
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (item: AffiliateLinkItem) => (
        <TableActions>
          <Link
            href={`/admin/${item.type === 'engine' ? 'engines' : 'parts'}/${item.id}`}
            className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
            title="Edit"
          >
            <LinkIcon className="w-4 h-4" />
          </Link>
        </TableActions>
      ),
    },
  ];

  if (loading && !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-cream-400">Loading affiliate analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cream-400">Total Links</p>
                  <p className="text-2xl font-bold text-cream-100 mt-1">{stats.active}</p>
                </div>
                <LinkIcon className="w-8 h-8 text-orange-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cream-400">Missing Links</p>
                  <p className="text-2xl font-bold text-cream-100 mt-1">{stats.missing}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cream-400">Coverage</p>
                  <p className="text-2xl font-bold text-cream-100 mt-1">
                    {Math.round((stats.active / stats.total) * 100)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cream-400">By Program</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="default" className="text-xs">
                      Amazon: {stats.byProgram.amazon}
                    </Badge>
                    <Badge variant="info" className="text-xs">
                      eBay: {stats.byProgram.ebay}
                    </Badge>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-orange-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coverage Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-cream-100">Engine Coverage</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cream-400">With Links</span>
                  <span className="text-cream-100 font-semibold">
                    {stats.coverage.engines.withLinks} / {stats.coverage.engines.total}
                  </span>
                </div>
                <div className="w-full bg-olive-800 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.coverage.engines.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-cream-400">{stats.coverage.engines.percentage}% coverage</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-cream-100">Parts Coverage</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cream-400">With Links</span>
                  <span className="text-cream-100 font-semibold">
                    {stats.coverage.parts.withLinks} / {stats.coverage.parts.total}
                  </span>
                </div>
                <div className="w-full bg-olive-800 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.coverage.parts.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-cream-400">{stats.coverage.parts.percentage}% coverage</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-cream-100">Filter Links</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
              >
                <option value="all">All Types</option>
                <option value="engine">Engines</option>
                <option value="part">Parts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="broken">Broken</option>
                <option value="missing">Missing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-2">Program</label>
              <select
                value={filters.program}
                onChange={(e) => setFilters({ ...filters, program: e.target.value as any })}
                className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
              >
                <option value="all">All Programs</option>
                <option value="amazon">Amazon</option>
                <option value="ebay">eBay</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cream-100">
              Affiliate Links ({items.length})
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          <DataTable
            columns={columns}
            data={items}
            loading={loading}
            emptyMessage="No affiliate links found"
            keyExtractor={(item) => `${item.type}-${item.id}`}
          />
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <AffiliateOptimization />
    </div>
  );
}
