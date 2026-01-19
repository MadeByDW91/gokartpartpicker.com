import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Custom 404 page for part detail pages
 */
export default function PartNotFound() {
  return (
    <div className="min-h-screen bg-olive-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 mb-6">
          <AlertCircle className="w-10 h-10 text-orange-400" />
        </div>
        
        <h1 className="text-display text-3xl text-cream-100 mb-3">
          Part Not Found
        </h1>
        
        <p className="text-cream-400 mb-8">
          We couldn&apos;t find the part you&apos;re looking for. It may have been 
          removed or the URL might be incorrect.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/parts">
            <Button 
              variant="primary" 
              size="lg"
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Browse All Parts
            </Button>
          </Link>
          
          <Link href="/builder">
            <Button variant="secondary" size="lg">
              Go to Builder
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
