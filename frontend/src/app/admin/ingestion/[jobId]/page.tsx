'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Play, Eye, FileText } from 'lucide-react';
import { 
  getImportJobDetails, 
  getPartProposalsForJob, 
  generatePartProposals 
} from '@/actions/admin/ingestion';
import type { ImportJobDetails, PartProposal, ImportRawRecord } from '@/types/admin';

export default function ImportJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<ImportJobDetails | null>(null);
  const [proposals, setProposals] = useState<PartProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobResult, proposalsResult] = await Promise.all([
        getImportJobDetails(jobId),
        getPartProposalsForJob(jobId),
      ]);

      if (jobResult.success) {
        setJob(jobResult.data);
      } else {
        setError(jobResult.error || 'Failed to fetch job details');
      }

      if (proposalsResult.success) {
        setProposals(proposalsResult.data);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const handleGenerateProposals = async () => {
    if (!confirm('Generate part proposals from raw records? This will process all pending records.')) {
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const result = await generatePartProposals(jobId);
      if (result.success) {
        await fetchJobDetails();
        alert(`Generated ${result.data.generated} proposals`);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error generating proposals:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate proposals');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-cream-400">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/ingestion"
          className="inline-flex items-center text-orange-400 hover:text-orange-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Imports
        </Link>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error || 'Import job not found'}</p>
        </div>
      </div>
    );
  }

  // Count proposals by status
  const proposalCounts = {
    proposed: proposals.filter(p => p.status === 'proposed').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    published: proposals.filter(p => p.status === 'published').length,
  };

  const rawRecordsColumns = [
    {
      key: 'row_number',
      header: 'Row',
    },
    {
      key: 'status',
      header: 'Status',
      render: (record: ImportRawRecord) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-yellow-500/20 text-yellow-400',
          processed: 'bg-green-500/20 text-green-400',
          error: 'bg-red-500/20 text-red-400',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[record.status] || 'bg-gray-500/20 text-gray-400'}`}>
            {record.status}
          </span>
        );
      },
    },
    {
      key: 'raw_data',
      header: 'Data',
      render: (record: ImportRawRecord) => {
        const data = record.raw_data as Record<string, unknown>;
        return (
          <div className="max-w-md">
            <p className="text-cream-100 font-medium">{String(data.name || 'N/A')}</p>
            <p className="text-xs text-cream-400">{String(data.category || 'N/A')} • {String(data.brand || 'N/A')}</p>
          </div>
        );
      },
    },
    {
      key: 'error_message',
      header: 'Error',
      render: (record: ImportRawRecord) => (
        record.error_message ? (
          <span className="text-red-400 text-sm">{record.error_message}</span>
        ) : null
      ),
    },
  ];

  const proposalsColumns = [
    {
      key: 'name',
      header: 'Part',
      render: (proposal: PartProposal) => {
        const data = proposal.proposed_data as Record<string, unknown>;
        return (
          <div>
            <p className="font-medium text-cream-100">{String(data.name || 'N/A')}</p>
            <p className="text-xs text-cream-400">{String(data.category || 'N/A')}</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (proposal: PartProposal) => {
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
      render: (proposal: PartProposal) => (
        proposal.proposed_part_id ? (
          <div>
            <span className="text-green-400 text-sm">Matched</span>
            {proposal.match_confidence && (
              <p className="text-xs text-cream-400">{Math.round(proposal.match_confidence * 100)}% confidence</p>
            )}
          </div>
        ) : (
          <span className="text-cream-400 text-sm">New Part</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (proposal: PartProposal) => (
        <Link
          href={`/admin/ingestion/proposals/${proposal.id}`}
          className="text-orange-400 hover:text-orange-300 text-sm font-medium"
        >
          <Eye className="w-4 h-4 inline mr-1" />
          Review
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/ingestion"
          className="inline-flex items-center text-orange-400 hover:text-orange-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Imports
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cream-100">{job.name}</h1>
            <p className="text-cream-400 mt-1">
              {job.source_type} • Created {formatDate(job.created_at)}
            </p>
          </div>
          {job.status === 'completed' && proposals.length === 0 && (
            <Button
              onClick={handleGenerateProposals}
              disabled={generating}
              className="bg-orange-500 hover:bg-orange-600 text-cream-100"
            >
              <Play className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Proposals'}
            </Button>
          )}
        </div>
      </div>

      {/* Job Info */}
      <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-cream-400 text-sm">Status</p>
            <p className="text-cream-100 font-medium mt-1">{job.status}</p>
          </div>
          <div>
            <p className="text-cream-400 text-sm">Total Rows</p>
            <p className="text-cream-100 font-medium mt-1">{job.total_rows}</p>
          </div>
          <div>
            <p className="text-cream-400 text-sm">Processed</p>
            <p className="text-cream-100 font-medium mt-1">{job.processed_rows}</p>
          </div>
          <div>
            <p className="text-cream-400 text-sm">Created By</p>
            <p className="text-cream-100 font-medium mt-1">
              {job.created_by_profile?.username || job.created_by_profile?.email || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Proposal Summary */}
      {proposals.length > 0 && (
        <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
          <h2 className="text-lg font-bold text-cream-100 mb-4">Proposal Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-cream-400 text-sm">Proposed</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{proposalCounts.proposed}</p>
            </div>
            <div>
              <p className="text-cream-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{proposalCounts.approved}</p>
            </div>
            <div>
              <p className="text-cream-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{proposalCounts.rejected}</p>
            </div>
            <div>
              <p className="text-cream-400 text-sm">Published</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{proposalCounts.published}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/ingestion/review"
              className="text-orange-400 hover:text-orange-300 text-sm font-medium"
            >
              <Eye className="w-4 h-4 inline mr-1" />
              View Review Queue
            </Link>
          </div>
        </div>
      )}

      {/* Raw Records */}
      <div>
        <h2 className="text-lg font-bold text-cream-100 mb-4">Raw Records</h2>
        <DataTable
          columns={rawRecordsColumns}
          data={job.raw_records || []}
          loading={false}
          emptyMessage="No raw records found"
          keyExtractor={(record) => record.id}
        />
      </div>

      {/* Part Proposals */}
      {proposals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-cream-100 mb-4">Part Proposals</h2>
          <DataTable
            columns={proposalsColumns}
            data={proposals}
            loading={false}
            emptyMessage="No proposals found"
            keyExtractor={(proposal) => proposal.id}
            onRowClick={(proposal) => router.push(`/admin/ingestion/proposals/${proposal.id}`)}
          />
        </div>
      )}
    </div>
  );
}
