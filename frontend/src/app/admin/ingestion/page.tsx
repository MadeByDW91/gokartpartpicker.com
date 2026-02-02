'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Eye, Upload, FileText } from 'lucide-react';
import { getImportJobs, createImportJob, ingestCSV } from '@/actions/admin/ingestion';
import type { ImportJob } from '@/types/admin';

export default function IngestionOverviewPage() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importName, setImportName] = useState('');
  const [csvText, setCsvText] = useState('');
  const router = useRouter();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getImportJobs();
      
      if (result.success) {
        setJobs(result.data);
      } else {
        setError(result.error || 'Failed to fetch import jobs');
      }
    } catch (error) {
      console.error('Error fetching import jobs:', error);
      setError('Failed to fetch import jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleNewImport = async () => {
    if (!importName.trim()) {
      alert('Please enter an import name');
      return;
    }
    if (!csvText.trim()) {
      alert('Please paste CSV data');
      return;
    }

    setImporting(true);
    setError(null);
    try {
      // Create import job
      const jobResult = await createImportJob(importName, 'csv');
      if (!jobResult.success) {
        setError(jobResult.error);
        return;
      }

      const jobId = jobResult.data.id;

      // Ingest CSV
      const ingestResult = await ingestCSV(csvText, jobId);
      if (!ingestResult.success) {
        setError(ingestResult.error);
        return;
      }

      // Close modal and refresh
      setShowImportModal(false);
      setImportName('');
      setCsvText('');
      await fetchJobs();
      router.push(`/admin/ingestion/${jobId}`);
    } catch (error) {
      console.error('Error creating import:', error);
      setError(error instanceof Error ? error.message : 'Failed to create import');
    } finally {
      setImporting(false);
    }
  };

  // Filter jobs by search query
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.name.toLowerCase().includes(query) ||
      job.source_type.toLowerCase().includes(query) ||
      job.status.toLowerCase().includes(query)
    );
  });

  // Calculate metrics
  const metrics = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'ingesting').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const columns = [
    {
      key: 'name',
      header: 'Import Name',
      render: (job: ImportJob) => (
        <div>
          <p className="font-medium text-cream-100">{job.name}</p>
          <p className="text-xs text-cream-400">{job.source_type}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (job: ImportJob) => {
        const statusColors: Record<string, string> = {
          ingesting: 'bg-yellow-500/20 text-yellow-400',
          completed: 'bg-green-500/20 text-green-400',
          failed: 'bg-red-500/20 text-red-400',
          cancelled: 'bg-gray-500/20 text-gray-400',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[job.status] || statusColors.completed}`}>
            {job.status}
          </span>
        );
      },
    },
    {
      key: 'rows',
      header: 'Rows',
      render: (job: ImportJob) => (
        <span className="text-cream-300">
          {job.processed_rows} / {job.total_rows}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (job: ImportJob) => (
        <span className="text-cream-400 text-sm">{formatDate(job.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (job: ImportJob) => (
        <Link
          href={`/admin/ingestion/${job.id}`}
          className="text-orange-400 hover:text-orange-300 text-sm font-medium"
        >
          <Eye className="w-4 h-4 inline mr-1" />
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream-100">Product Ingestion</h1>
          <p className="text-cream-400 mt-1">Manage bulk product imports with approval workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/ingestion/amazon-search"
            className="bg-orange-500 hover:bg-orange-600 text-cream-100 px-4 py-2 rounded-md font-medium inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Amazon Search
          </Link>
          <Link
            href="/admin/ingestion/amazon-links"
            className="bg-olive-700 hover:bg-olive-600 text-cream-100 px-4 py-2 rounded-md font-medium inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            SiteStripe Import
          </Link>
          <Button
            onClick={() => setShowImportModal(true)}
            className="bg-olive-700 hover:bg-olive-600 text-cream-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            CSV Import
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
          <p className="text-cream-400 text-sm">Total Jobs</p>
          <p className="text-2xl font-bold text-cream-100 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
          <p className="text-cream-400 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{metrics.pending}</p>
        </div>
        <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
          <p className="text-cream-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{metrics.completed}</p>
        </div>
        <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
          <p className="text-cream-400 text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{metrics.failed}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
          <Input
            type="text"
            placeholder="Search imports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-olive-800 border-olive-600 text-cream-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Jobs Table */}
      <DataTable
        columns={columns}
        data={filteredJobs}
        loading={loading}
        emptyMessage="No import jobs found"
        keyExtractor={(job) => job.id}
        onRowClick={(job) => router.push(`/admin/ingestion/${job.id}`)}
      />

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-olive-800 border border-olive-600 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-cream-100 mb-4">New Import</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  Import Name
                </label>
                <Input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="e.g., January 2026 Product Import"
                  className="bg-olive-900 border-olive-600 text-cream-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  CSV Data
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Paste CSV data here (first row should be headers)"
                  rows={10}
                  className="w-full px-3 py-2 bg-olive-900 border border-olive-600 rounded-md text-cream-100 font-mono text-sm"
                />
                <p className="text-xs text-cream-400 mt-1">
                  Required columns: name, category, brand (optional: price, image_url, specifications, etc.)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowImportModal(false);
                  setImportName('');
                  setCsvText('');
                }}
                className="bg-olive-700 hover:bg-olive-600 text-cream-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewImport}
                disabled={importing || !importName.trim() || !csvText.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-cream-100"
              >
                {importing ? 'Importing...' : 'Create Import'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
