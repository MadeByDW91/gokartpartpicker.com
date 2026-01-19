'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, Plus, Trash2, Pencil, Copy, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  getAdminEngine, 
  getAdminEngines 
} from '@/actions/admin';
import { 
  getEngineClones, 
  createEngineClone, 
  deleteEngineClone,
  createBidirectionalClone,
  detectPotentialClones,
  autoCreateCloneRelationships
} from '@/actions/admin/engine-clones';
import type { Engine } from '@/types/database';
import type { ActionResult } from '@/lib/api/types';

interface EngineClone {
  id: string;
  engine_id: string;
  clone_engine_id: string;
  relationship_type: 'clone' | 'compatible' | 'similar';
  notes: string | null;
  is_active: boolean;
  clone_engine: Engine;
}

export default function EngineClonesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [engineId, setEngineId] = useState<string | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [clones, setClones] = useState<EngineClone[]>([]);
  const [allEngines, setAllEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [potentialClones, setPotentialClones] = useState<Array<Engine & { matchScore: number; matchReasons: string[] }>>([]);
  const [detecting, setDetecting] = useState(false);
  const [autoCreating, setAutoCreating] = useState(false);
  const [formData, setFormData] = useState({
    clone_engine_id: '',
    relationship_type: 'clone' as 'clone' | 'compatible' | 'similar',
    notes: '',
    bidirectional: true,
  });

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setEngineId(id);
      
      setLoading(true);
      setError(null);

      try {
        // Fetch engine
        const engineResult = await getAdminEngine(id);
        if (engineResult.success) {
          setEngine(engineResult.data);
        } else {
          setError('Engine not found');
          return;
        }

        // Fetch all engines for dropdown
        const enginesResult = await getAdminEngines();
        if (enginesResult.success) {
          setAllEngines(enginesResult.data);
        }

        // Fetch clones
        const clonesResult = await getEngineClones(id);
        if (clonesResult.success) {
          setClones(clonesResult.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const handleAddClone = async () => {
    if (!formData.clone_engine_id || !engineId) {
      setError('Please select a clone engine');
      return;
    }

    if (formData.clone_engine_id === engineId) {
      setError('Engine cannot be a clone of itself');
      return;
    }

    setError(null);

    try {
      let result: ActionResult<any>;
      
      if (formData.bidirectional) {
        result = await createBidirectionalClone({
          engine_id: engineId,
          clone_engine_id: formData.clone_engine_id,
          relationship_type: formData.relationship_type,
          notes: formData.notes || null,
        });
      } else {
        result = await createEngineClone({
          engine_id: engineId,
          clone_engine_id: formData.clone_engine_id,
          relationship_type: formData.relationship_type,
          notes: formData.notes || null,
        });
      }

      if (result.success) {
        // Refresh clones list
        const clonesResult = await getEngineClones(engineId);
        if (clonesResult.success) {
          setClones(clonesResult.data);
        }
        // Reset form
        setFormData({
          clone_engine_id: '',
          relationship_type: 'clone',
          notes: '',
          bidirectional: true,
        });
        setShowAddForm(false);
      } else {
        setError(result.error || 'Failed to create clone relationship');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create clone relationship');
    }
  };

  const handleDelete = async (cloneId: string) => {
    if (!confirm('Are you sure you want to remove this clone relationship?')) {
      return;
    }

    try {
      const result = await deleteEngineClone(cloneId);
      if (result.success && engineId) {
        // Refresh clones list
        const clonesResult = await getEngineClones(engineId);
        if (clonesResult.success) {
          setClones(clonesResult.data);
        }
      } else {
        setError('error' in result ? result.error : 'Failed to delete clone relationship');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete clone relationship');
    }
  };

  const handleDetectClones = async () => {
    if (!engineId) return;

    setDetecting(true);
    setError(null);

    try {
      const result = await detectPotentialClones(engineId);
      if (result.success && result.data) {
        // Filter out engines that are already clones
        const existingCloneIds = new Set(clones.map(c => c.clone_engine_id));
        const filtered = result.data.filter(e => !existingCloneIds.has(e.id));
        setPotentialClones(filtered);
      } else {
        setError('error' in result ? result.error : 'Failed to detect potential clones');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect potential clones');
    } finally {
      setDetecting(false);
    }
  };

  const handleAutoCreate = async () => {
    if (!engineId) return;

    setAutoCreating(true);
    setError(null);

    try {
      const result = await autoCreateCloneRelationships(engineId, 70);
      if (result.success && result.data) {
        // Refresh clones list
        const clonesResult = await getEngineClones(engineId);
        if (clonesResult.success) {
          setClones(clonesResult.data);
        }
        // Clear potential clones that were created
        setPotentialClones([]);
        alert(`Successfully created ${result.data.created} clone relationship(s)!`);
      } else {
        setError('error' in result ? result.error : 'Failed to auto-create clone relationships');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-create clone relationships');
    } finally {
      setAutoCreating(false);
    }
  };

  // Filter out engines that are already clones
  const availableEngines = allEngines.filter(
    (e) => e.id !== engineId && !clones.some((c) => c.clone_engine_id === e.id)
  );

  const columns = [
    {
      key: 'clone_engine',
      header: 'Clone Engine',
      render: (clone: EngineClone) => (
        <div>
          <p className="font-medium text-cream-100">{clone.clone_engine.name}</p>
          <p className="text-xs text-cream-400">{clone.clone_engine.brand}</p>
        </div>
      ),
    },
    {
      key: 'relationship_type',
      header: 'Type',
      render: (clone: EngineClone) => (
        <span className="text-cream-300 capitalize">{clone.relationship_type}</span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (clone: EngineClone) => clone.notes || '—',
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (clone: EngineClone) => (
        <TableActions>
          <button
            onClick={() => handleDelete(clone.id)}
            className="p-2 text-cream-400 hover:text-red-400 hover:bg-olive-600 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </TableActions>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-cream-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !engine) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-[var(--error)]">{error}</p>
          <Link href="/admin/engines">
            <Button variant="secondary" className="mt-4">Back to Engines</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/admin/engines/${engineId}`}
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Engine
        </Link>
        <div className="flex items-center gap-3">
          <Copy className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-display text-3xl text-cream-100">
              Clone Engines for {engine?.name}
            </h1>
            <p className="text-cream-300 mt-1">
              Manage engines that are clones or compatible with this engine
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Auto-Detection Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-cream-100">Auto-Detect Clone Engines</h2>
            </div>
            <Button
              onClick={handleDetectClones}
              variant="secondary"
              loading={detecting}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {detecting ? 'Detecting...' : 'Detect Potential Clones'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-cream-400 mb-4">
            Automatically find engines with compatible specifications (same shaft diameter, mount type, similar displacement).
            Engines with a match score of 70+ are likely clones.
          </p>

          {potentialClones.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-cream-300">
                  Found <strong>{potentialClones.length}</strong> potential clone engine(s)
                </p>
                <Button
                  onClick={handleAutoCreate}
                  variant="primary"
                  loading={autoCreating}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  {autoCreating ? 'Creating...' : `Auto-Create All (${potentialClones.length})`}
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {potentialClones.map((potential) => {
                  const isHighConfidence = potential.matchScore >= 80;
                  return (
                    <div
                      key={potential.id}
                      className={`p-4 rounded-lg border ${
                        isHighConfidence
                          ? 'bg-orange-500/10 border-orange-500/30'
                          : 'bg-olive-800/50 border-olive-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-cream-100">
                              {potential.brand} {potential.name}
                            </h3>
                            <Badge variant={isHighConfidence ? 'default' : 'warning'}>
                              {potential.matchScore}% match
                            </Badge>
                          </div>
                          <div className="text-sm text-cream-400 mb-2">
                            {potential.displacement_cc}cc • {potential.horsepower}HP • {potential.shaft_diameter}&quot; shaft
                          </div>
                          <ul className="text-xs text-cream-300 space-y-1">
                            {potential.matchReasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-400" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          onClick={async () => {
                            setFormData({
                              clone_engine_id: potential.id,
                              relationship_type: potential.matchScore >= 90 ? 'clone' : potential.matchScore >= 80 ? 'compatible' : 'similar',
                              notes: `Auto-detected: ${potential.matchReasons.join(', ')}`,
                              bidirectional: true,
                            });
                            setShowAddForm(true);
                            setPotentialClones(potentialClones.filter(p => p.id !== potential.id));
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {potentialClones.length === 0 && !detecting && (
            <div className="text-center py-8 text-cream-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No potential clones detected yet</p>
              <p className="text-xs mt-1">Click "Detect Potential Clones" to scan for compatible engines</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Clone Form */}
      {!showAddForm ? (
        <Button
          onClick={() => setShowAddForm(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Clone Engine Manually
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Add Clone Engine</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Clone Engine"
              value={formData.clone_engine_id}
              onChange={(e) => setFormData({ ...formData, clone_engine_id: e.target.value })}
              options={[
                { value: '', label: 'Select an engine...' },
                ...availableEngines.map((e) => ({
                  value: e.id,
                  label: `${e.brand} ${e.name} (${e.displacement_cc}cc, ${e.horsepower}HP)`,
                })),
              ]}
              required
            />

            <Select
              label="Relationship Type"
              value={formData.relationship_type}
              onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value as any })}
              options={[
                { value: 'clone', label: 'Clone (Exact clone, same parts)' },
                { value: 'compatible', label: 'Compatible (Same parts fit)' },
                { value: 'similar', label: 'Similar (Mostly compatible)' },
              ]}
            />

            <Input
              label="Notes (Optional)"
              placeholder="e.g., Shares all parts with Honda GX200"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bidirectional"
                checked={formData.bidirectional}
                onChange={(e) => setFormData({ ...formData, bidirectional: e.target.checked })}
                className="w-4 h-4 rounded border-olive-600 bg-olive-900 text-orange-500"
              />
              <label htmlFor="bidirectional" className="text-sm text-cream-300">
                Create bidirectional relationship (if A is clone of B, also create B is clone of A)
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddClone} className="flex-1">
                Add Clone
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    clone_engine_id: '',
                    relationship_type: 'clone',
                    notes: '',
                    bidirectional: true,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clones List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">
            Clone Engines ({clones.length})
          </h2>
        </CardHeader>
        <CardContent>
          {clones.length === 0 ? (
            <div className="text-center py-12">
              <Copy className="w-16 h-16 text-olive-600 mx-auto mb-4 opacity-50" />
              <p className="text-cream-400">No clone engines configured yet</p>
              <p className="text-cream-500 text-sm mt-1">
                Add engines that are clones or compatible with {engine?.name}
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={clones}
              loading={false}
              emptyMessage="No clone engines"
              keyExtractor={(clone) => clone.id}
            />
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">About Clone Engines</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-cream-300">
          <p className="text-cream-400">
            Many small engines are clones of each other and share the same parts compatibility. 
            For example:
          </p>
          <ul className="list-disc list-inside space-y-1 text-cream-400 ml-4">
            <li><strong>Predator 212</strong> is a clone of <strong>Honda GX200</strong></li>
            <li><strong>Predator 79cc</strong> is a clone of <strong>Honda GX100</strong></li>
            <li>Many Chinese engines are clones of Honda GX series</li>
          </ul>
          <p className="text-cream-400 mt-3">
            When you mark engines as clones, users will see that parts compatible with one engine 
            will also work with its clones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
