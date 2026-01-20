'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Wand2, ChevronRight } from 'lucide-react';

export default function AdminContentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to automation page (main content management page)
    router.replace('/admin/content/automation');
  }, [router]);

  // Show loading/redirect message while redirecting
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Content Management</h1>
          <p className="text-cream-300 mt-1">Manage content automation and workflows</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="text-cream-300 mb-4">Redirecting to Content Automation...</p>
            <Link href="/admin/content/automation">
              <Button variant="secondary" icon={<ChevronRight className="w-4 h-4" />}>
                Go to Content Automation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/content/automation">
          <Card hoverable className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Wand2 className="w-6 h-6 text-orange-400" />
                <h2 className="text-lg font-semibold text-cream-100">Content Automation</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-cream-400">
                Automate content generation and find duplicates for engines and parts.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/templates">
          <Card hoverable className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-semibold text-cream-100">Build Templates</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-cream-400">
                Manage build templates that users can start from when creating their go-karts.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
