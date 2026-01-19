'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { formatPrice } from '@/lib/utils';
import { Plus, Search, Pencil, Eye, Trash2, Upload, Download, ShoppingCart } from 'lucide-react';
import { getAdminParts, deletePart } from '@/actions/admin';
import { AmazonProductImporter } from '@/components/admin/AmazonProductImporter';
import type { Part } from '@/types/database';

interface AdminPart extends Part {
  slug: string;
  category_id: string | null;
  is_active: boolean;
  updated_at: string;
}

export default function AdminPartsPage() {
  const [parts, setParts] = useState<AdminPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchParts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminParts();
      
      if (result.success) {
        setParts(result.data as AdminPart[]);
      } else {
        setError(result.error || 'Failed to fetch parts');
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
      setError('Failed to fetch parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleDelete = async (part: AdminPart) => {
    if (!confirm(`Are you sure you want to delete "${part.name}"? This will deactivate the part.`)) {
      return;
    }

    setDeleting(part.id);
    setError(null);
    try {
      const result = await deletePart(part.id, false); // Soft delete
      
      if (result.success) {
        // Refresh the list
        await fetchParts();
      } else {
        const errorMsg = result.error || 'Failed to delete part';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting part:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete part';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Filter parts by search query
  const filteredParts = parts.filter((part) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      part.name.toLowerCase().includes(query) ||
      part.brand?.toLowerCase().includes(query) ||
      part.slug?.toLowerCase().includes(query) ||
      part.category.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Part',
      render: (part: AdminPart) => (
        <div>
          <p className="font-medium text-cream-100">{part.name}</p>
          <p className="text-xs text-cream-400">{part.slug || '—'}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (part: AdminPart) => (
        <span className="text-cream-300 capitalize">{part.category.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (part: AdminPart) => part.brand || '—',
    },
    {
      key: 'price',
      header: 'Price',
      render: (part: AdminPart) => 
        part.price ? formatPrice(part.price) : '—',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (part: AdminPart) => <StatusBadge active={part.is_active} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (part: AdminPart) => (
        <TableActions>
          <Link href={`/parts/${part.slug || part.id}`} target="_blank">
            <button 
              className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <Link href={`/admin/parts/${part.id}`}>
            <button 
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(part)}
            disabled={deleting === part.id}
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
          <h1 className="text-display text-3xl text-cream-100">Parts</h1>
          <p className="text-cream-300 mt-1">
            {loading ? 'Loading...' : `${parts.length} parts in catalog`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/parts/import">
            <Button variant="primary" size="sm" icon={<ShoppingCart className="w-4 h-4" />}>
              Import from Amazon
            </Button>
          </Link>
          <Link href="/admin/parts/import">
            <Button variant="secondary" size="sm" icon={<Upload className="w-4 h-4" />}>
              CSV Import
            </Button>
          </Link>
          <Link href="/admin/parts/export">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </Link>
          <Link href="/admin/parts/new">
            <Button variant="secondary" icon={<Plus className="w-4 h-4" />}>
              Add Part
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
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredParts}
        loading={loading}
        emptyMessage="No parts found. Add your first part to get started."
        keyExtractor={(part) => part.id}
        onRowClick={(part) => router.push(`/admin/parts/${part.id}`)}
      />
    </div>
  );
}
