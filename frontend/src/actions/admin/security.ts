'use server';

/**
 * Admin security server actions
 * All actions require admin or super_admin role
 */

import { createClient } from '@/lib/supabase/server';
import {
  type ActionResult,
  success,
  error,
  handleError,
} from '@/lib/api/types';

// ============================================================================
// Auth Helpers
// ============================================================================

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Admin access required');
  }

  return { user, role: profile.role as 'admin' | 'super_admin' };
}

// ============================================================================
// Security Metrics
// ============================================================================

export interface SecurityMetrics {
  // Authentication
  failedLogins24h: number;
  failedLogins7d: number;
  successfulLogins24h: number;
  accountLockouts24h: number;

  // Rate Limiting
  rateLimitViolations24h: number;
  topViolatingIPs: Array<{ ip: string; count: number }>;
  topViolatingUsers: Array<{ userId: string; username: string; count: number }>;

  // Content Moderation
  spamDetected24h: number;
  contentFlagged24h: number;
  bansIssued24h: number;
  activeBans: number;

  // Threat Detection
  threatsDetected24h: number;
  autoBansApplied24h: number;
  securityAlerts: number;

  // System Health
  apiResponseTime: number;
  errorRate: number;
  securityComplianceScore: number;
}

/**
 * Get comprehensive security metrics
 */
export async function getSecurityMetrics(): Promise<ActionResult<SecurityMetrics>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get rate limit violations
    const { data: rateLimitViolations } = await supabase
      .from('rate_limit_log')
      .select('*')
      .gte('created_at', last24h.toISOString());

    // Get active bans
    const { data: activeBans } = await supabase
      .from('user_bans')
      .select('*')
      .eq('is_active', true);

    // Get forum audit logs for spam/threats
    const { data: forumAuditLogs } = await supabase
      .from('forum_audit_log')
      .select('*')
      .gte('created_at', last24h.toISOString())
      .in('action', ['content_flagged', 'user_banned', 'spam_detected']);

    // Calculate metrics
    const metrics: SecurityMetrics = {
      // Authentication (placeholder - would need auth logs table)
      failedLogins24h: 0,
      failedLogins7d: 0,
      successfulLogins24h: 0,
      accountLockouts24h: 0,

      // Rate Limiting
      rateLimitViolations24h: rateLimitViolations?.length || 0,
      topViolatingIPs: getTopViolatingIPs(rateLimitViolations || []),
      topViolatingUsers: await getTopViolatingUsers(rateLimitViolations || []),

      // Content Moderation
      spamDetected24h: forumAuditLogs?.filter((log: { action: string }) => log.action === 'spam_detected').length || 0,
      contentFlagged24h: forumAuditLogs?.filter((log: { action: string }) => log.action === 'content_flagged').length || 0,
      bansIssued24h: forumAuditLogs?.filter((log: { action: string }) => log.action === 'user_banned').length || 0,
      activeBans: activeBans?.length || 0,

      // Threat Detection
      threatsDetected24h: 0, // Placeholder
      autoBansApplied24h: 0, // Placeholder
      securityAlerts: 0, // Placeholder

      // System Health
      apiResponseTime: 0, // Placeholder
      errorRate: 0, // Placeholder
      securityComplianceScore: calculateComplianceScore(activeBans?.length || 0, rateLimitViolations?.length || 0),
    };

    return success(metrics);
  } catch (err) {
    if (err instanceof Error && err.message === 'Admin access required') {
      return error('Admin access required');
    }
    return handleError(err, 'getSecurityMetrics');
  }
}

function getTopViolatingIPs(violations: Array<{ ip_address?: string }>): Array<{ ip: string; count: number }> {
  const ipCounts: Record<string, number> = {};
  
  violations.forEach((violation) => {
    if (violation.ip_address) {
      ipCounts[violation.ip_address] = (ipCounts[violation.ip_address] || 0) + 1;
    }
  });

  return Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

async function getTopViolatingUsers(violations: Array<{ user_id?: string }>): Promise<Array<{ userId: string; username: string; count: number }>> {
  const supabase = await createClient();
  const userIdCounts: Record<string, number> = {};

  violations.forEach((violation) => {
    if (violation.user_id) {
      userIdCounts[violation.user_id] = (userIdCounts[violation.user_id] || 0) + 1;
    }
  });

  const userIds = Object.keys(userIdCounts).slice(0, 10);
  if (userIds.length === 0) {
    return [];
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', userIds);

  return userIds
    .map((userId) => {
      const profile = profiles?.find((p: { id: string; username?: string }) => p.id === userId);
      return {
        userId,
        username: profile?.username || 'Unknown',
        count: userIdCounts[userId],
      };
    })
    .sort((a, b) => b.count - a.count);
}

function calculateComplianceScore(activeBans: number, violations: number): number {
  // Simple scoring algorithm (0-100)
  // Lower bans and violations = higher score
  let score = 100;
  score -= Math.min(activeBans * 2, 30); // Max 30 points for bans
  score -= Math.min(violations * 0.5, 20); // Max 20 points for violations
  return Math.max(0, Math.round(score));
}

// ============================================================================
// Ban Management
// ============================================================================

export interface BannedUser {
  id: string;
  user_id: string;
  username: string;
  email: string;
  reason: string;
  ban_type: 'temporary' | 'permanent';
  expires_at: string | null;
  is_active: boolean;
  banned_by: string;
  banned_by_username: string;
  created_at: string;
}

/**
 * Get all banned users
 */
export async function getBannedUsers(): Promise<ActionResult<BannedUser[]>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: bans, error: dbError } = await supabase
      .from('user_bans')
      .select(`
        *,
        user:profiles!user_bans_user_id_fkey(id, username, email),
        banned_by_user:profiles!user_bans_banned_by_fkey(id, username)
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[getBannedUsers] Database error:', dbError);
      return error('Failed to fetch banned users');
    }

    const bannedUsers: BannedUser[] = (bans || []).map((ban: any) => ({
      id: ban.id,
      user_id: ban.user_id,
      username: ban.user?.username || 'Unknown',
      email: ban.user?.email || 'Unknown',
      reason: ban.reason,
      ban_type: ban.ban_type,
      expires_at: ban.expires_at,
      is_active: ban.is_active,
      banned_by: ban.banned_by,
      banned_by_username: ban.banned_by_user?.username || 'Unknown',
      created_at: ban.created_at,
    }));

    return success(bannedUsers);
  } catch (err) {
    if (err instanceof Error && err.message === 'Admin access required') {
      return error('Admin access required');
    }
    return handleError(err, 'getBannedUsers');
  }
}

/**
 * Ban a user
 */
export async function banUser(input: {
  user_id: string;
  reason: string;
  ban_type: 'temporary' | 'permanent';
  expires_at?: string | null;
}): Promise<ActionResult<boolean>> {
  try {
    const { user } = await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase.from('user_bans').insert({
      user_id: input.user_id,
      banned_by: user.id,
      reason: input.reason,
      ban_type: input.ban_type,
      expires_at: input.expires_at || null,
      is_active: true,
    });

    if (dbError) {
      console.error('[banUser] Database error:', dbError);
      return error('Failed to ban user');
    }

    // Log to audit log
    await supabase.from('forum_audit_log').insert({
      user_id: user.id,
      action: 'user_banned',
      content_type: 'user',
      content_id: input.user_id,
      details: { reason: input.reason, ban_type: input.ban_type },
    });

    return success(true);
  } catch (err) {
    if (err instanceof Error && err.message === 'Admin access required') {
      return error('Admin access required');
    }
    return handleError(err, 'banUser');
  }
}

/**
 * Unban a user
 */
export async function unbanUser(banId: string): Promise<ActionResult<boolean>> {
  try {
    const { user } = await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('user_bans')
      .update({ is_active: false })
      .eq('id', banId);

    if (dbError) {
      console.error('[unbanUser] Database error:', dbError);
      return error('Failed to unban user');
    }

    // Log to audit log
    const { data: ban } = await supabase
      .from('user_bans')
      .select('user_id')
      .eq('id', banId)
      .single();

    if (ban) {
      await supabase.from('forum_audit_log').insert({
        user_id: user.id,
        action: 'user_unbanned',
        content_type: 'user',
        content_id: ban.user_id,
        details: { ban_id: banId },
      });
    }

    return success(true);
  } catch (err) {
    if (err instanceof Error && err.message === 'Admin access required') {
      return error('Admin access required');
    }
    return handleError(err, 'unbanUser');
  }
}

// ============================================================================
// Rate Limit Monitoring
// ============================================================================

export interface RateLimitViolation {
  id: string;
  user_id: string | null;
  username: string | null;
  ip_address: string | null;
  action_type: string;
  created_at: string;
}

/**
 * Get rate limit violations
 */
export async function getRateLimitViolations(
  limit: number = 100
): Promise<ActionResult<RateLimitViolation[]>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: violations, error: dbError } = await supabase
      .from('rate_limit_log')
      .select(`
        *,
        user:profiles!rate_limit_log_user_id_fkey(id, username)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (dbError) {
      console.error('[getRateLimitViolations] Database error:', dbError);
      return error('Failed to fetch rate limit violations');
    }

    const formattedViolations: RateLimitViolation[] = (violations || []).map((violation: any) => ({
      id: violation.id,
      user_id: violation.user_id,
      username: violation.user?.username || null,
      ip_address: violation.ip_address,
      action_type: violation.action_type,
      created_at: violation.created_at,
    }));

    return success(formattedViolations);
  } catch (err) {
    if (err instanceof Error && err.message === 'Admin access required') {
      return error('Admin access required');
    }
    return handleError(err, 'getRateLimitViolations');
  }
}

// ============================================================================
// Audit Logs
// ============================================================================

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  username: string | null;
  action: string;
  content_type: string | null;
  content_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: {
  action?: string;
  user_id?: string;
  content_type?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResult<{ logs: AuditLogEntry[]; total: number }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    let query = supabase
      .from('forum_audit_log')
      .select(`
        *,
        user:profiles!forum_audit_log_user_id_fkey(id, username)
      `, { count: 'exact' });

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.content_type) {
      query = query.eq('content_type', filters.content_type);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

    const { data: logs, error: dbError, count } = await query;

    if (dbError) {
      console.error('[getAuditLogs] Database error:', dbError);
      return error('Failed to fetch audit logs');
    }

    const formattedLogs: AuditLogEntry[] = (logs || []).map((log: any) => ({
      id: log.id,
      user_id: log.user_id,
      username: log.user?.username || null,
      action: log.action,
      content_type: log.content_type,
      content_id: log.content_id,
      details: log.details,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      created_at: log.created_at,
    }));

    return success({
      logs: formattedLogs,
      total: count || 0,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Admin access required') {
      return error('Admin access required');
    }
    return handleError(err, 'getAuditLogs');
  }
}
