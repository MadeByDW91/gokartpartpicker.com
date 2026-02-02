'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Activity, Shield } from 'lucide-react';
import Link from 'next/link';

export default function RateLimitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-3xl text-cream-100">Rate Limits</h1>
        <p className="text-cream-300 mt-1">
          Configure API and request rate limits (Supabase / application level)
        </p>
      </div>

      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-olive-700 mb-4">
            <Activity className="w-7 h-7 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-cream-100 mb-2">Rate limits configuration</h2>
          <p className="text-sm text-cream-400 max-w-md mx-auto mb-6">
            Configure per-route or global rate limits here. This page will be expanded with
            knobs for login attempts, API usage, and ingestion jobs.
          </p>
          <Link
            href="/admin/security"
            className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-medium"
          >
            <Shield className="w-4 h-4" />
            Back to Security Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
