'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Flag, AlertCircle } from 'lucide-react';

export default function AdminForumsFlaggedPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100 mb-2">Flagged Content</h1>
          <p className="text-cream-400">Review content reported by users</p>
        </div>
      </div>

      {/* Placeholder */}
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="py-12 text-center">
          <Flag className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-display text-xl text-cream-100 mb-2">Flagged Content Queue</h2>
          <p className="text-cream-400 mb-4 max-w-md mx-auto">
            Content that has been flagged by users will appear here for review. This feature will be available once content flagging is implemented.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-cream-500">
            <AlertCircle className="w-4 h-4" />
            <span>No flagged content at this time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
