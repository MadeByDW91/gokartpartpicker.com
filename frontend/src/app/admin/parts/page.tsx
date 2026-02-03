'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { QuickActionsToolbar, type BulkAction } from '@/components/admin/QuickActionsToolbar';
import { AdvancedFilters, type FilterOption, type FilterValue } from '@/components/admin/AdvancedFilters';
import { EnhancedSearch, highlightSearch } from '@/components/admin/EnhancedSearch';
import { formatPrice, getPartBrandDisplay, BRAND_FALLBACK } from '@/lib/utils';
import { Plus, Pencil, Eye, Trash2, Download, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { getAdminParts, deletePart, bulkActivateParts, bulkDeactivateParts } from '@/actions/admin';
import { PART_CATEGORIES } from '@/types/database';
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterValue>({});
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

  // Get unique brands and categories for filters (include "Unbranded" when any part has no brand)
  const uniqueBrands = Array.from(new Set(parts.map((p) => getPartBrandDisplay(p.brand)))).sort();
  const uniqueCategories = Array.from(new Set(parts.map((p) => p.category))).sort();

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: uniqueCategories.map((cat) => ({
        value: cat,
        label: cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    },
    {
      key: 'brand',
      label: 'Brand',
      type: 'select',
      options: uniqueBrands.map((brand) => ({ value: brand, label: brand })),
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
    {
      key: 'min_price',
      label: 'Min Price ($)',
      type: 'number',
      placeholder: 'Minimum price',
    },
    {
      key: 'max_price',
      label: 'Max Price ($)',
      type: 'number',
      placeholder: 'Maximum price',
    },
  ];

  // Quick filters
  const quickFilters = [
    {
      label: 'Missing Images',
      icon: ImageIcon,
      filters: { has_image: false },
    },
    {
      label: 'No Price',
      filters: { has_price: false },
    },
    {
      label: 'Inactive',
      filters: { is_active: false },
    },
  ];

  // Filter parts by search query and filters
  const filteredParts = parts.filter((part) => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        part.name.toLowerCase().includes(query) ||
        getPartBrandDisplay(part.brand).toLowerCase().includes(query) ||
        part.slug?.toLowerCase().includes(query) ||
        part.category.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Advanced filters
    if (filters.category && part.category !== filters.category) return false;
    if (filters.brand) {
      const brandMatch = filters.brand === BRAND_FALLBACK
        ? !part.brand || !String(part.brand).trim()
        : part.brand === filters.brand;
      if (!brandMatch) return false;
    }
    if (filters.is_active !== undefined) {
      const isActive = filters.is_active === 'true' || filters.is_active === true;
      if (part.is_active !== isActive) return false;
    }
    if (filters.min_price && (!part.price || part.price < Number(filters.min_price))) return false;
    if (filters.max_price && (!part.price || part.price > Number(filters.max_price))) return false;
    if (filters.has_image === false && part.image_url) return false;
    if (filters.has_price === false && part.price) return false;

    return true;
  });

  // Selection handlers
  const handleSelectItem = (id: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedItems(new Set(filteredParts.map((p) => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: 'Activate Selected',
      icon: CheckCircle,
      variant: 'success',
      action: async (ids) => {
        const result = await bulkActivateParts(ids);
        if (result.success) {
          await fetchParts();
          setSelectedItems(new Set());
        } else {
          alert(result.error || 'Failed to activate parts');
        }
      },
    },
    {
      label: 'Deactivate Selected',
      icon: XCircle,
      variant: 'default',
      action: async (ids) => {
        const result = await bulkDeactivateParts(ids);
        if (result.success) {
          await fetchParts();
          setSelectedItems(new Set());
        } else {
          alert(result.error || 'Failed to deactivate parts');
        }
      },
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete ${selectedItems.size} part(s)?`,
      action: async (ids) => {
        for (const id of ids) {
          await deletePart(id, false);
        }
        await fetchParts();
        setSelectedItems(new Set());
      },
    },
  ];

  const handleExport = (ids: string[]) => {
    const itemsToExport = filteredParts.filter((p) => ids.includes(p.id));
    const headers = ['Name', 'Slug', 'Category', 'Brand', 'Price', 'Status'];
    const rows = itemsToExport.map((p) => [
      p.name,
      p.slug || '',
      p.category,
      getPartBrandDisplay(p.brand),
      p.price || '',
      p.is_active ? 'Active' : 'Inactive',
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parts-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'name',
      header: 'Part',
      render: (part: AdminPart) => (
        <div>
          <p className="font-medium text-cream-100">
            {searchQuery ? highlightSearch(part.name, searchQuery) : part.name}
          </p>
          <p className="text-xs text-cream-400">
            {part.slug ? (searchQuery ? highlightSearch(part.slug, searchQuery) : part.slug) : '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (part: AdminPart) => (
        <span className="text-cream-300 capitalize">
          {searchQuery ? highlightSearch(part.category.replace(/_/g, ' '), searchQuery) : part.category.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (part: AdminPart) => {
        const brandDisplay = getPartBrandDisplay(part.brand);
        return searchQuery ? highlightSearch(brandDisplay, searchQuery) : brandDisplay;
      },
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
          <Link href="/admin/parts/add">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Part
            </Button>
          </Link>
          <Link href="/admin/parts/export">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
              Export
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

      {/* Enhanced Search */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <EnhancedSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search parts by name, brand, category, slug..."
            suggestions={uniqueBrands}
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filterOptions}
        values={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
        quickFilters={quickFilters}
      />

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar
        selectedItems={selectedItems}
        totalItems={filteredParts.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        bulkActions={bulkActions}
        onExport={handleExport}
        entityName="parts"
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredParts}
        loading={loading}
        emptyMessage="No parts found. Add your first part to get started."
        keyExtractor={(part) => part.id}
        onRowClick={(part) => router.push(`/admin/parts/${part.id}`)}
        selectable
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={(selected) => {
          if (selected) {
            handleSelectAll();
          } else {
            handleDeselectAll();
          }
        }}
      />
    </div>
  );
}
