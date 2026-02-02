'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminMotor } from '@/actions/admin';
import { MotorForm } from '@/components/admin/MotorForm';
import { ChevronLeft, Loader2 } from 'lucide-react';
import type { AdminElectricMotor } from '@/types/admin';

export default function EditMotorPage() {
  const params = useParams();
  const router = useRouter();
  const [motor, setMotor] = useState<AdminElectricMotor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMotor = async () => {
      if (!params.id || typeof params.id !== 'string') {
        setError('Invalid motor ID');
        setLoading(false);
        return;
      }

      try {
        const result = await getAdminMotor(params.id);
        
        if (result.success) {
          setMotor(result.data as AdminElectricMotor);
        } else {
          setError(result.error || 'Failed to load electric motor');
        }
      } catch (err) {
        console.error('Error fetching electric motor:', err);
        setError(err instanceof Error ? err.message : 'Failed to load electric motor');
      } finally {
        setLoading(false);
      }
    };

    fetchMotor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !motor) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/motors"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Electric Motors
          </Link>
          <h1 className="text-display text-3xl text-cream-100">Edit Electric Motor</h1>
        </div>
        <div className="p-4 bg-[rgba(166,61,64,0.1)] border border-[rgba(166,61,64,0.3)] rounded-lg">
          <p className="text-[var(--error)]">{error || 'Electric motor not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/motors"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Electric Motors
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Edit Electric Motor</h1>
        <p className="text-cream-300 mt-1">
          {motor.name}
        </p>
      </div>

      {/* Form */}
      <MotorForm motor={motor} mode="edit" />
    </div>
  );
}
