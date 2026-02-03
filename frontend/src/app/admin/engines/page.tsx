'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { QuickActionsToolbar, type BulkAction } from '@/components/admin/QuickActionsToolbar';
import { AdvancedFilters, type FilterOption, type FilterValue } from '@/components/admin/AdvancedFilters';
import { EnhancedSearch, highlightSearch } from '@/components/admin/EnhancedSearch';
import { formatPrice } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Zap,
  Fuel,
} from 'lucide-react';
import {
  getAdminEngines,
  getAdminMotors,
  deleteEngine,
  deleteMotor,
  bulkActivateEngines,
  bulkDeactivateEngines,
  bulkActivateMotors,
  bulkDeactivateMotors,
} from '@/actions/admin';
import type { AdminEngine, AdminElectricMotor } from '@/types/admin';
import { cn } from '@/lib/utils';

type UnifiedRow =
  | { powerSource: 'gas'; id: string; engine: AdminEngine }
  | { powerSource: 'electric'; id: string; motor: AdminElectricMotor };

function TypeBadge({ type }: { type: 'gas' | 'electric' }) {
  if (type === 'gas') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
          'border-orange-500/40 bg-orange-500/10 text-orange-400'
        )}
      >
        <Fuel className="w-3 h-3" />
        Gas
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        'border-blue-500/40 bg-blue-500/10 text-blue-400'
      )}
    >
      <Zap className="w-3 h-3" />
      EV
    </span>
  );
}

export default function AdminEnginesPage() {
  const [engines, setEngines] = useState<AdminEngine[]>([]);
  const [motors, setMotors] = useState<AdminElectricMotor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterValue>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [engRes, motRes] = await Promise.all([
        getAdminEngines(),
        getAdminMotors(),
      ]);
      if (engRes.success && engRes.data) {
        setEngines(engRes.data as unknown as AdminEngine[]);
      } else if (!engRes.success) {
        setError(engRes.error || 'Failed to fetch engines');
      }
      if (motRes.success && motRes.data) {
        setMotors(motRes.data as AdminElectricMotor[]);
      } else if (!motRes.success) {
        setError(motRes.error || 'Failed to fetch motors');
      }
    } catch (e) {
      console.error('Error fetching engines/motors:', e);
      setError('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const unifiedRows: UnifiedRow[] = useMemo(() => {
    const gas: UnifiedRow[] = engines.map((e) => ({ powerSource: 'gas', id: e.id, engine: e }));
    const ev: UnifiedRow[] = motors.map((m) => ({ powerSource: 'electric', id: m.id, motor: m }));
    return [...gas, ...ev];
  }, [engines, motors]);

  const uniqueBrands = useMemo(
    () =>
      Array.from(
        new Set([
          ...engines.map((e) => e.brand),
          ...motors.map((m) => m.brand),
        ].filter(Boolean))
      ).sort() as string[],
    [engines, motors]
  );

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        key: 'powerSource',
        label: 'Type',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'gas', label: 'Gas' },
          { value: 'electric', label: 'EV' },
        ],
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'select',
        options: uniqueBrands.map((b) => ({ value: b, label: b })),
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
      { key: 'min_hp', label: 'Min HP', type: 'number', placeholder: 'Min horsepower' },
      { key: 'max_hp', label: 'Max HP', type: 'number', placeholder: 'Max horsepower' },
    ],
    [uniqueBrands]
  );

  const quickFilters = [
    { label: 'Missing Images', icon: ImageIcon, filters: { has_image: false } },
    { label: 'No Price', filters: { has_price: false } },
    { label: 'Inactive', filters: { is_active: false } },
  ];

  const filteredRows = useMemo(() => {
    return unifiedRows.filter((row) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = row.powerSource === 'gas' ? row.engine.name : row.motor.name;
        const brand = row.powerSource === 'gas' ? row.engine.brand : row.motor.brand;
        const slug = row.powerSource === 'gas' ? row.engine.slug : row.motor.slug;
        const model = row.powerSource === 'gas' ? row.engine.model : row.motor.model;
        const variant = row.powerSource === 'gas' ? row.engine.variant : row.motor.variant;
        const extra = row.powerSource === 'electric' ? String(row.motor.voltage) : '';
        const match =
          name.toLowerCase().includes(q) ||
          brand.toLowerCase().includes(q) ||
          slug.toLowerCase().includes(q) ||
          model?.toLowerCase().includes(q) ||
          variant?.toLowerCase().includes(q) ||
          extra.includes(q);
        if (!match) return false;
      }
      if (filters.powerSource) {
        if (row.powerSource !== filters.powerSource) return false;
      }
      if (filters.brand) {
        const brand = row.powerSource === 'gas' ? row.engine.brand : row.motor.brand;
        if (brand !== filters.brand) return false;
      }
      if (filters.is_active !== undefined) {
        const active = filters.is_active === 'true' || filters.is_active === true;
        const isActive = row.powerSource === 'gas' ? row.engine.is_active : row.motor.is_active;
        if (isActive !== active) return false;
      }
      const hp = row.powerSource === 'gas' ? row.engine.horsepower : row.motor.horsepower;
      if (filters.min_hp && hp < Number(filters.min_hp)) return false;
      if (filters.max_hp && hp > Number(filters.max_hp)) return false;
      if (filters.has_image === false) {
        const url = row.powerSource === 'gas' ? row.engine.image_url : row.motor.image_url;
        if (url) return false;
      }
      if (filters.has_price === false) {
        const price = row.powerSource === 'gas' ? row.engine.price : row.motor.price;
        if (price) return false;
      }
      return true;
    });
  }, [unifiedRows, searchQuery, filters]);

  const handleDelete = async (row: UnifiedRow) => {
    const name = row.powerSource === 'gas' ? row.engine.name : row.motor.name;
    if (!confirm(`Are you sure you want to delete "${name}"? This will deactivate it.`)) return;
    setDeleting(row.id);
    setError(null);
    try {
      const result =
        row.powerSource === 'gas'
          ? await deleteEngine(row.id, false)
          : await deleteMotor(row.id, false);
      if (result.success) await fetchAll();
      else {
        setError(result.error || 'Delete failed');
        alert(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const engineIds = useMemo(() => new Set(engines.map((e) => e.id)), [engines]);
  const motorIds = useMemo(() => new Set(motors.map((m) => m.id)), [motors]);

  const bulkActions: BulkAction[] = useMemo(
    () => [
      {
        label: 'Activate Selected',
        icon: CheckCircle,
        variant: 'success',
        action: async (ids) => {
          const eIds = ids.filter((id) => engineIds.has(id));
          const mIds = ids.filter((id) => motorIds.has(id));
          if (eIds.length) await bulkActivateEngines(eIds);
          if (mIds.length) await bulkActivateMotors(mIds);
          await fetchAll();
          setSelectedItems(new Set());
        },
      },
      {
        label: 'Deactivate Selected',
        icon: XCircle,
        variant: 'default',
        action: async (ids) => {
          const eIds = ids.filter((id) => engineIds.has(id));
          const mIds = ids.filter((id) => motorIds.has(id));
          if (eIds.length) await bulkDeactivateEngines(eIds);
          if (mIds.length) await bulkDeactivateMotors(mIds);
          await fetchAll();
          setSelectedItems(new Set());
        },
      },
      {
        label: 'Delete Selected',
        icon: Trash2,
        variant: 'danger',
        requiresConfirmation: true,
        confirmationMessage: `Delete ${selectedItems.size} selected item(s)? They will be deactivated.`,
        action: async (ids) => {
          for (const id of ids) {
            if (engineIds.has(id)) await deleteEngine(id, false);
            else if (motorIds.has(id)) await deleteMotor(id, false);
          }
          await fetchAll();
          setSelectedItems(new Set());
        },
      },
    ],
    [engineIds, motorIds, selectedItems.size]
  );

  const handleExport = (ids: string[]) => {
    const rows = filteredRows.filter((r) => ids.includes(r.id));
    const headers = ['Type', 'Name', 'Brand', 'Spec', 'HP', 'Price', 'Status'];
    const spec = (r: UnifiedRow) =>
      r.powerSource === 'gas'
        ? `${r.engine.displacement_cc}cc`
        : `${r.motor.voltage}V · ${r.motor.power_kw}kW`;
    const rowsCsv = rows.map((r) => [
      r.powerSource === 'gas' ? 'Gas' : 'EV',
      r.powerSource === 'gas' ? r.engine.name : r.motor.name,
      r.powerSource === 'gas' ? r.engine.brand : r.motor.brand,
      spec(r),
      r.powerSource === 'gas' ? r.engine.horsepower : r.motor.horsepower,
      r.powerSource === 'gas' ? (r.engine.price ?? '') : (r.motor.price ?? ''),
      (r.powerSource === 'gas' ? r.engine.is_active : r.motor.is_active) ? 'Active' : 'Inactive',
    ]);
    const csv = [
      headers.join(','),
      ...rowsCsv.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engines-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSelectAll = () => setSelectedItems(new Set(filteredRows.map((r) => r.id)));
  const handleDeselectAll = () => setSelectedItems(new Set());
  const handleSelectItem = (id: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (row: UnifiedRow) => <TypeBadge type={row.powerSource} />,
    },
    {
      key: 'name',
      header: 'Engine',
      render: (row: UnifiedRow) => {
        const name = row.powerSource === 'gas' ? row.engine.name : row.motor.name;
        const slug = row.powerSource === 'gas' ? row.engine.slug : row.motor.slug;
        return (
          <div>
            <p className="font-medium text-cream-100">
              {searchQuery ? highlightSearch(name, searchQuery) : name}
            </p>
            <p className="text-xs text-cream-400">
              {searchQuery ? highlightSearch(slug, searchQuery) : slug}
            </p>
          </div>
        );
      },
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (row: UnifiedRow) => {
        const brand = row.powerSource === 'gas' ? row.engine.brand : row.motor.brand;
        return searchQuery ? highlightSearch(brand, searchQuery) : brand;
      },
    },
    {
      key: 'spec',
      header: 'Spec',
      render: (row: UnifiedRow) =>
        row.powerSource === 'gas'
          ? `${row.engine.displacement_cc}cc`
          : `${row.motor.voltage}V · ${row.motor.power_kw}kW`,
    },
    {
      key: 'horsepower',
      header: 'HP',
      render: (row: UnifiedRow) =>
        row.powerSource === 'gas' ? `${row.engine.horsepower} HP` : `${row.motor.horsepower} HP`,
    },
    {
      key: 'price',
      header: 'Price',
      render: (row: UnifiedRow) => {
        const price = row.powerSource === 'gas' ? row.engine.price : row.motor.price;
        return price ? formatPrice(price) : '—';
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row: UnifiedRow) => (
        <StatusBadge active={row.powerSource === 'gas' ? row.engine.is_active : row.motor.is_active} />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (row: UnifiedRow) => {
        const viewHref = row.powerSource === 'gas' ? `/engines/${row.engine.slug}` : `/motors/${row.motor.slug}`;
        const editHref = row.powerSource === 'gas' ? `/admin/engines/${row.id}` : `/admin/motors/${row.id}`;
        return (
          <TableActions>
            <Link href={viewHref} target="_blank">
              <button
                className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
            </Link>
            <Link href={editHref}>
              <button
                className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => handleDelete(row)}
              disabled={deleting === row.id}
              className="p-2 text-cream-400 hover:text-red-400 hover:bg-olive-600 rounded transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </TableActions>
        );
      },
    },
  ];

  const totalCount = engines.length + motors.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Engines</h1>
          <p className="text-cream-300 mt-1">
            {loading
              ? 'Loading...'
              : `${totalCount} engines in catalog (${engines.length} gas · ${motors.length} EV)`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <Link href="/admin/add?type=gas">
            <Button size="sm" icon={<Fuel className="w-4 h-4" />}>
              Add Gas Engine
            </Button>
          </Link>
          <Link href="/admin/add?type=ev">
            <Button size="sm" icon={<Zap className="w-4 h-4" />}>
              Add Electric Motor
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[rgba(166,61,64,0.1)] border border-[rgba(166,61,64,0.3)] rounded-md">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <EnhancedSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, brand, model, slug..."
            suggestions={uniqueBrands}
          />
        </div>
      </div>

      <AdvancedFilters
        filters={filterOptions}
        values={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
        quickFilters={quickFilters}
      />

      <QuickActionsToolbar
        selectedItems={selectedItems}
        totalItems={filteredRows.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        bulkActions={bulkActions}
        onExport={handleExport}
        entityName="engines"
      />

      <DataTable
        columns={columns}
        data={filteredRows}
        loading={loading}
        emptyMessage="No engines found. Add a gas engine or electric motor to get started."
        keyExtractor={(row) => row.id}
        onRowClick={(row) =>
          router.push(
            row.powerSource === 'gas' ? `/admin/engines/${row.id}` : `/admin/motors/${row.id}`
          )
        }
        selectable
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={(selected) => (selected ? handleSelectAll() : handleDeselectAll())}
      />
    </div>
  );
}
