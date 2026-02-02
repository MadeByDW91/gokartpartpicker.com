'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  previewBulkOperation,
  executeBulkOperation,
  type BulkEntityType,
  type BulkOperationType,
  type BulkOperationPreview,
} from '@/actions/admin/bulk-operations';
import { PART_CATEGORIES } from '@/types/database';
import { getCategoryLabel, cn } from '@/lib/utils';
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Settings,
  Calendar,
  Save,
  Play,
  Eye,
} from 'lucide-react';

interface BulkOperationBuilderProps {
  entityType: BulkEntityType;
  onExecute?: (operationId: string) => void;
  onCancel?: () => void;
}

const ENTITY_LABELS: Record<BulkEntityType, string> = {
  engine: 'Engines',
  motor: 'Electric Motors',
  part: 'Parts',
  build: 'Builds',
  template: 'Templates',
  guide: 'Guides',
  video: 'Videos',
};

const OPERATION_TYPES: { value: BulkOperationType; label: string }[] = [
  { value: 'update', label: 'Update Fields' },
  { value: 'activate', label: 'Activate' },
  { value: 'deactivate', label: 'Deactivate' },
  { value: 'delete', label: 'Delete' },
];

export function BulkOperationBuilder({ entityType, onExecute, onCancel }: BulkOperationBuilderProps) {
  const [step, setStep] = useState<'filters' | 'changes' | 'preview' | 'schedule'>('filters');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<BulkOperationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [operationType, setOperationType] = useState<BulkOperationType>('update');
  const [filters, setFilters] = useState<Record<string, unknown>>({
    search: '',
    is_active: undefined,
    brand: '',
    category: '',
  });

  // Changes (for update operation)
  const [changes, setChanges] = useState<Record<string, unknown>>({
    price: '',
    is_active: undefined,
    brand: '',
  });

  // Operation details
  const [operationName, setOperationName] = useState('');
  const [operationDescription, setOperationDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');

  const handlePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build affected IDs (simplified - in production, would query with filters)
      // For now, we'll let the server handle the filtering
      const result = await previewBulkOperation(entityType, filters, changes);

      if (result.success && result.data) {
        setPreviewData(result.data);
        setStep('preview');
      } else if (!result.success) {
        setError(result.error || 'Failed to preview operation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview operation');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!operationName.trim()) {
      setError('Operation name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Server will fetch affected IDs based on filters
      const affectedIds: string[] = [];

      const result = await executeBulkOperation(
        operationName,
        operationDescription || null,
        entityType,
        operationType,
        filters,
        operationType === 'update' ? changes : {},
        affectedIds,
        scheduledAt || null
      );

      if (result.success && result.data) {
        onExecute?.(result.data.id);
      } else if (!result.success) {
        setError(result.error || 'Failed to execute operation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute operation');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handleChangeUpdate = (key: string, value: unknown) => {
    setChanges((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep('filters')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            step === 'filters'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'bg-olive-700 text-cream-200'
          )}
        >
          <Search className="w-4 h-4" />
          1. Filters
        </button>
        <div className="w-8 h-px bg-olive-600" />
        <button
          onClick={() => setStep('changes')}
          disabled={operationType !== 'update'}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            step === 'changes'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'bg-olive-700 text-cream-200 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Settings className="w-4 h-4" />
          2. Changes
        </button>
        <div className="w-8 h-px bg-olive-600" />
        <button
          onClick={() => setStep('preview')}
          disabled={!previewData}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            step === 'preview'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'bg-olive-700 text-cream-200 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Eye className="w-4 h-4" />
          3. Preview
        </button>
        <div className="w-8 h-px bg-olive-600" />
        <button
          onClick={() => setStep('schedule')}
          disabled={!previewData}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            step === 'schedule'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'bg-olive-700 text-cream-200 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Calendar className="w-4 h-4" />
          4. Execute
        </button>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters Step */}
      {step === 'filters' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Step 1: Select Items</h2>
            <p className="text-sm text-cream-400 mt-1">
              Define which {ENTITY_LABELS[entityType].toLowerCase()} to affect
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Operation Type"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value as BulkOperationType)}
            >
              {OPERATION_TYPES.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </Select>

            <Input
              label="Search"
              placeholder="Search by name..."
              value={(filters.search as string) || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />

            {(entityType === 'engine' || entityType === 'motor' || entityType === 'part') && (
              <>
                <Select
                  label="Status"
                  value={(filters.is_active as boolean | undefined) === true ? 'active' : (filters.is_active as boolean | undefined) === false ? 'inactive' : 'all'}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? undefined : e.target.value === 'active';
                    handleFilterChange('is_active', value);
                  }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>

                {entityType === 'engine' && (
                  <Input
                    label="Brand"
                    placeholder="Filter by brand..."
                    value={(filters.brand as string) || ''}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                  />
                )}

                {entityType === 'motor' && (
                  <>
                    <Input
                      label="Brand"
                      placeholder="Filter by brand..."
                      value={(filters.brand as string) || ''}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                    />
                    <Select
                      label="Voltage"
                      value={filters.voltage ? String(filters.voltage) : ''}
                      onChange={(e) => handleFilterChange('voltage', e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">All Voltages</option>
                      <option value="12">12V</option>
                      <option value="24">24V</option>
                      <option value="36">36V</option>
                      <option value="48">48V</option>
                      <option value="72">72V</option>
                      <option value="96">96V</option>
                    </Select>
                  </>
                )}

                {entityType === 'part' && (
                  <Select
                    label="Category"
                    value={(filters.category as string) || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {PART_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                  </Select>
                )}
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePreview}
                disabled={loading}
                loading={loading}
                variant="primary"
                icon={<Eye className="w-4 h-4" />}
              >
                Preview Operation
              </Button>
              {onCancel && (
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Changes Step */}
      {step === 'changes' && operationType === 'update' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Step 2: Define Changes</h2>
            <p className="text-sm text-cream-400 mt-1">
              What changes to apply to selected items
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(entityType === 'engine' || entityType === 'part') && (
              <>
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  placeholder="Leave empty to keep unchanged"
                  value={(changes.price as string | number) || ''}
                  onChange={(e) => handleChangeUpdate('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                />

                <Select
                  label="Status"
                  value={(changes.is_active as boolean | undefined) === true ? 'active' : (changes.is_active as boolean | undefined) === false ? 'inactive' : 'keep'}
                  onChange={(e) => {
                    const value = e.target.value === 'keep' ? undefined : e.target.value === 'active';
                    handleChangeUpdate('is_active', value);
                  }}
                >
                  <option value="keep">Keep Current</option>
                  <option value="active">Set Active</option>
                  <option value="inactive">Set Inactive</option>
                </Select>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePreview}
                disabled={loading}
                loading={loading}
                variant="primary"
                icon={<Eye className="w-4 h-4" />}
              >
                Preview Changes
              </Button>
              <Button variant="secondary" onClick={() => setStep('filters')}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {step === 'preview' && previewData && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Step 3: Preview</h2>
            <p className="text-sm text-cream-400 mt-1">
              Review what will be changed
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-olive-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-cream-300">Items Affected</p>
                <Badge variant="info" size="sm" className="text-lg">
                  {previewData.affectedCount}
                </Badge>
              </div>
              {previewData.warnings.length > 0 && (
                <div className="space-y-2 mb-4">
                  {previewData.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-400">{warning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {previewData.sampleItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-cream-200 mb-2">Sample Preview (first 5 items)</h3>
                <div className="space-y-2">
                  {previewData.sampleItems.map((item) => (
                    <div key={item.id} className="p-3 bg-olive-700/30 rounded-lg border border-olive-600">
                      <p className="font-medium text-cream-100 mb-2">{item.name}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-cream-500 mb-1">Current</p>
                          {Object.entries(item.current).filter(([key]) => item.preview[key] !== item.current[key]).map(([key, value]) => (
                            <p key={key} className="text-cream-400">
                              {key}: <span className="text-cream-300">{String(value)}</span>
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="text-green-400 mb-1">After</p>
                          {Object.entries(item.preview).filter(([key]) => item.preview[key] !== item.current[key]).map(([key, value]) => (
                            <p key={key} className="text-green-300">
                              {key}: <span className="text-green-200">{String(value)}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setStep('schedule')}
                variant="primary"
                icon={<Calendar className="w-4 h-4" />}
              >
                Continue to Execute
              </Button>
              <Button variant="secondary" onClick={() => setStep(operationType === 'update' ? 'changes' : 'filters')}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule/Execute Step */}
      {step === 'schedule' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Step 4: Execute</h2>
            <p className="text-sm text-cream-400 mt-1">
              Name the operation and execute
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Operation Name"
              placeholder="e.g., Update all Predator engine prices"
              value={operationName}
              onChange={(e) => setOperationName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-cream-200 mb-2">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100 placeholder-cream-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="Add notes about this operation..."
                value={operationDescription}
                onChange={(e) => setOperationDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Input
              label="Schedule For (Optional)"
              type="datetime-local"
              placeholder="Execute immediately if empty"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <p className="text-xs text-cream-500">
              Leave empty to execute immediately. Scheduled operations can be cancelled before execution.
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleExecute}
                disabled={loading || !operationName.trim()}
                loading={loading}
                variant="primary"
                icon={<Play className="w-4 h-4" />}
              >
                {scheduledAt ? 'Schedule Operation' : 'Execute Now'}
              </Button>
              <Button variant="secondary" onClick={() => setStep('preview')}>
                Back
              </Button>
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
