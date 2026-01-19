'use client';

import { use } from 'react';
import Link from 'next/link';
import { useBuild } from '@/hooks/use-builds';
import { useParts } from '@/hooks/use-parts';
import { ShoppingList } from '@/components/builds/ShoppingList';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, Printer, FileText } from 'lucide-react';

interface ShoppingListPageProps {
  params: Promise<{ id: string }>;
}

export default function ShoppingListPage({ params }: ShoppingListPageProps) {
  const { id } = use(params);
  const { data: build, isLoading: buildLoading, error: buildError } = useBuild(id);
  const { data: allParts, isLoading: partsLoading } = useParts();
  
  const isLoading = buildLoading || partsLoading;
  
  if (buildError) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-cream-100 mb-4">Build Not Found</h1>
          <Link href="/builds">
            <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Builds
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header - Hidden when printing */}
      <div className="bg-olive-800 border-b border-olive-700 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/builds/${id}`}
              className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Build
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-64" />
          </div>
        ) : build && allParts ? (
          <ShoppingList build={build} allParts={allParts} />
        ) : null}
      </div>
    </div>
  );
}
