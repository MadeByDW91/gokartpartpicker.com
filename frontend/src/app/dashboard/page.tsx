'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireAuth } from '@/hooks/use-auth';
import { useImpersonation } from '@/hooks/use-impersonation';
import { useUserBuilds } from '@/hooks/use-builds';
import { getProfile, getUserStats } from '@/actions/profile';
import { BuildCard } from '@/components/BuildCard';
import { BuildCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  LayoutDashboard,
  Wrench,
  Plus,
  FileText,
  GitCompare,
  BookOpen,
  Calculator,
  MessageSquare,
  ArrowRight,
  Loader2,
  Sparkles,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Eye,
  Heart,
  DollarSign,
  Zap,
  Award,
  Clock,
  Target,
  BarChart3,
  Flame,
  Star,
  CheckCircle2,
  AlertCircle,
  Cog,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database';
import type { Build } from '@/types/database';

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { active: impersonating } = useImpersonation();
  const { data: builds, isLoading: buildsLoading, error: buildsError } = useUserBuilds();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<{
    totalBuilds: number;
    publicBuilds: number;
    privateBuilds: number;
    totalLikes: number;
    totalViews: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const viewOnly = impersonating;

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [profileRes, statsRes] = await Promise.all([
          getProfile(),
          getUserStats(),
        ]);
        if (profileRes.success && profileRes.data) setProfile(profileRes.data);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Calculate aggregate metrics from builds
  const aggregateMetrics = useMemo(() => {
    if (!builds || builds.length === 0) {
      return {
        totalCost: 0,
        totalHP: 0,
        avgCost: 0,
        avgHP: 0,
        buildsWithEngine: 0,
      };
    }

    let totalCost = 0;
    let totalHP = 0;
    let buildsWithEngine = 0;

    builds.forEach((build) => {
      if (build.total_price) totalCost += build.total_price;
      if (build.engine?.horsepower) {
        totalHP += build.engine.horsepower;
        buildsWithEngine++;
      }
    });

    return {
      totalCost,
      totalHP,
      avgCost: builds.length > 0 ? totalCost / builds.length : 0,
      avgHP: buildsWithEngine > 0 ? totalHP / buildsWithEngine : 0,
      buildsWithEngine,
    };
  }, [builds]);

  // Get achievement badges
  const achievements = useMemo(() => {
    const badges: Array<{ icon: typeof Award; label: string; color: string; unlocked: boolean }> = [];
    
    if (stats) {
      if (stats.totalBuilds >= 1) {
        badges.push({ icon: Award, label: 'First Build', color: 'text-yellow-400', unlocked: true });
      }
      if (stats.totalBuilds >= 5) {
        badges.push({ icon: Star, label: 'Builder', color: 'text-orange-400', unlocked: true });
      }
      if (stats.totalBuilds >= 10) {
        badges.push({ icon: Flame, label: 'Master Builder', color: 'text-red-400', unlocked: true });
      }
      if (stats.publicBuilds >= 1) {
        badges.push({ icon: Eye, label: 'Sharing', color: 'text-blue-400', unlocked: true });
      }
      if (stats.totalLikes >= 10) {
        badges.push({ icon: Heart, label: 'Popular', color: 'text-pink-400', unlocked: true });
      }
    }
    
    return badges;
  }, [stats]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const lastBuild = builds && builds.length > 0 ? builds[0] : null;
  const recentBuilds = (builds ?? []).slice(0, 6);
  const displayName = profile?.username || user.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Enhanced Header with Gradient */}
      <div className="relative bg-gradient-to-br from-olive-800 via-olive-800/95 to-olive-900 border-b border-olive-700 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30 flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
                </div>
                {achievements.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-olive-900">
                    <Star className="w-3 h-3 text-cream-100" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-display text-3xl sm:text-4xl lg:text-5xl text-cream-100 mb-1">
                  Welcome back, {displayName}
                </h1>
                <p className="text-cream-400 text-sm sm:text-base">
                  {viewOnly
                    ? "Viewing this user's dashboard (view-only)."
                    : stats && stats.totalBuilds > 0
                    ? `You have ${stats.totalBuilds} build${stats.totalBuilds !== 1 ? 's' : ''} and ${stats.totalViews} total view${stats.totalViews !== 1 ? 's' : ''}`
                    : 'Ready to build your first go-kart? Let\'s get started!'}
                </p>
              </div>
            </div>
            
            {!viewOnly && (
              <Link href="/builder">
                <Button 
                  variant="primary" 
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                  className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
                >
                  New Build
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Stats Grid */}
        {stats && stats.totalBuilds > 0 && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-orange-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-orange-400/60" />
                  </div>
                  <p className="text-sm text-cream-500 mb-1">Total Builds</p>
                  <p className="text-3xl font-bold text-cream-100">{stats.totalBuilds}</p>
                  <p className="text-xs text-cream-500 mt-2">
                    {stats.publicBuilds} public · {stats.privateBuilds} private
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-blue-400/60" />
                  </div>
                  <p className="text-sm text-cream-500 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-cream-100">{stats.totalViews}</p>
                  <p className="text-xs text-cream-500 mt-2">
                    {stats.publicBuilds > 0 
                      ? `${Math.round((stats.totalViews / stats.publicBuilds) * 10) / 10} avg per build`
                      : 'Share builds to get views'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-transparent hover:border-pink-500/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-pink-400/60" />
                  </div>
                  <p className="text-sm text-cream-500 mb-1">Total Likes</p>
                  <p className="text-3xl font-bold text-cream-100">{stats.totalLikes}</p>
                  <p className="text-xs text-cream-500 mt-2">
                    {stats.publicBuilds > 0 
                      ? `${Math.round((stats.totalLikes / stats.publicBuilds) * 10) / 10} avg per build`
                      : 'Share builds to get likes'}
                  </p>
                </CardContent>
              </Card>

              {aggregateMetrics.totalCost > 0 && (
                <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent hover:border-green-500/50 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400/60" />
                    </div>
                    <p className="text-sm text-cream-500 mb-1">Total Invested</p>
                    <p className="text-3xl font-bold text-cream-100">
                      ${aggregateMetrics.totalCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-cream-500 mt-2">
                      ${Math.round(aggregateMetrics.avgCost)} avg per build
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        )}

        {/* Pick up where you left off - Enhanced */}
        {!buildsLoading && lastBuild && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cream-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                Pick up where you left off
              </h2>
              {!viewOnly && (
                <Link
                  href={`/builder?load=${lastBuild.id}`}
                  className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                >
                  Continue building
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 via-olive-800/40 to-olive-800/20 hover:border-orange-500/50 transition-all overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            Last edited
                          </Badge>
                          {lastBuild.is_public && (
                            <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Public
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-cream-100 mb-2 truncate">
                          {lastBuild.name}
                        </h3>
                        <p className="text-cream-400 text-sm mb-4">
                          {lastBuild.engine?.name ?? 'Custom build'} · Updated {formatDate(lastBuild.updated_at)}
                        </p>
                        {lastBuild.description && (
                          <p className="text-cream-300 text-sm line-clamp-2 mb-4">
                            {lastBuild.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {lastBuild.engine?.horsepower && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-orange-400" />
                          <span className="text-cream-300">{lastBuild.engine.horsepower} HP</span>
                        </div>
                      )}
                      {lastBuild.total_price && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-cream-300">${lastBuild.total_price.toLocaleString()}</span>
                        </div>
                      )}
                      {lastBuild.views_count > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-blue-400" />
                          <span className="text-cream-300">{lastBuild.views_count} views</span>
                        </div>
                      )}
                      {lastBuild.likes_count > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="w-4 h-4 text-pink-400" />
                          <span className="text-cream-300">{lastBuild.likes_count} likes</span>
                        </div>
                      )}
                    </div>
                    {!viewOnly && (
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/builder?load=${lastBuild.id}`}>
                          <Button variant="primary" icon={<Wrench className="w-4 h-4" />}>
                            Continue building
                          </Button>
                        </Link>
                        <Link href={`/builds/${lastBuild.id}`}>
                          <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
                            View details
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  {lastBuild.engine && (
                    <div className="lg:w-48 bg-olive-800/50 p-6 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-olive-700/50">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-orange-500/20 flex items-center justify-center">
                          <Cog className="w-8 h-8 text-orange-400" />
                        </div>
                        <p className="text-xs text-cream-500 mb-1">Engine</p>
                        <p className="text-sm font-semibold text-cream-100 truncate">
                          {lastBuild.engine.name}
                        </p>
                        {lastBuild.engine.horsepower && (
                          <p className="text-xs text-orange-400 mt-1">
                            {lastBuild.engine.horsepower} HP
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-cream-100 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-400" />
              Achievements
            </h2>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <Card key={idx} className="border-olive-700 bg-olive-800/40">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Icon className={cn('w-6 h-6', achievement.color)} />
                      <span className="font-semibold text-cream-100">{achievement.label}</span>
                      <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick actions - Enhanced */}
        <section>
          <h2 className="text-xl font-bold text-cream-100 mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/builder">
              <Card hoverable className="h-full border-orange-500/20 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-transparent transition-all group">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 group-hover:bg-orange-500/30 flex items-center justify-center mb-4 transition-colors">
                    <Plus className="w-6 h-6 text-orange-400" />
                  </div>
                  <p className="font-bold text-lg text-cream-100 mb-1">New build</p>
                  <p className="text-sm text-cream-500">Start from scratch</p>
                  <ChevronRight className="w-5 h-5 text-cream-500 mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/templates">
              <Card hoverable className="h-full border-blue-500/20 hover:border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent transition-all group">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 flex items-center justify-center mb-4 transition-colors">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="font-bold text-lg text-cream-100 mb-1">Templates</p>
                  <p className="text-sm text-cream-500">Start from a preset</p>
                  <ChevronRight className="w-5 h-5 text-cream-500 mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/builds/compare">
              <Card hoverable className="h-full border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-transparent transition-all group">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 flex items-center justify-center mb-4 transition-colors">
                    <GitCompare className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="font-bold text-lg text-cream-100 mb-1">Compare builds</p>
                  <p className="text-sm text-cream-500">Side-by-side</p>
                  <ChevronRight className="w-5 h-5 text-cream-500 mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/builds">
              <Card hoverable className="h-full border-green-500/20 hover:border-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent transition-all group">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 flex items-center justify-center mb-4 transition-colors">
                    <Bookmark className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="font-bold text-lg text-cream-100 mb-1">Saved builds</p>
                  <p className="text-sm text-cream-500">
                    {stats ? `${stats.totalBuilds} build${stats.totalBuilds !== 1 ? 's' : ''}` : 'View all'}
                  </p>
                  <ChevronRight className="w-5 h-5 text-cream-500 mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Recent builds - Enhanced */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cream-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              Recent builds
            </h2>
            {builds && builds.length > 0 && (
              <Link
                href="/builds"
                className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {buildsError && (
            <Card className="border-[var(--error)]/30 bg-[var(--error)]/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                <p className="text-[var(--error)] text-sm">Failed to load builds. Please try again.</p>
              </CardContent>
            </Card>
          )}

          {buildsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <BuildCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!buildsLoading && (!builds || builds.length === 0) && (
            <Card className="border-olive-700 bg-olive-800/30">
              <CardContent className="py-16 text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-olive-800/50 flex items-center justify-center">
                  <Wrench className="w-16 h-16 text-cream-400/30" />
                </div>
                <h3 className="text-xl font-bold text-cream-100 mb-2">No builds yet</h3>
                <p className="text-cream-400 text-sm mb-8 max-w-sm mx-auto">
                  Create your first go-kart build. Choose an engine, add parts, and save your configuration.
                </p>
                {!viewOnly && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/builder">
                      <Button variant="primary" icon={<Plus className="w-4 h-4" />} size="lg">
                        Create your first build
                      </Button>
                    </Link>
                    <Link href="/templates">
                      <Button variant="secondary" icon={<FileText className="w-4 h-4" />} size="lg">
                        Browse templates
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!buildsLoading && recentBuilds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBuilds.map((build: Build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  showActions={!viewOnly}
                />
              ))}
            </div>
          )}
        </section>

        {/* Explore section - Enhanced */}
        <section>
          <h2 className="text-xl font-bold text-cream-100 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Explore resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/guides">
              <Card hoverable className="h-full border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-transparent transition-all group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 flex items-center justify-center transition-colors">
                    <BookOpen className="w-7 h-7 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-cream-100 mb-1">Guides</p>
                    <p className="text-sm text-cream-500">How-to & tips</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-cream-500 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/tools">
              <Card hoverable className="h-full border-blue-500/20 hover:border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent transition-all group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 flex items-center justify-center transition-colors">
                    <Calculator className="w-7 h-7 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-cream-100 mb-1">Tools</p>
                    <p className="text-sm text-cream-500">HP, torque, videos</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-cream-500 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/forums">
              <Card hoverable className="h-full border-green-500/20 hover:border-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent transition-all group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 flex items-center justify-center transition-colors">
                    <MessageSquare className="w-7 h-7 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-cream-100 mb-1">Forums</p>
                    <p className="text-sm text-cream-500">Community & support</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-cream-500 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Profile CTA - Enhanced */}
        {!viewOnly && (
          <section>
            <Link href="/profile">
              <Card hoverable className="border-olive-600 hover:border-olive-500 bg-gradient-to-r from-olive-800/50 to-olive-800/30 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30 flex items-center justify-center text-cream-200 font-bold text-xl">
                      {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-cream-100 mb-1">Account & settings</p>
                      <p className="text-sm text-cream-500">
                        Update profile, preferences, and privacy settings
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-cream-500" />
                </CardContent>
              </Card>
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
