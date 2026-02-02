'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckSquare,
  Square,
  MoreVertical,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: (selectedIds: string[]) => Promise<void> | void;
  variant?: 'default' | 'danger' | 'success';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface QuickActionsToolbarProps<T> {
  selectedItems: Set<string>;
  totalItems: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  bulkActions?: BulkAction[];
  onExport?: (selectedIds: string[]) => void;
  entityName?: string; // e.g., "engines", "parts"
}

export function QuickActionsToolbar<T extends { id: string }>({
  selectedItems,
  totalItems,
  onSelectAll,
  onDeselectAll,
  bulkActions = [],
  onExport,
  entityName = 'items',
}: QuickActionsToolbarProps<T>) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  const selectedCount = selectedItems.size;
  const allSelected = selectedCount === totalItems && totalItems > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalItems;

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedItems.size === 0) return;

    if (action.requiresConfirmation) {
      const message = action.confirmationMessage || 
        `Are you sure you want to perform this action on ${selectedCount} ${entityName}?`;
      if (!confirm(message)) return;
    }

    setProcessing(action.label);
    try {
      await action.action(Array.from(selectedItems));
    } catch (error) {
      console.error('Bulk action error:', error);
      alert(`Failed to ${action.label.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(null);
      setShowActions(false);
    }
  };

  if (selectedCount === 0 && !showActions) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-olive-800 border border-olive-600 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 text-sm text-cream-200 hover:text-cream-100 transition-colors"
            title={allSelected ? 'Deselect All' : 'Select All'}
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-orange-400" />
            ) : (
              <Square className="w-5 h-5 text-cream-400" />
            )}
            <span className="font-medium">
              {selectedCount > 0 ? (
                <>
                  <Badge variant="default" size="sm" className="mr-2">
                    {selectedCount}
                  </Badge>
                  {selectedCount === 1 ? entityName.slice(0, -1) : entityName} selected
                </>
              ) : (
                `Select ${entityName}`
              )}
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              {onExport && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => onExport(Array.from(selectedItems))}
                  disabled={processing !== null}
                >
                  Export
                </Button>
              )}

              {bulkActions.length > 0 && (
                <div className="relative">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<MoreVertical className="w-4 h-4" />}
                    onClick={() => setShowActions(!showActions)}
                    disabled={processing !== null}
                  >
                    Actions
                  </Button>

                  {showActions && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowActions(false)}
                      />
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-1 w-48 bg-olive-800 border border-olive-600 rounded-lg shadow-xl z-50">
                        <div className="py-1">
                          {bulkActions.map((action, idx) => {
                            const Icon = action.icon || MoreVertical;
                            const isProcessing = processing === action.label;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleBulkAction(action)}
                                disabled={isProcessing}
                                className={cn(
                                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                                  action.variant === 'danger'
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : action.variant === 'success'
                                    ? 'text-green-400 hover:bg-green-500/10'
                                    : 'text-cream-200 hover:bg-olive-700',
                                  isProcessing && 'opacity-50 cursor-not-allowed'
                                )}
                              >
                                <Icon className="w-4 h-4" />
                                <span>{action.label}</span>
                                {isProcessing && (
                                  <span className="ml-auto text-xs">...</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {selectedCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onDeselectAll}
              disabled={processing !== null}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
