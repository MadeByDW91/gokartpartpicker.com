'use client';

import { cn } from '@/lib/utils';
import { CheckSquare, Square } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  sortable?: boolean;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  // Multi-select support
  selectable?: boolean;
  selectedItems?: Set<string>;
  onSelectItem?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  keyExtractor,
  selectable = false,
  selectedItems = new Set(),
  onSelectItem,
  onSelectAll,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => selectedItems.has(keyExtractor(item)));
  const someSelected = data.some((item) => selectedItems.has(keyExtractor(item))) && !allSelected;
  if (loading) {
    return (
      <div className="border border-olive-600 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-olive-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-cream-300 uppercase tracking-wide',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-olive-600">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="bg-olive-800">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-olive-600 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-olive-600 rounded-lg p-12 text-center">
        <p className="text-cream-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block border border-olive-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-olive-700">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 w-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAll?.(!allSelected);
                      }}
                      className="p-1 hover:bg-olive-600 rounded transition-colors"
                      title={allSelected ? 'Deselect All' : 'Select All'}
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-400" />
                      ) : someSelected ? (
                        <div className="w-4 h-4 border-2 border-orange-400 rounded bg-orange-400/20" />
                      ) : (
                        <Square className="w-4 h-4 text-cream-400" />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-cream-300 uppercase tracking-wide',
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-600">
              {data.map((item) => {
                const itemId = keyExtractor(item);
                const isSelected = selectedItems.has(itemId);
                return (
                  <tr
                    key={itemId}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'bg-olive-800 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-olive-700',
                      isSelected && 'bg-orange-500/10'
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectItem?.(itemId, !isSelected)}
                          className="p-1 hover:bg-olive-600 rounded transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-orange-400" />
                          ) : (
                            <Square className="w-4 h-4 text-cream-400" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-4 text-sm text-cream-200',
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {data.map((item) => {
          const itemId = keyExtractor(item);
          const isSelected = selectedItems.has(itemId);
          return (
            <div
              key={itemId}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border border-olive-600 rounded-lg bg-olive-800 p-4 transition-colors touch-manipulation',
                onRowClick && 'cursor-pointer active:bg-olive-700',
                isSelected && 'bg-orange-500/10 border-orange-500/30'
              )}
            >
              <div className="flex items-start gap-3">
                {selectable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem?.(itemId, !isSelected);
                    }}
                    className="mt-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-orange-400" />
                    ) : (
                      <Square className="w-5 h-5 text-cream-400" />
                    )}
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  {columns.map((col) => (
                    <div key={col.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs font-medium text-cream-400 uppercase tracking-wide sm:w-1/3">
                        {typeof col.header === 'string' ? col.header : col.key}
                      </span>
                      <span className="text-sm text-cream-200 sm:w-2/3 sm:text-right">
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Status badge component for use in tables
interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 text-xs font-medium rounded-full border',
        active
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// Actions dropdown for table rows
interface TableActionsProps {
  children: React.ReactNode;
}

export function TableActions({ children }: TableActionsProps) {
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
