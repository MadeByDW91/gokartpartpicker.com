'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { StatCard } from '@/components/admin/StatCard';
import { HealthIndicator } from '@/components/admin/HealthIndicator';
import { MiniChart } from '@/components/admin/MiniChart';
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
  motors: number;
  parts: number;
  builds: number;
  users: number;
  guides: number;
  videos: number;
  templates: number;
  publishedGuides: number;
  activeEngines: number;
  activeMotors: number;
  activeParts: number;
  partsWithImages: number;
  partsWithAffiliateLinks: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    engines: 0,
    motors: 0,
    parts: 0,
    builds: 0,
    users: 0,
    guides: 0,
    videos: 0,
    templates: 0,
    publishedGuides: 0,
    activeEngines: 0,
    activeMotors: 0,
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
          motorsRes,
          partsRes, 
          buildsRes, 
          usersRes, 
          guidesRes,
          publishedGuidesRes,
          videosRes,
          templatesRes,
          activeEnginesRes,
          activeMotorsRes,
          activePartsRes,
          partsWithImagesRes,
          partsWithAffiliateRes,
          activityRes
        ] = await Promise.all([
          supabase.from('engines').select('id', { count: 'exact', head: true }),
          supabase.from('electric_motors').select('id', { count: 'exact', head: true }),
          supabase.from('parts').select('id', { count: 'exact', head: true }),
          supabase.from('builds').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('content').select('id', { count: 'exact', head: true }).eq('content_type', 'guide'),
          supabase.from('content').select('id', { count: 'exact', head: true }).eq('content_type', 'guide').eq('is_published', true),
          supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('builds').select('id', { count: 'exact', head: true }).eq('is_template', true),
          supabase.from('engines').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('electric_motors').select('id', { count: 'exact', head: true }).eq('is_active', true),
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
          motors: motorsRes.count || 0,
          parts: partsRes.count || 0,
          builds: buildsRes.count || 0,
          users: usersRes.count || 0,
          guides: guidesRes.count || 0,
          publishedGuides: publishedGuidesRes.count || 0,
          videos: videosRes.count || 0,
          templates: templatesRes.count || 0,
          activeEngines: activeEnginesRes.count || 0,
          activeMotors: activeMotorsRes.count || 0,
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
      label: 'Electric Motors', 
      value: stats.motors, 
      icon: Cog, 
      href: '/admin/motors',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display text-2xl sm:text-3xl text-cream-100">Dashboard</h1>
          <p className="text-cream-300 mt-1 text-sm sm:text-base">Manage your go-kart catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link href="/admin/add?type=gas" className="w-full sm:w-auto">
            <Button size="sm" icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
              <span className="hidden sm:inline">Add Engine</span>
              <span className="sm:hidden">Engine</span>
            </Button>
          </Link>
          <Link href="/admin/add?type=ev" className="w-full sm:w-auto">
            <Button size="sm" variant="secondary" icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
              <span className="hidden sm:inline">Add Electric Motor</span>
              <span className="sm:hidden">EV Motor</span>
            </Button>
          </Link>
          <Link href="/admin/parts/new" className="w-full sm:w-auto">
            <Button size="sm" variant="secondary" icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
              <span className="hidden sm:inline">Add Part</span>
              <span className="sm:hidden">Part</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Engines"
          value={stats.engines}
          icon={Cog}
          href="/admin/engines"
          color="text-orange-400"
          bgColor="bg-orange-500/10"
          subtitle={`${stats.activeEngines} active`}
          loading={loading}
          trend={[stats.engines - 2, stats.engines - 1, stats.engines]} // Mock trend data
        />
        <StatCard
          label="Electric Motors"
          value={stats.motors}
          icon={Cog}
          href="/admin/motors"
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          subtitle={`${stats.activeMotors} active`}
          loading={loading}
          trend={[stats.motors - 1, stats.motors, stats.motors]} // Mock trend data
        />
        <StatCard
          label="Parts"
          value={stats.parts}
          icon={Package}
          href="/admin/parts"
          color="text-cyan-400"
          bgColor="bg-cyan-500/10"
          subtitle={`${stats.activeParts} active`}
          loading={loading}
          trend={[stats.parts - 3, stats.parts - 1, stats.parts]} // Mock trend data
        />
        <StatCard
          label="Builds"
          value={stats.builds}
          icon={Wrench}
          href="/admin/builds"
          color="text-green-400"
          bgColor="bg-green-500/10"
          subtitle="User builds"
          loading={loading}
        />
        <StatCard
          label="Users"
          value={stats.users}
          icon={Users}
          href="/admin/users"
          color="text-purple-400"
          bgColor="bg-purple-500/10"
          subtitle="Total registered"
          loading={loading}
        />
      </div>

      {/* Content Stats - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/guides">
          <Card hoverable className="p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide">Guides</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">
                  {loading ? '—' : `${stats.publishedGuides}/${stats.guides}`}
                </p>
                <p className="text-xs text-cream-500 mt-1">Published / Total</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/videos">
          <Card hoverable className="p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide">Videos</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">
                  {loading ? '—' : stats.videos.toLocaleString()}
                </p>
                <p className="text-xs text-cream-500 mt-1">Active videos</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/templates">
          <Card hoverable className="p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide">Templates</p>
                <p className="text-2xl font-bold text-cream-100 mt-1">
                  {loading ? '—' : stats.templates.toLocaleString()}
                </p>
                <p className="text-xs text-cream-500 mt-1">Build templates</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs text-cream-400 uppercase tracking-wide">Catalog Health</p>
              <p className="text-2xl font-bold text-cream-100 mt-1">
                {loading ? '—' : `${stats.activeEngines + stats.activeMotors + stats.activeParts}`}
              </p>
              <p className="text-xs text-cream-500 mt-1">Active items</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Content Quality Metrics - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-400" />
                Parts Image Coverage
              </h2>
              {!loading && stats.parts > 0 && (
                <HealthIndicator
                  score={Math.round((stats.partsWithImages / stats.parts) * 100)}
                  size="sm"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <div className="h-8 bg-olive-600 rounded-full animate-pulse" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cream-300">Parts with images</span>
                  <span className="text-cream-100 font-semibold">
                    {stats.partsWithImages} / {stats.parts}
                  </span>
                </div>
                <div className="relative w-full bg-olive-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-orange-500/50"
                    style={{
                      width: `${stats.parts > 0 ? (stats.partsWithImages / stats.parts) * 100 : 0}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-cream-100 z-10">
                      {stats.parts > 0
                        ? `${Math.round((stats.partsWithImages / stats.parts) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant={stats.parts > 0 && (stats.partsWithImages / stats.parts) * 100 >= 80 ? 'success' : 'warning'}
                    size="sm"
                  >
                    {stats.parts > 0 && (stats.partsWithImages / stats.parts) * 100 >= 80
                      ? 'Good Coverage'
                      : 'Needs Improvement'}
                  </Badge>
                  {stats.parts > 0 && (stats.partsWithImages / stats.parts) * 100 < 80 && (
                    <Link href="/admin/reports/missing-data" className="text-xs text-orange-400 hover:text-orange-300">
                      View missing images →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                Affiliate Link Coverage
              </h2>
              {!loading && stats.parts > 0 && (
                <HealthIndicator
                  score={Math.round((stats.partsWithAffiliateLinks / stats.parts) * 100)}
                  size="sm"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <div className="h-8 bg-olive-600 rounded-full animate-pulse" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cream-300">Parts with affiliate links</span>
                  <span className="text-cream-100 font-semibold">
                    {stats.partsWithAffiliateLinks} / {stats.parts}
                  </span>
                </div>
                <div className="relative w-full bg-olive-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-yellow-500/50"
                    style={{
                      width: `${stats.parts > 0 ? (stats.partsWithAffiliateLinks / stats.parts) * 100 : 0}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-cream-100 z-10">
                      {stats.parts > 0
                        ? `${Math.round((stats.partsWithAffiliateLinks / stats.parts) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant={stats.parts > 0 && (stats.partsWithAffiliateLinks / stats.parts) * 100 >= 50 ? 'success' : 'warning'}
                    size="sm"
                  >
                    {stats.parts > 0 && (stats.partsWithAffiliateLinks / stats.parts) * 100 >= 50
                      ? 'Good Coverage'
                      : 'Needs Improvement'}
                  </Badge>
                  {stats.parts > 0 && (stats.partsWithAffiliateLinks / stats.parts) * 100 < 50 && (
                    <Link href="/admin/affiliate" className="text-xs text-yellow-400 hover:text-yellow-300">
                      Add affiliate links →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-olive-800/50 to-transparent opacity-50" />
          <CardHeader className="relative z-10">
            <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              Quick Actions
            </h2>
          </CardHeader>
          <CardContent className="relative z-10 space-y-2">
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
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-olive-800/30 to-transparent opacity-50" />
          <CardHeader className="relative z-10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h2>
            <Link href="/admin/audit" className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-olive-600 rounded-md animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-cream-600 mx-auto mb-3 opacity-50" />
                <p className="text-cream-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.slice(0, 5).map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-olive-700/50 hover:bg-olive-700/70 transition-colors border border-olive-600/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-md border ${getActionBadge(entry.action)}`}>
                        {entry.action}
                      </span>
                      <span className="text-cream-200 font-medium group-hover:text-cream-100 transition-colors">
                        {entry.table_name}
                      </span>
                    </div>
                    <span className="text-xs text-cream-500 group-hover:text-cream-400 transition-colors">
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
