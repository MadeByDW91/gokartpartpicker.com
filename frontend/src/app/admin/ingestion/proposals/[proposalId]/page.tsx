'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Check, X, Plus, ExternalLink, Play } from 'lucide-react';
import { 
  getPartProposal,
  approvePartProposal,
  rejectPartProposal,
  approveCompatibilityProposal,
  rejectCompatibilityProposal,
  approveLinkCandidate,
  rejectLinkCandidate,
  generateCompatibilityProposals,
  generateLinkCandidates,
  publishPartProposal,
} from '@/actions/admin/ingestion';
import type { PartProposalDetail, CompatibilityProposal, LinkCandidate } from '@/types/admin';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;

  const [proposal, setProposal] = useState<PartProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'part' | 'compatibility' | 'links' | 'publish'>('part');
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProposal = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPartProposal(proposalId);
      if (result.success) {
        setProposal(result.data);
      } else {
        setError(result.error || 'Failed to fetch proposal');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      setError('Failed to fetch proposal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  const handleApprove = async () => {
    setProcessing('approve');
    try {
      const result = await approvePartProposal(proposalId);
      if (result.success) {
        await fetchProposal();
      } else {
        setError(result.error);
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    const notes = prompt('Enter rejection reason:');
    if (!notes) return;
    setProcessing('reject');
    try {
      const result = await rejectPartProposal(proposalId, notes);
      if (result.success) {
        await fetchProposal();
      } else {
        setError(result.error);
      }
    } finally {
      setProcessing(null);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this proposal to production? This will create/update the part in the catalog.')) {
      return;
    }
    setProcessing('publish');
    try {
      const result = await publishPartProposal(proposalId);
      if (result.success) {
        alert('Proposal published successfully!');
        await fetchProposal();
      } else {
        setError(result.error);
      }
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-cream-400">Loading...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/ingestion/review"
          className="inline-flex items-center text-orange-400 hover:text-orange-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Review Queue
        </Link>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error || 'Proposal not found'}</p>
        </div>
      </div>
    );
  }

  const proposedData = proposal.proposed_data as Record<string, unknown>;
  const tabs = [
    { id: 'part', label: 'Part Details' },
    { id: 'compatibility', label: 'Compatibility' },
    { id: 'links', label: 'Links' },
    { id: 'publish', label: 'Publish' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/ingestion/review"
          className="inline-flex items-center text-orange-400 hover:text-orange-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Review Queue
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cream-100">
              {String(proposedData.name || 'Unnamed Part')}
            </h1>
            <p className="text-cream-400 mt-1">
              {String(proposedData.category || 'N/A')} • {String(proposedData.brand || 'N/A')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {proposal.status === 'proposed' && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={processing === 'approve'}
                  className="bg-green-500 hover:bg-green-600 text-cream-100"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processing === 'reject'}
                  className="bg-red-500 hover:bg-red-600 text-cream-100"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cream-400 text-sm">Status</p>
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 ${
              proposal.status === 'proposed' ? 'bg-yellow-500/20 text-yellow-400' :
              proposal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
              proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {proposal.status}
            </span>
          </div>
          {proposal.match_confidence && (
            <div>
              <p className="text-cream-400 text-sm">Match Confidence</p>
              <p className="text-cream-100 font-medium mt-1">
                {Math.round(proposal.match_confidence * 100)}%
              </p>
              {proposal.match_reason && (
                <p className="text-cream-400 text-xs mt-1">{proposal.match_reason}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-olive-600">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-cream-400 hover:text-cream-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Part Details Tab */}
        {activeTab === 'part' && (
          <div className="space-y-4">
            <div className="bg-olive-800 border border-olive-600 rounded-lg p-6">
              <h2 className="text-lg font-bold text-cream-100 mb-4">Proposed Part Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(proposedData).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-cream-400 text-sm">{key}</p>
                    <p className="text-cream-100 mt-1">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {proposal.proposed_part && (
              <div className="bg-olive-800 border border-olive-600 rounded-lg p-6">
                <h2 className="text-lg font-bold text-cream-100 mb-4">Existing Part (Matched)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-cream-400 text-sm">Name</p>
                    <p className="text-cream-100 mt-1">{proposal.proposed_part.name}</p>
                  </div>
                  <div>
                    <p className="text-cream-400 text-sm">Category</p>
                    <p className="text-cream-100 mt-1">{proposal.proposed_part.category}</p>
                  </div>
                  <div>
                    <p className="text-cream-400 text-sm">Brand</p>
                    <p className="text-cream-100 mt-1">{proposal.proposed_part.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-cream-400 text-sm">Price</p>
                    <p className="text-cream-100 mt-1">
                      {proposal.proposed_part.price ? `$${proposal.proposed_part.price.toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compatibility Tab */}
        {activeTab === 'compatibility' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-cream-100">Compatibility Proposals</h2>
              <Button
                onClick={async () => {
                  setProcessing('generate-compat');
                  try {
                    const result = await generateCompatibilityProposals(proposalId);
                    if (result.success) {
                      await fetchProposal();
                      alert(`Generated ${result.data.generated} compatibility proposals`);
                    } else {
                      setError(result.error);
                    }
                  } finally {
                    setProcessing(null);
                  }
                }}
                disabled={processing === 'generate-compat'}
                className="bg-orange-500 hover:bg-orange-600 text-cream-100"
              >
                <Play className="w-4 h-4 mr-2" />
                Generate Proposals
              </Button>
            </div>

            {proposal.compatibility_proposals && proposal.compatibility_proposals.length > 0 ? (
              <div className="space-y-2">
                {proposal.compatibility_proposals.map((cp: CompatibilityProposal) => (
                  <div
                    key={cp.id}
                    className="bg-olive-800 border border-olive-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-cream-100">
                          {cp.engines?.name || 'Unknown Engine'}
                        </p>
                        <p className="text-sm text-cream-400 mt-1">
                          {cp.compatibility_level} • {cp.notes || 'No notes'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          cp.status === 'approved' ? 'text-green-400' :
                          cp.status === 'rejected' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          Status: {cp.status}
                        </p>
                      </div>
                      {cp.status === 'proposed' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const result = await approveCompatibilityProposal(cp.id);
                              if (result.success) await fetchProposal();
                            }}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const notes = prompt('Rejection reason:');
                              if (notes) {
                                const result = await rejectCompatibilityProposal(cp.id, notes);
                                if (result.success) await fetchProposal();
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-olive-800 border border-olive-600 rounded-lg p-8 text-center">
                <p className="text-cream-400">No compatibility proposals yet</p>
              </div>
            )}
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-cream-100">Link Candidates</h2>
              <Button
                onClick={async () => {
                  setProcessing('generate-links');
                  try {
                    const result = await generateLinkCandidates(proposalId);
                    if (result.success) {
                      await fetchProposal();
                      alert(`Generated ${result.data.generated} link candidates`);
                    } else {
                      setError(result.error);
                    }
                  } finally {
                    setProcessing(null);
                  }
                }}
                disabled={processing === 'generate-links'}
                className="bg-orange-500 hover:bg-orange-600 text-cream-100"
              >
                <Play className="w-4 h-4 mr-2" />
                Generate Links
              </Button>
            </div>

            {proposal.link_candidates && proposal.link_candidates.length > 0 ? (
              <div className="space-y-2">
                {proposal.link_candidates.map((lc: LinkCandidate) => (
                  <div
                    key={lc.id}
                    className="bg-olive-800 border border-olive-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-cream-100">{lc.vendor_name || 'Unknown Vendor'}</p>
                          <span className={`px-2 py-1 rounded text-xs ${
                            lc.link_type.includes('affiliate') ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {lc.link_type}
                          </span>
                        </div>
                        <a
                          href={lc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:text-orange-300 text-sm mt-1 flex items-center gap-1"
                        >
                          {lc.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {lc.price && (
                          <p className="text-cream-400 text-sm mt-1">${lc.price.toFixed(2)}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          lc.status === 'approved' ? 'text-green-400' :
                          lc.status === 'rejected' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          Status: {lc.status}
                        </p>
                      </div>
                      {lc.status === 'candidate' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const result = await approveLinkCandidate(lc.id);
                              if (result.success) await fetchProposal();
                            }}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const notes = prompt('Rejection reason:');
                              if (notes) {
                                const result = await rejectLinkCandidate(lc.id, notes);
                                if (result.success) await fetchProposal();
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-olive-800 border border-olive-600 rounded-lg p-8 text-center">
                <p className="text-cream-400">No link candidates yet</p>
              </div>
            )}
          </div>
        )}

        {/* Publish Tab */}
        {activeTab === 'publish' && (
          <div className="space-y-4">
            <div className="bg-olive-800 border border-olive-600 rounded-lg p-6">
              <h2 className="text-lg font-bold text-cream-100 mb-4">Publish Summary</h2>
              
              {proposal.status !== 'approved' ? (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                  <p className="text-yellow-400">
                    This proposal must be approved before it can be published.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-cream-400 text-sm">Part</p>
                    <p className="text-cream-100 mt-1">
                      {proposal.proposed_part_id ? 'Update existing part' : 'Create new part'}
                    </p>
                  </div>
                  
                  {proposal.compatibility_proposals && proposal.compatibility_proposals.filter((cp: CompatibilityProposal) => cp.status === 'approved').length > 0 && (
                    <div>
                      <p className="text-cream-400 text-sm">Compatibility</p>
                      <p className="text-cream-100 mt-1">
                        {proposal.compatibility_proposals.filter((cp: CompatibilityProposal) => cp.status === 'approved').length} approved compatibility relationships
                      </p>
                    </div>
                  )}

                  {proposal.link_candidates && proposal.link_candidates.filter((lc: LinkCandidate) => lc.status === 'approved').length > 0 && (
                    <div>
                      <p className="text-cream-400 text-sm">Links</p>
                      <p className="text-cream-100 mt-1">
                        {proposal.link_candidates.filter((lc: LinkCandidate) => lc.status === 'approved').length} approved link(s)
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      onClick={handlePublish}
                      disabled={processing === 'publish'}
                      className="bg-orange-500 hover:bg-orange-600 text-cream-100 w-full"
                    >
                      {processing === 'publish' ? 'Publishing...' : 'Publish to Production'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
