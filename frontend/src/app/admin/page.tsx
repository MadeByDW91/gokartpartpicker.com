'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { 
  Cog, 
  Package, 
  Wrench, 
  Users,
  Plus,
  ArrowRight,
  Activity,
  BarChart3,
  DollarSign,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  Video,
  FileText,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';
import type { AuditLogEntry } from '@/types/admin';

interface DashboardStats {
  engines: number;
  parts: number;
  builds: number;
  users: number;
  guides: number;
  videos: number;
  templates: number;
  publishedGuides: number;
  activeEngines: number;
  activeParts: number;
  partsWithImages: number;
  partsWithAffiliateLinks: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    engines: 0,
    parts: 0,
    builds: 0,
    users: 0,
    guides: 0,
    videos: 0,
    templates: 0,
    publishedGuides: 0,
    activeEngines: 0,
    activeParts: 0,
    partsWithImages: 0,
    partsWithAffiliateLinks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts in parallel
        const [
          enginesRes, 
          partsRes, 
          buildsRes, 
          usersRes, 
          guidesRes,
          publishedGuidesRes,
          videosRes,
          templatesRes,
          activeEnginesRes,
          activePartsRes,
          partsWithImagesRes,
          partsWithAffiliateRes,
          activityRes
        ] = await Promise.all([
          supabase.from('engines').select('id', { count: 'exact', head: true }),
          supabase.from('parts').select('id', { count: 'exact', head: true }),
          supabase.from('builds').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('content').select('id', { count: 'exact', head: true }).eq('content_type', 'guide'),
          supabase.from('content').select('id', { count: 'exact', head: true }).eq('content_type', 'guide').eq('is_published', true),
          supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('builds').select('id', { count: 'exact', head: true }).eq('is_template', true),
          supabase.from('engines').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('parts').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('parts').select('id', { count: 'exact', head: true }).not('image_url', 'is', null),
          supabase.from('parts').select('id', { count: 'exact', head: true }).not('affiliate_url', 'is', null),
          supabase
            .from('audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        setStats({
          engines: enginesRes.count || 0,
          parts: partsRes.count || 0,
          builds: buildsRes.count || 0,
          users: usersRes.count || 0,
          guides: guidesRes.count || 0,
          publishedGuides: publishedGuidesRes.count || 0,
          videos: videosRes.count || 0,
          templates: templatesRes.count || 0,
          activeEngines: activeEnginesRes.count || 0,
          activeParts: activePartsRes.count || 0,
          partsWithImages: partsWithImagesRes.count || 0,
          partsWithAffiliateLinks: partsWithAffiliateRes.count || 0,
        });

        setRecentActivity((activityRes.data as AuditLogEntry[]) || []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  const statCards = [
    { 
      label: 'Engines', 
      value: stats.engines, 
      icon: Cog, 
      href: '/admin/engines',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    { 
      label: 'Parts', 
      value: stats.parts, 
      icon: Package, 
      href: '/admin/parts',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    { 
      label: 'Builds', 
      value: stats.builds, 
      icon: Wrench, 
      href: '/admin/builds',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    { 
      label: 'Users', 
      value: stats.users, 
      icon: Users, 
      href: '/admin/users',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const getActionBadge = (action: string) => {
    const styles = {
      create: 'bg-green-500/20 text-green-400 border-green-500/30',
      update: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      delete: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[action as keyof typeof styles] || styles.update;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Dashboard</h1>
          <p className="text-cream-300 mt-1">Manage your go-kart catalog</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/engines/new">
            <Button size="sm" icon={<Plus className="w-4 h-4" />}>
              Add Engine
            </Button>
          </Link>
          <Link href="/admin/parts/new">
            <Button size="sm" variant="secondary" icon={<Plus className="w-4 h-4" />}>
              Add Part
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hoverable className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cream-400 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold text-cream-100 mt-1">
                    {loading ? '—' : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/guides">
          <Card hoverable className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Guides</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">
                  {loading ? '—' : `${stats.publishedGuides}/${stats.guides}`}
                </p>
                <p className="text-xs text-cream-500 mt-1">Published / Total</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/videos">
          <Card hoverable className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Videos</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">
                  {loading ? '—' : stats.videos.toLocaleString()}
                </p>
                <p className="text-xs text-cream-500 mt-1">Active videos</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <Video className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/templates">
          <Card hoverable className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Templates</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">
                  {loading ? '—' : stats.templates.toLocaleString()}
                </p>
                <p className="text-xs text-cream-500 mt-1">Build templates</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cream-400 uppercase tracking-wide">Catalog Health</p>
              <p className="text-2xl font-bold text-cream-100 mt-1">
                {loading ? '—' : `${stats.activeEngines + stats.activeParts}`}
              </p>
              <p className="text-xs text-cream-500 mt-1">Active items</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Content Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-400" />
              Parts Image Coverage
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 bg-olive-600 rounded-full animate-pulse" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cream-300">Parts with images</span>
                  <span className="text-cream-100 font-semibold">
                    {stats.partsWithImages} / {stats.parts}
                  </span>
                </div>
                <div className="w-full bg-olive-700 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${stats.parts > 0 ? (stats.partsWithImages / stats.parts) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-cream-400">
                  {stats.parts > 0
                    ? `${Math.round((stats.partsWithImages / stats.parts) * 100)}% coverage`
                    : 'No parts'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Affiliate Link Coverage
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 bg-olive-600 rounded-full animate-pulse" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cream-300">Parts with affiliate links</span>
                  <span className="text-cream-100 font-semibold">
                    {stats.partsWithAffiliateLinks} / {stats.parts}
                  </span>
                </div>
                <div className="w-full bg-olive-700 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${stats.parts > 0 ? (stats.partsWithAffiliateLinks / stats.parts) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-cream-400">
                  {stats.parts > 0
                    ? `${Math.round((stats.partsWithAffiliateLinks / stats.parts) * 100)}% coverage`
                    : 'No parts'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link 
              href="/admin/engines" 
              className="flex items-center justify-between p-3 rounded-md hover:bg-olive-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Cog className="w-5 h-5 text-orange-400" />
                <span className="text-cream-200 group-hover:text-cream-100">Manage Engines</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link 
              href="/admin/parts" 
              className="flex items-center justify-between p-3 rounded-md hover:bg-olive-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-400" />
                <span className="text-cream-200 group-hover:text-cream-100">Manage Parts</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link 
              href="/admin/builds" 
              className="flex items-center justify-between p-3 rounded-md hover:bg-olive-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-green-400" />
                <span className="text-cream-200 group-hover:text-cream-100">Moderate Builds</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link 
              href="/admin/analytics" 
              className="flex items-center justify-between p-3 rounded-md hover:bg-olive-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span className="text-cream-200 group-hover:text-cream-100">View Analytics</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link 
              href="/admin/affiliate" 
              className="flex items-center justify-between p-3 rounded-md hover:bg-olive-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-cream-200 group-hover:text-cream-100">Affiliate Links</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link 
              href="/admin/guides" 
              className="flex items-center justify-between p-3 rounded-md hover:bg-olive-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-cream-200 group-hover:text-cream-100">Manage Guides</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link 
              href="/admin/reports/missing-data" 
              className="flex items-center justify-between p-3 rounded-md hover:bg-olive-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="text-cream-200 group-hover:text-cream-100">Missing Data Report</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cream-100">Recent Activity</h2>
            <Link href="/admin/audit" className="text-sm text-orange-400 hover:text-orange-300">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-olive-600 rounded-md animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-cream-400 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between p-3 rounded-md bg-olive-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs font-medium uppercase rounded border ${getActionBadge(entry.action)}`}>
                        {entry.action}
                      </span>
                      <span className="text-cream-200">
                        {entry.table_name}
                      </span>
                    </div>
                    <span className="text-sm text-cream-400">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
