'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  getSecurityMetrics,
  type SecurityMetrics,
} from '@/actions/admin/security';
import {
  Shield,
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Ban,
  Flag,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default function SecurityDashboardPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const result = await getSecurityMetrics();
        if (result.success) {
          setMetrics(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load security metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-3xl text-cream-100">Security Dashboard</h1>
            <p className="text-cream-300 mt-1">Monitor and manage website security</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-olive-800 border-olive-600">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-olive-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-olive-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-3xl text-cream-100">Security Dashboard</h1>
            <p className="text-cream-300 mt-1">Monitor and manage website security</p>
          </div>
        </div>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const complianceColor =
    metrics.securityComplianceScore >= 80
      ? 'text-green-400'
      : metrics.securityComplianceScore >= 60
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Security Dashboard</h1>
          <p className="text-cream-300 mt-1">Monitor and manage website security</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/security/bans">
            <Button size="sm" variant="secondary">
              <Ban className="w-4 h-4 mr-2" />
              Manage Bans
            </Button>
          </Link>
          <Link href="/admin/security/audit-logs">
            <Button size="sm" variant="secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* Security Compliance Score */}
      <Card className="bg-olive-800 border-olive-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cream-100">
            <Shield className="w-5 h-5 text-orange-400" />
            Security Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-6xl font-bold ${complianceColor}`}>
              {metrics.securityComplianceScore}
            </div>
            <div className="flex-1">
              <div className="w-full bg-olive-700 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full ${
                    metrics.securityComplianceScore >= 80
                      ? 'bg-green-500'
                      : metrics.securityComplianceScore >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.securityComplianceScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-cream-300">
                {metrics.securityComplianceScore >= 80
                  ? 'Excellent security posture'
                  : metrics.securityComplianceScore >= 60
                  ? 'Good security posture - monitor closely'
                  : 'Security issues detected - immediate action required'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rate Limit Violations */}
        <Link href="/admin/security/rate-limits">
          <Card className="bg-olive-800 border-olive-600 hover:border-orange-500/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-orange-400" />
                {metrics.rateLimitViolations24h > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    Alert
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-cream-100">
                {metrics.rateLimitViolations24h}
              </div>
              <p className="text-sm text-cream-300">Rate Limit Violations (24h)</p>
            </CardContent>
          </Card>
        </Link>

        {/* Active Bans */}
        <Link href="/admin/security/bans">
          <Card className="bg-olive-800 border-olive-600 hover:border-orange-500/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-cream-100">{metrics.activeBans}</div>
              <p className="text-sm text-cream-300">Active Bans</p>
            </CardContent>
          </Card>
        </Link>

        {/* Spam Detected */}
        <Card className="bg-olive-800 border-olive-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Flag className="w-5 h-5 text-yellow-400" />
              {metrics.spamDetected24h > 0 && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  Active
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-cream-100">{metrics.spamDetected24h}</div>
            <p className="text-sm text-cream-300">Spam Detected (24h)</p>
          </CardContent>
        </Card>

        {/* Content Flagged */}
        <Card className="bg-olive-800 border-olive-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              {metrics.contentFlagged24h > 0 && (
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                  Review
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-cream-100">{metrics.contentFlagged24h}</div>
            <p className="text-sm text-cream-300">Content Flagged (24h)</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Violators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Violating IPs */}
        <Card className="bg-olive-800 border-olive-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cream-100">
              <Zap className="w-5 h-5 text-orange-400" />
              Top Violating IPs (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topViolatingIPs.length > 0 ? (
              <div className="space-y-3">
                {metrics.topViolatingIPs.slice(0, 5).map((violation, index) => (
                  <div
                    key={violation.ip}
                    className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-cream-300 font-mono text-sm">{violation.ip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold">{violation.count}</span>
                      <span className="text-cream-400 text-sm">violations</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-cream-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p>No violations detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Violating Users */}
        <Card className="bg-olive-800 border-olive-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cream-100">
              <Users className="w-5 h-5 text-orange-400" />
              Top Violating Users (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topViolatingUsers.length > 0 ? (
              <div className="space-y-3">
                {metrics.topViolatingUsers.slice(0, 5).map((violation, index) => (
                  <div
                    key={violation.userId}
                    className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-cream-100 font-medium">{violation.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold">{violation.count}</span>
                      <span className="text-cream-400 text-sm">violations</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-cream-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p>No violations detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-olive-800 border-olive-600">
        <CardHeader>
          <CardTitle className="text-cream-100">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/security/bans">
              <Button
                variant="secondary"
                className="w-full justify-start"
              >
                <Ban className="w-4 h-4 mr-2" />
                Manage User Bans
              </Button>
            </Link>
            <Link href="/admin/security/rate-limits">
              <Button
                variant="secondary"
                className="w-full justify-start"
              >
                <Activity className="w-4 h-4 mr-2" />
                View Rate Limits
              </Button>
            </Link>
            <Link href="/admin/security/audit-logs">
              <Button
                variant="secondary"
                className="w-full justify-start"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Audit Logs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
