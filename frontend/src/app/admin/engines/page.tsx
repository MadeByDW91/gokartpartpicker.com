'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { formatPrice } from '@/lib/utils';
import { Plus, Search, Pencil, Eye, Trash2, Upload, Download } from 'lucide-react';
import { getAdminEngines, deleteEngine } from '@/actions/admin';
import type { AdminEngine } from '@/types/admin';

export default function AdminEnginesPage() {
  const [engines, setEngines] = useState<AdminEngine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchEngines = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminEngines();
      
      if (result.success) {
        setEngines(result.data as AdminEngine[]);
      } else {
        setError(result.error || 'Failed to fetch engines');
      }
    } catch (error) {
      console.error('Error fetching engines:', error);
      setError('Failed to fetch engines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngines();
  }, []);

  const handleDelete = async (engine: AdminEngine) => {
    if (!confirm(`Are you sure you want to delete "${engine.name}"? This will deactivate the engine.`)) {
      return;
    }

    setDeleting(engine.id);
    setError(null);
    try {
      const result = await deleteEngine(engine.id, false); // Soft delete
      
      if (result.success) {
        // Refresh the list
        await fetchEngines();
      } else {
        const errorMsg = result.error || 'Failed to delete engine';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting engine:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete engine';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Filter engines by search query
  const filteredEngines = engines.filter((engine) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      engine.name.toLowerCase().includes(query) ||
      engine.brand.toLowerCase().includes(query) ||
      engine.slug.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Engine',
      render: (engine: AdminEngine) => (
        <div>
          <p className="font-medium text-cream-100">{engine.name}</p>
          <p className="text-xs text-cream-400">{engine.slug}</p>
        </div>
      ),
    },
    {
      key: 'brand',
      header: 'Brand',
    },
    {
      key: 'displacement_cc',
      header: 'Displacement',
      render: (engine: AdminEngine) => `${engine.displacement_cc}cc`,
    },
    {
      key: 'horsepower',
      header: 'HP',
      render: (engine: AdminEngine) => `${engine.horsepower} HP`,
    },
    {
      key: 'shaft_diameter',
      header: 'Shaft',
      render: (engine: AdminEngine) => `${engine.shaft_diameter}"`,
    },
    {
      key: 'price',
      header: 'Price',
      render: (engine: AdminEngine) => 
        engine.price ? formatPrice(engine.price) : '—',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (engine: AdminEngine) => <StatusBadge active={engine.is_active} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (engine: AdminEngine) => (
        <TableActions>
          <Link href={`/engines/${engine.slug}`} target="_blank">
            <button 
              className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <Link href={`/admin/engines/${engine.id}`}>
            <button 
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(engine)}
            disabled={deleting === engine.id}
            className="p-2 text-cream-400 hover:text-red-400 hover:bg-olive-600 rounded transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Engines</h1>
          <p className="text-cream-300 mt-1">
            {loading ? 'Loading...' : `${engines.length} engines in catalog`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/engines/import">
            <Button variant="secondary" size="sm" icon={<Upload className="w-4 h-4" />}>
              Import
            </Button>
          </Link>
          <Link href="/admin/engines/export">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </Link>
          <Link href="/admin/engines/new">
            <Button icon={<Plus className="w-4 h-4" />}>
              Add Engine
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[rgba(166,61,64,0.1)] border border-[rgba(166,61,64,0.3)] rounded-md">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search engines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredEngines}
        loading={loading}
        emptyMessage="No engines found. Add your first engine to get started."
        keyExtractor={(engine) => engine.id}
        onRowClick={(engine) => router.push(`/admin/engines/${engine.id}`)}
      />
    </div>
  );
}
