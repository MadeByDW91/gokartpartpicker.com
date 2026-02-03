'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { QuickActionsToolbar, type BulkAction } from '@/components/admin/QuickActionsToolbar';
import { AdvancedFilters, type FilterOption, type FilterValue } from '@/components/admin/AdvancedFilters';
import { EnhancedSearch, highlightSearch } from '@/components/admin/EnhancedSearch';
import { formatPrice, getMotorBrandDisplay, MOTOR_BRAND_FALLBACK } from '@/lib/utils';
import { Plus, Pencil, Eye, Trash2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { getAdminMotors, deleteMotor, bulkActivateMotors, bulkDeactivateMotors } from '@/actions/admin';
import type { AdminElectricMotor } from '@/types/admin';

export default function AdminMotorsPage() {
  const [motors, setMotors] = useState<AdminElectricMotor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterValue>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchMotors = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminMotors();
      
      if (result.success) {
        setMotors(result.data as AdminElectricMotor[]);
      } else {
        setError(result.error || 'Failed to fetch electric motors');
      }
    } catch (error) {
      console.error('Error fetching electric motors:', error);
      setError('Failed to fetch electric motors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotors();
  }, []);

  const handleDelete = async (motor: AdminElectricMotor) => {
    if (!confirm(`Are you sure you want to delete "${motor.name}"? This will deactivate the motor.`)) {
      return;
    }

    setDeleting(motor.id);
    setError(null);
    try {
      const result = await deleteMotor(motor.id, false); // Soft delete
      
      if (result.success) {
        // Refresh the list
        await fetchMotors();
      } else {
        const errorMsg = result.error || 'Failed to delete electric motor';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting electric motor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete electric motor';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Get unique brands and voltages for filters (include "Unbranded" when any motor has no brand)
  const uniqueBrands = Array.from(new Set(motors.map((m) => getMotorBrandDisplay(m.brand)))).sort();
  const uniqueVoltages = Array.from(new Set(motors.map((m) => m.voltage))).sort((a, b) => a - b);

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'brand',
      label: 'Brand',
      type: 'select',
      options: uniqueBrands.map((brand) => ({ value: brand, label: brand })),
    },
    {
      key: 'voltage',
      label: 'Voltage',
      type: 'select',
      options: uniqueVoltages.map((v) => ({ value: String(v), label: `${v}V` })),
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
      key: 'min_hp',
      label: 'Min HP',
      type: 'number',
      placeholder: 'Minimum horsepower',
    },
    {
      key: 'max_hp',
      label: 'Max HP',
      type: 'number',
      placeholder: 'Maximum horsepower',
    },
    {
      key: 'min_power_kw',
      label: 'Min Power (kW)',
      type: 'number',
      placeholder: 'Minimum power',
    },
    {
      key: 'max_power_kw',
      label: 'Max Power (kW)',
      type: 'number',
      placeholder: 'Maximum power',
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

  // Filter motors by search query and filters
  const filteredMotors = motors.filter((motor) => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const brandDisplay = getMotorBrandDisplay(motor.brand);
      const matchesSearch =
        motor.name.toLowerCase().includes(query) ||
        brandDisplay.toLowerCase().includes(query) ||
        motor.slug.toLowerCase().includes(query) ||
        motor.voltage.toString().includes(query) ||
        motor.model?.toLowerCase().includes(query) ||
        motor.variant?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Advanced filters
    if (filters.brand) {
      const brandMatch = filters.brand === MOTOR_BRAND_FALLBACK
        ? !motor.brand || !String(motor.brand).trim()
        : motor.brand === filters.brand;
      if (!brandMatch) return false;
    }
    if (filters.voltage && motor.voltage !== Number(filters.voltage)) return false;
    if (filters.is_active !== undefined) {
      const isActive = filters.is_active === 'true' || filters.is_active === true;
      if (motor.is_active !== isActive) return false;
    }
    if (filters.min_hp && motor.horsepower < Number(filters.min_hp)) return false;
    if (filters.max_hp && motor.horsepower > Number(filters.max_hp)) return false;
    if (filters.min_power_kw && motor.power_kw < Number(filters.min_power_kw)) return false;
    if (filters.max_power_kw && motor.power_kw > Number(filters.max_power_kw)) return false;
    if (filters.has_image === false && motor.image_url) return false;
    if (filters.has_price === false && motor.price) return false;

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
    setSelectedItems(new Set(filteredMotors.map((m) => m.id)));
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
        const result = await bulkActivateMotors(ids);
        if (result.success) {
          await fetchMotors();
          setSelectedItems(new Set());
        } else {
          alert(result.error || 'Failed to activate motors');
        }
      },
    },
    {
      label: 'Deactivate Selected',
      icon: XCircle,
      variant: 'default',
      action: async (ids) => {
        const result = await bulkDeactivateMotors(ids);
        if (result.success) {
          await fetchMotors();
          setSelectedItems(new Set());
        } else {
          alert(result.error || 'Failed to deactivate motors');
        }
      },
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete ${selectedItems.size} motor(s)?`,
      action: async (ids) => {
        for (const id of ids) {
          await deleteMotor(id, false);
        }
        await fetchMotors();
        setSelectedItems(new Set());
      },
    },
  ];

  const handleExport = (ids: string[]) => {
    const itemsToExport = filteredMotors.filter((m) => ids.includes(m.id));
    const headers = ['Name', 'Brand', 'Voltage', 'Power (kW)', 'HP', 'Torque', 'Price', 'Status'];
    const rows = itemsToExport.map((m) => [
      m.name,
      getMotorBrandDisplay(m.brand),
      m.voltage,
      m.power_kw,
      m.horsepower,
      m.torque_lbft,
      m.price || '',
      m.is_active ? 'Active' : 'Inactive',
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motors-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'name',
      header: 'Motor',
      render: (motor: AdminElectricMotor) => (
        <div>
          <p className="font-medium text-cream-100">
            {searchQuery ? highlightSearch(motor.name, searchQuery) : motor.name}
          </p>
          <p className="text-xs text-cream-400">
            {searchQuery ? highlightSearch(motor.slug, searchQuery) : motor.slug}
          </p>
        </div>
      ),
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (motor: AdminElectricMotor) => {
        const brandDisplay = getMotorBrandDisplay(motor.brand);
        return searchQuery ? highlightSearch(brandDisplay, searchQuery) : brandDisplay;
      },
    },
    {
      key: 'voltage',
      header: 'Voltage',
      render: (motor: AdminElectricMotor) => `${motor.voltage}V`,
    },
    {
      key: 'power_kw',
      header: 'Power',
      render: (motor: AdminElectricMotor) => `${motor.power_kw}kW`,
    },
    {
      key: 'horsepower',
      header: 'HP',
      render: (motor: AdminElectricMotor) => `${motor.horsepower} HP`,
    },
    {
      key: 'torque_lbft',
      header: 'Torque',
      render: (motor: AdminElectricMotor) => `${motor.torque_lbft} lb-ft`,
    },
    {
      key: 'price',
      header: 'Price',
      render: (motor: AdminElectricMotor) => 
        motor.price ? formatPrice(motor.price) : '—',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (motor: AdminElectricMotor) => <StatusBadge active={motor.is_active} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (motor: AdminElectricMotor) => (
        <TableActions>
          <Link href={`/motors/${motor.slug}`} target="_blank">
            <button 
              className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <Link href={`/admin/motors/${motor.id}`}>
            <button 
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(motor)}
            disabled={deleting === motor.id}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Electric Motors</h1>
          <p className="text-cream-400 mt-1">Manage electric motors catalog</p>
        </div>
        <Link href="/admin/add?type=ev">
          <Button icon={<Plus className="w-4 h-4" />}>New Motor</Button>
        </Link>
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Enhanced Search */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <EnhancedSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search motors by name, brand, voltage, model, variant..."
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
        totalItems={filteredMotors.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        bulkActions={bulkActions}
        onExport={handleExport}
        entityName="motors"
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredMotors}
        loading={loading}
        emptyMessage="No electric motors found. Create your first motor!"
        keyExtractor={(motor) => motor.id}
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
