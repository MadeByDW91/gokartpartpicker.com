'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TableActions } from '@/components/admin/DataTable';
import { formatPrice, formatDate } from '@/lib/utils';
import { Plus, Search, Pencil, Eye, Trash2, Loader2, FileText } from 'lucide-react';
import { getAdminTemplates, deleteTemplate } from '@/actions/templates';
import type { BuildTemplate } from '@/types/templates';

const GOAL_LABELS: Record<string, string> = {
  speed: 'Speed',
  torque: 'Torque',
  budget: 'Budget',
  beginner: 'Beginner',
  competition: 'Competition',
  kids: 'Kids',
};

export default function AdminTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<BuildTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAdminTemplates();
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        setError(result.error || 'Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: BuildTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    setDeleting(template.id);
    setError(null);

    try {
      const result = await deleteTemplate(template.id);
      
      if (result.success) {
        await fetchTemplates();
      } else {
        const errorMsg = result.error || 'Failed to delete template';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setDeleting(null);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.goal.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Template',
      render: (template: BuildTemplate) => (
        <div>
          <p className="font-medium text-cream-100">{template.name}</p>
          <p className="text-xs text-cream-400 mt-1">
            {template.description || 'No description'}
          </p>
        </div>
      ),
    },
    {
      key: 'goal',
      header: 'Goal',
      render: (template: BuildTemplate) => (
        <Badge variant="info" size="sm">
          {GOAL_LABELS[template.goal] || template.goal}
        </Badge>
      ),
    },
    {
      key: 'engine',
      header: 'Engine',
      render: (template: BuildTemplate) => (
        <span className="text-cream-300">
          {template.engine?.name || 'None'}
        </span>
      ),
    },
    {
      key: 'parts',
      header: 'Parts',
      render: (template: BuildTemplate) => (
        <span className="text-cream-300">
          {Object.keys(template.parts || {}).length}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (template: BuildTemplate) => (
        <span className="text-cream-300">
          {template.total_price ? formatPrice(template.total_price) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (template: BuildTemplate) => (
        <div className="flex flex-col gap-1">
          <Badge variant={template.is_public ? 'success' : 'default'} size="sm">
            {template.is_public ? 'Public' : 'Private'}
          </Badge>
          <Badge variant={template.is_active ? 'success' : 'error'} size="sm">
            {template.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (template: BuildTemplate) => (
        <span className="text-cream-400 text-sm">
          {formatDate(template.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (template: BuildTemplate) => (
        <TableActions>
          <Link href={`/admin/templates/${template.id}`}>
            <button
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(template)}
            disabled={deleting === template.id}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deleting === template.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Build Templates</h1>
              <p className="text-cream-300 mt-1">
                Manage preset builds for users
              </p>
            </div>
          </div>
        </div>
        <Link href="/admin/templates/new">
          <Button icon={<Plus className="w-4 h-4" />}>
            New Template
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">
            Templates ({filteredTemplates.length})
          </h2>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredTemplates}
            loading={loading}
            emptyMessage="No templates found. Create your first template!"
            keyExtractor={(template) => template.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
