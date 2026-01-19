'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminEngine } from '@/actions/admin';
import { EngineForm } from '@/components/admin/EngineForm';
import { ChevronLeft, Loader2 } from 'lucide-react';
import type { AdminEngine } from '@/types/admin';

export default function EditEnginePage() {
  const params = useParams();
  const router = useRouter();
  const [engine, setEngine] = useState<AdminEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEngine = async () => {
      if (!params.id || typeof params.id !== 'string') {
        setError('Invalid engine ID');
        setLoading(false);
        return;
      }

      try {
        const result = await getAdminEngine(params.id);
        
        if (result.success) {
          setEngine(result.data as AdminEngine);
        } else {
          setError(result.error || 'Failed to load engine');
        }
      } catch (err) {
        console.error('Error fetching engine:', err);
        setError(err instanceof Error ? err.message : 'Failed to load engine');
      } finally {
        setLoading(false);
      }
    };

    fetchEngine();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !engine) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/engines"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Engines
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error || 'Engine not found'}</p>
          <button
            onClick={() => router.push('/admin/engines')}
            className="mt-4 text-sm text-cream-400 hover:text-cream-100"
          >
            Return to engines list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/engines"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Engines
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Edit Engine</h1>
        <p className="text-cream-300 mt-1">
          {engine.name}
        </p>
      </div>

      {/* Form */}
      <EngineForm engine={engine} mode="edit" />
    </div>
  );
}
