'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { ChevronLeft, Search, RefreshCw, ClipboardList } from 'lucide-react';
import type { AuditLogEntry } from '@/types/admin';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as AuditLogEntry[]) || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.table_name.toLowerCase().includes(query) ||
      (log.user_id && log.user_id.toLowerCase().includes(query)) ||
      (log.record_id && log.record_id.toLowerCase().includes(query))
    );
  });

  const getActionBadge = (action: string) => {
    const styles = {
      create: { variant: 'success' as const, label: 'CREATE' },
      update: { variant: 'default' as const, label: 'UPDATE' },
      delete: { variant: 'error' as const, label: 'DELETE' },
      restore: { variant: 'warning' as const, label: 'RESTORE' },
    };
    const config = styles[action.toLowerCase() as keyof typeof styles] || styles.update;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Audit Log</h1>
              <p className="text-cream-300 mt-1">View all system activity and changes</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchAuditLogs}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-cream-400" />
            <Input
              type="text"
              placeholder="Search by action, table, user ID, or record ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">
            Activity Log ({filteredLogs.length} entries)
          </h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
              <p className="text-cream-400">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-cream-400/40 mx-auto mb-4" />
              <p className="text-cream-400">No audit log entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-olive-600">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-200">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-200">Table</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-200">Record ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-200">User ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-200">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive-600/50">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-olive-700/30 transition-colors">
                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4 text-sm text-cream-300">{log.table_name}</td>
                      <td className="py-3 px-4 text-sm text-cream-400 font-mono">{log.record_id || '—'}</td>
                      <td className="py-3 px-4 text-sm text-cream-400 font-mono">{log.user_id || '—'}</td>
                      <td className="py-3 px-4 text-sm text-cream-400">{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
