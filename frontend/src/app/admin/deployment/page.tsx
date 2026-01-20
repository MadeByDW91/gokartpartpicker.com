'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getDeploymentInfo, getDatabaseHealth } from '@/actions/admin/deployment';
import type { DeploymentInfo } from '@/actions/admin/deployment';
import {
  GitBranch,
  Github,
  Cloud,
  Database,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Code,
  Server,
  Activity,
} from 'lucide-react';

export default function DeploymentStatusPage() {
  const [info, setInfo] = useState<DeploymentInfo | null>(null);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [deploymentInfo, health] = await Promise.all([
        getDeploymentInfo(),
        getDatabaseHealth(),
      ]);
      setInfo(deploymentInfo);
      setDbHealth(health);
    } catch (error) {
      console.error('Error fetching deployment info:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unknown':
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-cream-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Deployment Status</h1>
          <p className="text-cream-300 mt-1">Monitor GitHub, Vercel, and Supabase integration</p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </div>

      {/* GitHub Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5 text-cream-100" />
            GitHub
            {getStatusIcon(info?.github.status || 'unknown')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-cream-400 mb-1">Repository</p>
              <p className="text-cream-100 font-mono text-sm">
                {info?.github.repository || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Branch</p>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cream-300" />
                <p className="text-cream-100 font-mono text-sm">
                  {info?.github.branch || 'Unknown'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Latest Commit</p>
              <p className="text-cream-100 font-mono text-sm">
                {info?.github.commit ? (
                  <a
                    href={`https://github.com/MadeByDW91/gokartpartpicker.com/commit/${info.github.commit}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400 flex items-center gap-1"
                  >
                    {info.github.commit}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  'Unknown'
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Last Commit Date</p>
              <p className="text-cream-100 text-sm">
                {formatDate(info?.github.lastCommitDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vercel Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-cream-100" />
            Vercel
            {getStatusIcon(info?.vercel.status || 'unknown')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-cream-400 mb-1">Environment</p>
              <p className="text-cream-100 capitalize">
                {info?.vercel.environment || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Deployment URL</p>
              {info?.vercel.deploymentUrl ? (
                <a
                  href={info.vercel.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 flex items-center gap-1 text-sm"
                >
                  {info.vercel.deploymentUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-cream-100 text-sm">Not available</p>
              )}
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Deployment ID</p>
              <p className="text-cream-100 font-mono text-sm">
                {info?.vercel.deploymentId || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Deployment Time</p>
              <p className="text-cream-100 text-sm">
                {formatDate(info?.vercel.deploymentTime)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supabase Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cream-100" />
            Supabase
            {getStatusIcon(info?.supabase.connected ? 'connected' : 'error')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-cream-400 mb-1">Project URL</p>
              {info?.supabase.projectUrl ? (
                <a
                  href={info.supabase.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 flex items-center gap-1 text-sm break-all"
                >
                  {info.supabase.projectUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-cream-100 text-sm">Not configured</p>
              )}
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Connection Status</p>
              <div className="flex items-center gap-2">
                {info?.supabase.connected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-green-500">Connected</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-500">Not Connected</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Last Checked</p>
              <p className="text-cream-100 text-sm">
                {formatDate(info?.supabase.lastChecked)}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Version</p>
              <p className="text-cream-100 text-sm">
                {info?.supabase.version || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Database Health */}
          {dbHealth && (
            <div className="mt-4 pt-4 border-t border-olive-600">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-cream-300" />
                <p className="text-sm font-semibold text-cream-200">Database Health</p>
                {getStatusIcon(dbHealth.status)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-cream-400 mb-1">Engines</p>
                  <div className="flex items-center gap-2">
                    {dbHealth.checks?.engines?.exists ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <p className="text-cream-100 text-sm">
                          {dbHealth.checks.engines.count} active
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-500" />
                        <p className="text-red-500 text-sm">Table missing</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-cream-400 mb-1">Parts</p>
                  <div className="flex items-center gap-2">
                    {dbHealth.checks?.parts?.exists ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <p className="text-cream-100 text-sm">
                          {dbHealth.checks.parts.count} active
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-500" />
                        <p className="text-red-500 text-sm">Table missing</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-cream-400 mb-1">Templates</p>
                  <div className="flex items-center gap-2">
                    {dbHealth.checks?.build_templates?.exists ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <p className="text-cream-100 text-sm">
                          {dbHealth.checks.build_templates.count} active
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-500" />
                        <p className="text-red-500 text-sm">Table missing</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cream-100" />
            Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-cream-400 mb-1">Version</p>
              <p className="text-cream-100 font-mono text-sm">
                {info?.application.version || '0.1.0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Environment</p>
              <p className="text-cream-100 capitalize text-sm">
                {info?.application.environment || 'development'}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Next.js Version</p>
              <p className="text-cream-100 font-mono text-sm">
                {info?.application.nextVersion || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Node.js Version</p>
              <p className="text-cream-100 font-mono text-sm">
                {info?.application.nodeVersion || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-cream-400 mb-1">Build Time</p>
              <p className="text-cream-100 text-sm">
                {formatDate(info?.application.buildTime)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cream-100" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/MadeByDW91/gokartpartpicker.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors"
            >
              <Github className="w-5 h-5 text-cream-300" />
              <div>
                <p className="text-cream-100 text-sm font-semibold">GitHub Repository</p>
                <p className="text-cream-400 text-xs">View source code</p>
              </div>
              <ExternalLink className="w-4 h-4 text-cream-400 ml-auto" />
            </a>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors"
            >
              <Cloud className="w-5 h-5 text-cream-300" />
              <div>
                <p className="text-cream-100 text-sm font-semibold">Vercel Dashboard</p>
                <p className="text-cream-400 text-xs">View deployments</p>
              </div>
              <ExternalLink className="w-4 h-4 text-cream-400 ml-auto" />
            </a>
            {info?.supabase.projectUrl && (
              <a
                href={`${info.supabase.projectUrl.replace('/rest/v1', '')}/project/settings/general`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors"
              >
                <Database className="w-5 h-5 text-cream-300" />
                <div>
                  <p className="text-cream-100 text-sm font-semibold">Supabase Dashboard</p>
                  <p className="text-cream-400 text-xs">Manage database</p>
                </div>
                <ExternalLink className="w-4 h-4 text-cream-400 ml-auto" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
