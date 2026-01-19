'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, BarChart3, TrendingUp, Users, Package, Cog } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { getAnalyticsMetrics, getCategoryDistribution, getBuildTrends } from '@/actions/admin/analytics';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AnalyticsMetrics {
  catalog: {
    totalEngines: number;
    totalParts: number;
    activeEngines: number;
    activeParts: number;
    partsWithPrice: number;
    partsWithImages: number;
    partsWithAffiliate: number;
  };
  topEngines: Array<{ id: string; name: string; views: number }>;
  topParts: Array<{ id: string; name: string; views: number }>;
  builds: {
    totalBuilds: number;
    publicBuilds: number;
    totalLikes: number;
    averagePartsPerBuild: number;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
  };
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<Array<{ category: string; count: number }>>([]);
  const [buildTrends, setBuildTrends] = useState<Array<{ date: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const [metricsResult, categoryResult, trendsResult] = await Promise.all([
          getAnalyticsMetrics(),
          getCategoryDistribution(),
          getBuildTrends(parseInt(dateRange, 10)),
        ]);

        if (metricsResult.success && metricsResult.data) {
          setMetrics(metricsResult.data);
        } else if (!metricsResult.success) {
          setError('error' in metricsResult ? metricsResult.error : 'Failed to load metrics');
        }

        if (categoryResult.success && categoryResult.data) {
          setCategoryDistribution(categoryResult.data);
        }

        if (trendsResult.success && trendsResult.data) {
          setBuildTrends(trendsResult.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">{error || 'Failed to load analytics'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Analytics Dashboard</h1>
              <p className="text-cream-300 mt-1">
                Business intelligence and performance metrics
              </p>
            </div>
          </div>
        </div>
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          options={[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
          ]}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-cream-100 mt-1">
                  {metrics.users.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-cream-400 mt-1">
                  {metrics.users.activeUsers} active (30 days)
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Total Builds</p>
                <p className="text-3xl font-bold text-cream-100 mt-1">
                  {metrics.builds.totalBuilds.toLocaleString()}
                </p>
                <p className="text-xs text-cream-400 mt-1">
                  {metrics.builds.publicBuilds} public
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Catalog Items</p>
                <p className="text-3xl font-bold text-cream-100 mt-1">
                  {(metrics.catalog.totalEngines + metrics.catalog.totalParts).toLocaleString()}
                </p>
                <p className="text-xs text-cream-400 mt-1">
                  {metrics.catalog.activeEngines} engines, {metrics.catalog.activeParts} parts
                </p>
              </div>
              <Package className="w-10 h-10 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Total Likes</p>
                <p className="text-3xl font-bold text-cream-100 mt-1">
                  {metrics.builds.totalLikes.toLocaleString()}
                </p>
                <p className="text-xs text-cream-400 mt-1">
                  Avg {metrics.builds.averagePartsPerBuild} parts/build
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catalog Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Catalog Quality</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md">
                <span className="text-sm text-cream-200">Parts with Price</span>
                <Badge variant={metrics.catalog.partsWithPrice > metrics.catalog.totalParts * 0.8 ? 'success' : 'warning'}>
                  {metrics.catalog.partsWithPrice} / {metrics.catalog.totalParts}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md">
                <span className="text-sm text-cream-200">Parts with Images</span>
                <Badge variant={metrics.catalog.partsWithImages > metrics.catalog.totalParts * 0.8 ? 'success' : 'warning'}>
                  {metrics.catalog.partsWithImages} / {metrics.catalog.totalParts}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md">
                <span className="text-sm text-cream-200">Parts with Affiliate Links</span>
                <Badge variant={metrics.catalog.partsWithAffiliate > metrics.catalog.totalParts * 0.5 ? 'success' : 'warning'}>
                  {metrics.catalog.partsWithAffiliate} / {metrics.catalog.totalParts}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Top Categories</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryDistribution.slice(0, 10).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-olive-700/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-cream-400 w-6">{index + 1}.</span>
                    <span className="text-sm text-cream-200 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="default" size="sm">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Engines */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Top Engines</h2>
            <p className="text-sm text-cream-400 mt-1">By views</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topEngines.slice(0, 10).map((engine, index) => (
                <div key={engine.id} className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-cream-400 w-6">{index + 1}.</span>
                    <span className="text-sm text-cream-200">{engine.name}</span>
                  </div>
                  <Badge variant="default" size="sm">
                    {engine.views} views
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Parts */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Top Parts</h2>
            <p className="text-sm text-cream-400 mt-1">By views</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topParts.slice(0, 10).map((part, index) => (
                <div key={part.id} className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-cream-400 w-6">{index + 1}.</span>
                    <span className="text-sm text-cream-200">{part.name}</span>
                  </div>
                  <Badge variant="default" size="sm">
                    {part.views} views
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Build Trends - Simple Bar Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Build Creation Trends</h2>
          <p className="text-sm text-cream-400 mt-1">Last {dateRange} days</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-2">
            {buildTrends.map((trend) => {
              const maxCount = Math.max(...buildTrends.map(t => t.count), 1);
              const height = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
              
              return (
                <div
                  key={trend.date}
                  className="flex-1 flex flex-col items-center gap-2"
                  title={`${trend.date}: ${trend.count} builds`}
                >
                  <div className="w-full bg-olive-700 rounded-t-md relative group">
                    <div
                      className="bg-orange-500 rounded-t-md transition-all hover:bg-orange-400"
                      style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-olive-800 border border-olive-600 rounded text-xs text-cream-200 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                      {trend.count} builds
                    </div>
                  </div>
                  <span className="text-xs text-cream-400 text-center transform -rotate-45 origin-top-left translate-x-2 whitespace-nowrap">
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
