'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import {
  ChevronLeft,
  Settings,
  History,
  Undo2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Plus,
  FileText,
  Save,
  Trash2,
} from 'lucide-react';
import {
  getBulkOperations,
  undoBulkOperation,
  getBulkOperationTemplates,
  deleteBulkOperationTemplate,
  type BulkOperation,
  type BulkOperationTemplate,
  type BulkEntityType,
} from '@/actions/admin/bulk-operations';
import { BulkOperationBuilder } from '@/components/admin/BulkOperationBuilder';

const STATUS_COLORS: Record<BulkOperation['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  running: { label: 'Running', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

const ENTITY_LABELS: Record<BulkEntityType, string> = {
  engine: 'Engines',
  part: 'Parts',
  build: 'Builds',
  template: 'Templates',
  guide: 'Guides',
  video: 'Videos',
};

export default function BulkOperationsPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'new' | 'templates'>('list');
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [templates, setTemplates] = useState<BulkOperationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntityType, setSelectedEntityType] = useState<BulkEntityType>('engine');
  const [undoing, setUndoing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'list') {
      fetchOperations();
    } else if (view === 'templates') {
      fetchTemplates();
    }
  }, [view]);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const result = await getBulkOperations();
      if (result.success && result.data) {
        setOperations(result.data);
      }
    } catch (err) {
      console.error('Error fetching operations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const result = await getBulkOperationTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (operationId: string) => {
    if (!confirm('Are you sure you want to undo this operation? This will restore the previous state.')) {
      return;
    }

    setUndoing(operationId);
    setError(null);

    try {
      const result = await undoBulkOperation(operationId);
      if (result.success) {
        await fetchOperations();
      } else if (!result.success) {
        setError(result.error || 'Failed to undo operation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to undo operation');
    } finally {
      setUndoing(null);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      const result = await deleteBulkOperationTemplate(templateId);
      if (result.success) {
        await fetchTemplates();
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleOperationComplete = (operationId: string) => {
    setView('list');
    fetchOperations();
  };

  const operationColumns = [
    {
      key: 'name',
      header: 'Operation',
      render: (op: BulkOperation) => (
        <div>
          <p className="font-medium text-cream-100">{op.name}</p>
          {op.description && (
            <p className="text-xs text-cream-400 mt-1">{op.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (op: BulkOperation) => (
        <div className="space-y-1">
          <Badge variant="info" size="sm">
            {ENTITY_LABELS[op.entity_type]}
          </Badge>
          <p className="text-xs text-cream-400 capitalize">{op.operation_type}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (op: BulkOperation) => {
        const statusConfig = STATUS_COLORS[op.status];
        return (
          <Badge
            variant="default"
            size="sm"
            className={statusConfig.color}
          >
            {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (op: BulkOperation) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cream-400">
              {op.completed_count} / {op.affected_count}
            </span>
            {op.failed_count > 0 && (
              <span className="text-red-400">{op.failed_count} failed</span>
            )}
          </div>
          {op.affected_count > 0 && (
            <div className="w-full h-2 bg-olive-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${(op.completed_count / op.affected_count) * 100}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (op: BulkOperation) => (
        <div className="space-y-1">
          <p className="text-sm text-cream-300">{formatDate(op.created_at)}</p>
          {op.scheduled_at && (
            <p className="text-xs text-cream-500">
              Scheduled: {formatDate(op.scheduled_at)}
            </p>
          )}
          {op.completed_at && (
            <p className="text-xs text-green-400">
              Completed: {formatDate(op.completed_at)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'undo',
      header: '',
      render: (op: BulkOperation) => (
        <div className="flex items-center gap-2">
          {op.status === 'completed' && op.can_undo && op.expires_at && new Date(op.expires_at) > new Date() && (
            <button
              onClick={() => handleUndo(op.id)}
              disabled={undoing === op.id}
              className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded transition-colors disabled:opacity-50"
              title="Undo Operation"
            >
              {undoing === op.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Undo2 className="w-4 h-4" />
              )}
            </button>
          )}
          {!op.can_undo && (
            <span className="text-xs text-cream-500">Undone</span>
          )}
          {op.expires_at && new Date(op.expires_at) < new Date() && (
            <span className="text-xs text-cream-500">Expired</span>
          )}
        </div>
      ),
    },
  ];

  if (view === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setView('list')}
              className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Operations
            </button>
            <h1 className="text-display text-3xl text-cream-100">New Bulk Operation</h1>
            <p className="text-cream-300 mt-1">Create a bulk operation for {ENTITY_LABELS[selectedEntityType].toLowerCase()}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-cream-200 mb-2">
            Entity Type
          </label>
          <select
            value={selectedEntityType}
            onChange={(e) => setSelectedEntityType(e.target.value as BulkEntityType)}
            className="w-full px-4 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {Object.entries(ENTITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <BulkOperationBuilder
          entityType={selectedEntityType}
          onExecute={handleOperationComplete}
          onCancel={() => setView('list')}
        />
      </div>
    );
  }

  if (view === 'templates') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setView('list')}
              className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Operations
            </button>
            <h1 className="text-display text-3xl text-cream-100">Operation Templates</h1>
            <p className="text-cream-300 mt-1">Saved bulk operation workflows</p>
          </div>
        </div>

        {templates.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-olive-600 mx-auto mb-4 opacity-50" />
              <p className="text-cream-400">No templates yet. Save common workflows to reuse them.</p>
            </CardContent>
          </Card>
        )}

        {templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-cream-100">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-cream-400 mt-1">{template.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-cream-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="info" size="sm">
                    {ENTITY_LABELS[template.entity_type]}
                  </Badge>
                  <p className="text-xs text-cream-500 capitalize">{template.operation_type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

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
            <Settings className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Bulk Operations</h1>
              <p className="text-cream-300 mt-1">
                Manage multiple items at once with undo support
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setView('templates')}
            icon={<FileText className="w-4 h-4" />}
          >
            Templates
          </Button>
          <Button
            variant="primary"
            onClick={() => setView('new')}
            icon={<Plus className="w-4 h-4" />}
          >
            New Operation
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Operations History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Operation History</h2>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={operationColumns}
            data={operations}
            loading={loading}
            emptyMessage="No bulk operations yet. Create one to get started."
            keyExtractor={(op) => op.id}
          />
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-olive-700/30 border-olive-600">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-cream-100 mb-2">About Bulk Operations</h3>
          <ul className="text-xs text-cream-400 space-y-1 list-disc list-inside">
            <li>Preview changes before applying</li>
            <li>Undo operations within 30 days</li>
            <li>Schedule operations for future execution</li>
            <li>Save common workflows as templates</li>
            <li>Track progress for large operations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
