'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { Search, Eye, Check, X } from 'lucide-react';
import { 
  getReviewQueue, 
  approvePartProposal, 
  rejectPartProposal,
  bulkPublishProposals 
} from '@/actions/admin/ingestion';
import type { ReviewQueueItem } from '@/types/admin';

export default function ReviewQueuePage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'proposed' | 'approved' | 'rejected' | 'all'>('proposed');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReviewQueue({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      if (result.success) {
        setProposals(result.data);
      } else {
        setError(result.error || 'Failed to fetch review queue');
      }
    } catch (error) {
      console.error('Error fetching review queue:', error);
      setError('Failed to fetch review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleApprove = async (proposalId: string) => {
    setProcessing(proposalId);
    setError(null);
    try {
      const result = await approvePartProposal(proposalId);
      if (result.success) {
        await fetchQueue();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error approving proposal:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    const notes = prompt('Enter rejection reason:');
    if (!notes) return;

    setProcessing(proposalId);
    setError(null);
    try {
      const result = await rejectPartProposal(proposalId, notes);
      if (result.success) {
        await fetchQueue();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Approve ${selectedIds.size} selected proposals?`)) return;

    setProcessing('bulk');
    setError(null);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await approvePartProposal(id);
      }
      setSelectedIds(new Set());
      await fetchQueue();
    } catch (error) {
      console.error('Error bulk approving:', error);
      setError(error instanceof Error ? error.message : 'Failed to bulk approve');
    } finally {
      setProcessing(null);
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((proposal) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const data = proposal.proposed_data as Record<string, unknown>;
      const name = String(data.name || '').toLowerCase();
      const category = String(data.category || '').toLowerCase();
      const brand = String(data.brand || '').toLowerCase();
      return name.includes(query) || category.includes(query) || brand.includes(query);
    }
    return true;
  });

  const columns = [
    {
      key: 'checkbox',
      header: '',
      render: (proposal: ReviewQueueItem) => (
        <input
          type="checkbox"
          checked={selectedIds.has(proposal.id)}
          onChange={(e) => {
            const newSet = new Set(selectedIds);
            if (e.target.checked) {
              newSet.add(proposal.id);
            } else {
              newSet.delete(proposal.id);
            }
            setSelectedIds(newSet);
          }}
          className="rounded border-olive-600"
        />
      ),
    },
    {
      key: 'part',
      header: 'Part',
      render: (proposal: ReviewQueueItem) => {
        const data = proposal.proposed_data as Record<string, unknown>;
        return (
          <div>
            <p className="font-medium text-cream-100">{String(data.name || 'N/A')}</p>
            <p className="text-xs text-cream-400">
              {String(data.category || 'N/A')} • {String(data.brand || 'N/A')}
            </p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (proposal: ReviewQueueItem) => {
        const statusColors: Record<string, string> = {
          proposed: 'bg-yellow-500/20 text-yellow-400',
          approved: 'bg-green-500/20 text-green-400',
          rejected: 'bg-red-500/20 text-red-400',
          published: 'bg-blue-500/20 text-blue-400',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[proposal.status] || 'bg-gray-500/20 text-gray-400'}`}>
            {proposal.status}
          </span>
        );
      },
    },
    {
      key: 'match',
      header: 'Match',
      render: (proposal: ReviewQueueItem) => (
        proposal.proposed_part_id ? (
          <div>
            <span className="text-green-400 text-sm">Existing Part</span>
            {proposal.match_confidence && (
              <p className="text-xs text-cream-400">{Math.round(proposal.match_confidence * 100)}%</p>
            )}
          </div>
        ) : (
          <span className="text-cream-400 text-sm">New Part</span>
        )
      ),
    },
    {
      key: 'import',
      header: 'Import',
      render: (proposal: ReviewQueueItem) => (
        <div className="text-sm">
          <p className="text-cream-300">{proposal.import_jobs?.name || 'N/A'}</p>
          <p className="text-xs text-cream-400">{formatDate(proposal.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (proposal: ReviewQueueItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/ingestion/proposals/${proposal.id}`)}
            className="text-orange-400 hover:text-orange-300"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {proposal.status === 'proposed' && (
            <>
              <button
                onClick={() => handleApprove(proposal.id)}
                disabled={processing === proposal.id}
                className="text-green-400 hover:text-green-300 disabled:opacity-50"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(proposal.id)}
                disabled={processing === proposal.id}
                className="text-red-400 hover:text-red-300 disabled:opacity-50"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cream-100">Review Queue</h1>
        <p className="text-cream-400 mt-1">Review and approve part proposals</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
          <Input
            type="text"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-olive-800 border-olive-600 text-cream-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
        >
          <option value="all">All Status</option>
          <option value="proposed">Proposed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        {selectedIds.size > 0 && (
          <Button
            onClick={handleBulkApprove}
            disabled={processing === 'bulk'}
            className="bg-green-500 hover:bg-green-600 text-cream-100"
          >
            <Check className="w-4 h-4 mr-2" />
            Approve Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Proposals Table */}
      <DataTable
        columns={columns}
        data={filteredProposals}
        loading={loading}
        emptyMessage="No proposals found"
        keyExtractor={(proposal) => proposal.id}
        onRowClick={(proposal) => router.push(`/admin/ingestion/proposals/${proposal.id}`)}
      />
    </div>
  );
}
