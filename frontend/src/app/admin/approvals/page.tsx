'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TableActions } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  Wrench,
  BookOpen,
  Video,
  Loader2,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  getPendingApprovals,
  batchApprove,
  batchReject,
  approveItem,
  rejectItem,
  type ApprovalItem,
  type ApprovalType,
} from '@/actions/admin/approvals';
import { reviewTemplate } from '@/actions/templates';

const TYPE_LABELS: Record<ApprovalType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  template: { label: 'Template', icon: FileText, color: 'bg-blue-500' },
  forum_post: { label: 'Forum Post', icon: MessageSquare, color: 'bg-green-500' },
  forum_topic: { label: 'Forum Topic', icon: MessageSquare, color: 'bg-green-500' },
  build: { label: 'Build', icon: Wrench, color: 'bg-orange-500' },
  guide: { label: 'Guide', icon: BookOpen, color: 'bg-purple-500' },
  video: { label: 'Video', icon: Video, color: 'bg-red-500' },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<ApprovalType | 'all'>('all');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, [filterType]);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPendingApprovals(filterType === 'all' ? undefined : filterType);

      if (result.success && result.data) {
        setApprovals(result.data);
        setSelectedItems(new Set()); // Clear selection when fetching
      } else if (!result.success) {
        setError(result.error || 'Failed to load approvals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === approvals.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(approvals.map((a) => a.id)));
    }
  };

  const handleApprove = async (item: ApprovalItem) => {
    if (!confirm(`Approve "${item.title}"?`)) return;

    setProcessing(item.id);
    setError(null);

    try {
      let result;

      if (item.type === 'template' && item.template) {
        // Use the existing reviewTemplate function for templates
        result = await reviewTemplate(item.id, 'approved', reviewNotes[item.id] || undefined);
      } else {
        result = await approveItem(item.id, item.type, reviewNotes[item.id] || undefined);
      }

      if (result.success) {
        await fetchApprovals();
        setReviewNotes((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      } else if (!result.success) {
        setError(result.error || 'Failed to approve item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve item');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    if (!confirm(`Reject "${item.title}"?`)) return;

    setProcessing(item.id);
    setError(null);

    try {
      let result;

      if (item.type === 'template' && item.template) {
        // Use the existing reviewTemplate function for templates
        result = await reviewTemplate(item.id, 'rejected', reviewNotes[item.id] || undefined);
      } else {
        result = await rejectItem(item.id, item.type, reviewNotes[item.id] || undefined);
      }

      if (result.success) {
        await fetchApprovals();
        setReviewNotes((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      } else if (!result.success) {
        setError(result.error || 'Failed to reject item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject item');
    } finally {
      setProcessing(null);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Approve ${selectedItems.size} selected item(s)?`)) return;

    setProcessing('batch-approve');
    setError(null);

    try {
      // Group by type
      const byType = Array.from(selectedItems).reduce((acc, id) => {
        const item = approvals.find((a) => a.id === id);
        if (item) {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push(id);
        }
        return acc;
      }, {} as Record<ApprovalType, string[]>);

      // Process each type
      for (const [type, ids] of Object.entries(byType)) {
        const result = await batchApprove(ids, type as ApprovalType);
        if (!result.success) {
          setError(`Failed to approve some ${type}s: ${result.error}`);
        }
      }

      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to batch approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleBatchReject = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Reject ${selectedItems.size} selected item(s)?`)) return;

    setProcessing('batch-reject');
    setError(null);

    try {
      // Group by type
      const byType = Array.from(selectedItems).reduce((acc, id) => {
        const item = approvals.find((a) => a.id === id);
        if (item) {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push(id);
        }
        return acc;
      }, {} as Record<ApprovalType, string[]>);

      // Process each type
      for (const [type, ids] of Object.entries(byType)) {
        const result = await batchReject(ids, type as ApprovalType);
        if (!result.success) {
          setError(`Failed to reject some ${type}s: ${result.error}`);
        }
      }

      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to batch reject');
    } finally {
      setProcessing(null);
    }
  };

  const filteredApprovals = filterType === 'all' 
    ? approvals 
    : approvals.filter((a) => a.type === filterType);

  const columns = [
    {
      key: 'select',
      header: (
        <button
          onClick={selectAll}
          className="p-1 hover:bg-olive-700 rounded transition-colors"
          title={selectedItems.size === approvals.length ? 'Deselect All' : 'Select All'}
        >
          {selectedItems.size === approvals.length ? (
            <CheckSquare className="w-4 h-4 text-orange-400" />
          ) : (
            <Square className="w-4 h-4 text-cream-400" />
          )}
        </button>
      ),
      className: 'w-12',
      render: (item: ApprovalItem) => (
        <button
          onClick={() => toggleSelection(item.id)}
          className="p-1 hover:bg-olive-700 rounded transition-colors"
        >
          {selectedItems.has(item.id) ? (
            <CheckSquare className="w-4 h-4 text-orange-400" />
          ) : (
            <Square className="w-4 h-4 text-cream-400" />
          )}
        </button>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: ApprovalItem) => {
        const config = TYPE_LABELS[item.type];
        const Icon = config.icon;
        return (
          <Badge variant="info" size="sm" className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'title',
      header: 'Item',
      render: (item: ApprovalItem) => (
        <div>
          <p className="font-medium text-cream-100">{item.title}</p>
          {item.description && (
            <p className="text-xs text-cream-400 mt-1 line-clamp-2">{item.description}</p>
          )}
          {item.submittedBy && (
            <p className="text-xs text-cream-500 mt-1">
              Submitted by {item.submittedBy.username || item.submittedBy.email || 'Unknown'}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'metadata',
      header: 'Details',
      render: (item: ApprovalItem) => {
        if (item.type === 'template' && item.metadata) {
          const meta = item.metadata as { goal?: string; parts_count?: number; engine_id?: string };
          return (
            <div className="space-y-1">
              {meta.goal && (
                <Badge variant="default" size="sm">
                  {meta.goal}
                </Badge>
              )}
              {meta.parts_count !== undefined && (
                <p className="text-xs text-cream-400">
                  {meta.parts_count} part{meta.parts_count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          );
        }
        return <span className="text-cream-400 text-sm">—</span>;
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: ApprovalItem) => {
        const priority = item.priority || 'medium';
        return (
          <Badge
            variant={priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'default'}
            size="sm"
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (item: ApprovalItem) => (
        <span className="text-cream-400 text-sm">{formatDate(item.submittedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (item: ApprovalItem) => (
        <TableActions>
          <button
            onClick={() => handleApprove(item)}
            disabled={processing === item.id}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
            title="Approve"
          >
            {processing === item.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleReject(item)}
            disabled={processing === item.id}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
            title="Reject"
          >
            {processing === item.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </button>
        </TableActions>
      ),
    },
  ];

  const typeCounts = approvals.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<ApprovalType, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <Clock className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Approval Queue</h1>
              <p className="text-cream-300 mt-1">
                {loading ? 'Loading...' : `${approvals.length} item${approvals.length !== 1 ? 's' : ''} pending review`}
              </p>
            </div>
          </div>
        </div>
        {selectedItems.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleBatchApprove}
              disabled={!!processing}
              loading={processing === 'batch-approve'}
              icon={<CheckCircle className="w-4 h-4" />}
              className="bg-green-600 border-green-600 hover:bg-green-500 hover:border-green-500"
            >
              Approve Selected ({selectedItems.size})
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBatchReject}
              disabled={!!processing}
              loading={processing === 'batch-reject'}
              icon={<XCircle className="w-4 h-4" />}
            >
              Reject Selected ({selectedItems.size})
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-cream-400" />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={filterType === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({approvals.length})
              </Button>
              {(Object.keys(TYPE_LABELS) as ApprovalType[]).map((type) => {
                const config = TYPE_LABELS[type];
                const Icon = config.icon;
                const count = typeCounts[type] || 0;
                if (count === 0 && filterType !== type) return null;
                return (
                  <Button
                    key={type}
                    variant={filterType === type ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    icon={<Icon className="w-4 h-4" />}
                  >
                    {config.label} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">
            Pending Approvals
          </h2>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredApprovals}
            loading={loading}
            emptyMessage="No pending approvals. Great job! 🎉"
            keyExtractor={(item) => item.id}
          />
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-olive-700/30 border-olive-600">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-cream-100 mb-2">Approval Queue</h3>
          <p className="text-xs text-cream-400">
            This queue consolidates all content requiring admin approval. Currently showing templates.
            Forum flagged content and other approval workflows will appear here as they're implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
