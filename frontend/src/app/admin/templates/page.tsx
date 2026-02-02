'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { Plus, Search, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
import { getAdminTemplates, deleteTemplate } from '@/actions/templates';
import type { BuildTemplate } from '@/types/templates';

const GOAL_LABELS: Record<string, string> = {
  speed: 'Speed',
  torque: 'Torque',
  budget: 'Budget',
  beginner: 'Beginner',
  competition: 'Competition',
  kids: 'Kids',
  offroad: 'Off-Road',
  onroad: 'On-Road',
  racing: 'Racing',
};

export default function AdminTemplatesPage() {
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
      if (result.success) setTemplates(result.data);
      else setError(result.error || 'Failed to fetch templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: BuildTemplate) => {
    if (!confirm(`Delete "${template.name}"?`)) return;
    setDeleting(template.id);
    setError(null);
    try {
      const result = await deleteTemplate(template.id);
      if (result.success) await fetchTemplates();
      else { setError(result.error || 'Delete failed'); alert(result.error); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = templates.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.goal.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex text-sm text-cream-400 hover:text-orange-400 transition-colors mb-3">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Build Templates</h1>
              <p className="text-cream-300 mt-0.5">Manage preset builds for users</p>
            </div>
          </div>
        </div>
        <Link href="/admin/templates/new">
          <Button icon={<Plus className="w-4 h-4" />}>New Template</Button>
        </Link>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search: inline, no card */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <span className="text-sm text-cream-400">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Card grid instead of table */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-36">
              <CardContent className="p-4">
                <div className="h-5 w-3/4 bg-olive-600 rounded animate-pulse mb-3" />
                <div className="h-4 w-1/2 bg-olive-600 rounded animate-pulse mb-4" />
                <div className="h-4 w-1/4 bg-olive-600 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-cream-400">No templates found. Create your first template!</p>
          </CardContent>
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    href={`/admin/templates/${t.id}`}
                    className="font-semibold text-cream-100 hover:text-orange-400 transition-colors line-clamp-2 leading-tight"
                  >
                    {t.name}
                  </Link>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/admin/templates/${t.id}`}
                      className="p-1.5 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deleting === t.id}
                      className="p-1.5 text-cream-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="info" size="sm">
                    {GOAL_LABELS[t.goal] || t.goal}
                  </Badge>
                  <span className="text-cream-500 text-sm">·</span>
                  <span className="text-cream-400 text-sm truncate">{t.engine?.name || 'No engine'}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-olive-600">
                  <span className="text-xs text-cream-500">
                    {t.is_public ? 'Public' : 'Private'} · {t.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-orange-400 font-semibold">
                    {t.total_price ? formatPrice(t.total_price) : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
