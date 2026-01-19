'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  MessageSquare, 
  FolderTree, 
  Pin, 
  Lock, 
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { getForumMetrics } from '@/actions/admin/forums';
import type { ForumMetrics } from '@/actions/admin/forums';

export default function AdminForumsDashboardPage() {
  const [metrics, setMetrics] = useState<ForumMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getForumMetrics();
        if (result.success) {
          setMetrics(result.data as ForumMetrics);
        } else {
          setError(result.error || 'Failed to load metrics');
        }
      } catch (err) {
        console.error('Error fetching forum metrics:', err);
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-olive-700 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-olive-800 border-olive-600">
              <CardContent className="p-6">
                <div className="h-20 bg-olive-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <p className="text-cream-100 text-lg mb-2">Failed to load forum metrics</p>
          <p className="text-cream-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Topics',
      value: metrics.totalTopics.toLocaleString(),
      icon: MessageSquare,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      href: '/admin/forums/topics',
    },
    {
      title: 'Total Posts',
      value: metrics.totalPosts.toLocaleString(),
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      href: '/admin/forums/posts',
    },
    {
      title: 'Categories',
      value: metrics.totalCategories.toLocaleString(),
      icon: FolderTree,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      href: '/admin/forums/categories',
    },
    {
      title: 'Active Users (24h)',
      value: metrics.activeUsers24h.toLocaleString(),
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Topics Created (24h)',
      value: metrics.topicsCreated24h.toLocaleString(),
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Posts Created (24h)',
      value: metrics.postsCreated24h.toLocaleString(),
      icon: FileText,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Pinned Topics',
      value: metrics.pinnedTopics.toLocaleString(),
      icon: Pin,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Locked Topics',
      value: metrics.lockedTopics.toLocaleString(),
      icon: Lock,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100 mb-2">Forums Dashboard</h1>
          <p className="text-cream-400">
            Manage and moderate your community forums
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href || '#'}
            className={stat.href ? 'block' : 'block pointer-events-none'}
          >
            <Card className="bg-olive-800 border-olive-600 hover:border-orange-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.href && (
                    <ArrowRight className="w-4 h-4 text-cream-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-cream-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-cream-100">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-olive-800 border-olive-600">
          <CardHeader>
            <CardTitle className="text-cream-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/forums/topics">
              <Button variant="secondary" className="w-full justify-start" icon={<MessageSquare className="w-4 h-4" />}>
                Manage Topics
              </Button>
            </Link>
            <Link href="/admin/forums/categories">
              <Button variant="secondary" className="w-full justify-start" icon={<FolderTree className="w-4 h-4" />}>
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/forums/posts">
              <Button variant="secondary" className="w-full justify-start" icon={<FileText className="w-4 h-4" />}>
                Manage Posts
              </Button>
            </Link>
            <Link href="/admin/forums/flagged">
              <Button variant="secondary" className="w-full justify-start" icon={<AlertCircle className="w-4 h-4" />}>
                Flagged Content
                {metrics.flaggedContentCount > 0 && (
                  <Badge variant="error" className="ml-2">
                    {metrics.flaggedContentCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-olive-800 border-olive-600">
          <CardHeader>
            <CardTitle className="text-cream-100">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-cream-300">Active Users (24h)</span>
                <span className="text-cream-100 font-semibold">{metrics.activeUsers24h}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream-300">Topics Created (24h)</span>
                <span className="text-cream-100 font-semibold">{metrics.topicsCreated24h}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream-300">Posts Created (24h)</span>
                <span className="text-cream-100 font-semibold">{metrics.postsCreated24h}</span>
              </div>
              <div className="pt-4 border-t border-olive-600">
                <div className="flex items-center justify-between">
                  <span className="text-cream-300">Pinned Topics</span>
                  <Badge variant="default">{metrics.pinnedTopics}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-cream-300">Locked Topics</span>
                  <Badge variant="error">{metrics.lockedTopics}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
