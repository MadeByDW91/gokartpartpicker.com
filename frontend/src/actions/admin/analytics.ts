'use server';

/**
 * Analytics server actions
 * Provides business intelligence metrics for admin dashboard
 */

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';

interface AnalyticsMetrics {
  catalog: {
    totalEngines: number;
    totalMotors: number;
    totalParts: number;
    activeEngines: number;
    activeMotors: number;
    activeParts: number;
    enginesWithPrice: number;
    motorsWithPrice: number;
    partsWithPrice: number;
    enginesWithImages: number;
    motorsWithImages: number;
    partsWithImages: number;
    enginesWithAffiliate: number;
    motorsWithAffiliate: number;
    partsWithAffiliate: number;
  };
  topEngines: Array<{ id: string; name: string; views: number }>;
  topMotors: Array<{ id: string; name: string; views: number }>;
  topParts: Array<{ id: string; name: string; views: number }>;
  builds: {
    totalBuilds: number;
    publicBuilds: number;
    totalLikes: number;
    averagePartsPerBuild: number;
    evBuilds: number;
    gasBuilds: number;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsersLast30Days: number;
  };
  revenue: {
    potentialRevenue: number; // Sum of all prices with affiliate links
    coverage: number; // Percentage of items with affiliate links
  };
}

/**
 * Get analytics metrics
 */
export async function getAnalyticsMetrics(): Promise<ActionResult<AnalyticsMetrics>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Catalog metrics
    const [
      enginesResult,
      motorsResult,
      partsResult,
      buildsResult,
      usersResult,
    ] = await Promise.all([
      supabase.from('engines').select('id, name, is_active, price, image_url, affiliate_url'),
      supabase.from('electric_motors').select('id, name, is_active, price, image_url, affiliate_url'),
      supabase.from('parts').select('id, name, is_active, price, image_url, affiliate_url'),
      supabase.from('builds').select('id, parts, likes_count, is_public, power_source_type'),
      supabase.from('profiles').select('id, created_at'),
    ]);

    if (enginesResult.error) return error('Failed to fetch engines');
    if (motorsResult.error) return error('Failed to fetch motors');
    if (partsResult.error) return error('Failed to fetch parts');
    if (buildsResult.error) return error('Failed to fetch builds');
    if (usersResult.error) return error('Failed to fetch users');

    const engines = enginesResult.data || [];
    const motors = motorsResult.data || [];
    const parts = partsResult.data || [];
    const builds = buildsResult.data || [];
    const users = usersResult.data || [];

    // Calculate catalog metrics
    const catalog = {
      totalEngines: engines.length,
      totalMotors: motors.length,
      totalParts: parts.length,
      activeEngines: engines.filter((e: any) => e.is_active).length,
      activeMotors: motors.filter((m: any) => m.is_active).length,
      activeParts: parts.filter((p: any) => p.is_active).length,
      enginesWithPrice: engines.filter((e: any) => e.price && e.price > 0).length,
      motorsWithPrice: motors.filter((m: any) => m.price && m.price > 0).length,
      partsWithPrice: parts.filter((p: any) => p.price && p.price > 0).length,
      enginesWithImages: engines.filter((e: any) => e.image_url).length,
      motorsWithImages: motors.filter((m: any) => m.image_url).length,
      partsWithImages: parts.filter((p: any) => p.image_url).length,
      enginesWithAffiliate: engines.filter((e: any) => e.affiliate_url).length,
      motorsWithAffiliate: motors.filter((m: any) => m.affiliate_url).length,
      partsWithAffiliate: parts.filter((p: any) => p.affiliate_url).length,
    };

    // Top engines (by name for now, since views_count doesn't exist on engines/parts)
    const topEngines = engines
      .map((e: any) => ({
        id: e.id,
        name: e.name,
        views: 0, // Placeholder - views tracking not implemented yet
      }))
      .slice(0, 10);

    // Top motors
    const topMotors = motors
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        views: 0, // Placeholder - views tracking not implemented yet
      }))
      .slice(0, 10);

    // Top parts (by name for now)
    const topParts = parts
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        views: 0, // Placeholder - views tracking not implemented yet
      }))
      .slice(0, 10);

    // Build metrics
    const totalBuilds = builds.length;
    const publicBuilds = builds.filter((b: any) => b.is_public).length;
    const totalLikes = builds.reduce((sum: number, b: any) => sum + (b.likes_count || 0), 0);
    const evBuilds = builds.filter((b: any) => b.power_source_type === 'electric').length;
    const gasBuilds = builds.filter((b: any) => b.power_source_type === 'gas' || !b.power_source_type).length;
    
    // Calculate average parts per build
    const buildParts = builds.map((b: any) => {
      const partsObj = typeof b.parts === 'string' ? JSON.parse(b.parts) : b.parts;
      return Object.keys(partsObj || {}).length;
    });
    const averagePartsPerBuild = buildParts.length > 0
      ? buildParts.reduce((sum: number, count: number) => sum + count, 0) / buildParts.length
      : 0;

    // User metrics (last 30 days active)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter((u: any) => 
      new Date(u.created_at) >= thirtyDaysAgo
    ).length;
    const newUsersLast30Days = users.filter((u: any) => 
      new Date(u.created_at) >= thirtyDaysAgo
    ).length;

    // Revenue metrics
    const allItems = [
      ...engines.map((e: any) => ({ price: e.price || 0, hasAffiliate: !!e.affiliate_url })),
      ...motors.map((m: any) => ({ price: m.price || 0, hasAffiliate: !!m.affiliate_url })),
      ...parts.map((p: any) => ({ price: p.price || 0, hasAffiliate: !!p.affiliate_url })),
    ];
    const potentialRevenue = allItems
      .filter((item: any) => item.hasAffiliate && item.price > 0)
      .reduce((sum: number, item: any) => sum + item.price, 0);
    const totalItems = allItems.length;
    const itemsWithAffiliate = allItems.filter((item: any) => item.hasAffiliate).length;
    const coverage = totalItems > 0 ? (itemsWithAffiliate / totalItems) * 100 : 0;

    const metrics: AnalyticsMetrics = {
      catalog,
      topEngines,
      topMotors,
      topParts,
      builds: {
        totalBuilds,
        publicBuilds,
        totalLikes,
        averagePartsPerBuild: Math.round(averagePartsPerBuild * 10) / 10,
        evBuilds,
        gasBuilds,
      },
      users: {
        totalUsers: users.length,
        activeUsers,
        newUsersLast30Days,
      },
      revenue: {
        potentialRevenue,
        coverage: Math.round(coverage * 10) / 10,
      },
    };

    return success(metrics);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch analytics');
  }
}

/**
 * Get category distribution for parts
 */
export async function getCategoryDistribution(): Promise<ActionResult<Array<{ category: string; count: number }>>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('category')
      .eq('is_active', true);

    if (partsError) {
      return error('Failed to fetch parts');
    }

    // Count by category
    const categoryCounts = new Map<string, number>();
    parts?.forEach((p: any) => {
      const count = categoryCounts.get(p.category) || 0;
      categoryCounts.set(p.category, count + 1);
    });

    const distribution = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a: { category: string; count: number }, b: { category: string; count: number }) => b.count - a.count);

    return success(distribution);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch category distribution');
  }
}

/**
 * Get build trends (builds created over time)
 */
export async function getBuildTrends(days: number = 30): Promise<ActionResult<Array<{ date: string; count: number }>>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: builds, error: buildsError } = await supabase
      .from('builds')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (buildsError) {
      return error('Failed to fetch builds');
    }

    // Group by date
    const dateCounts = new Map<string, number>();
    builds?.forEach((b: any) => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      const count = dateCounts.get(date) || 0;
      dateCounts.set(date, count + 1);
    });

    // Fill in missing dates with 0
    const trends: Array<{ date: string; count: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trends.push({
        date: dateStr,
        count: dateCounts.get(dateStr) || 0,
      });
    }

    return success(trends);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch build trends');
  }
}
