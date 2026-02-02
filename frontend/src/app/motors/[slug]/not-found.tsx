import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Battery } from 'lucide-react';

export default function MotorNotFound() {
  return (
    <div className="min-h-screen bg-olive-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <Battery className="w-16 h-16 text-cream-500/50 mx-auto mb-4" />
          <h1 className="text-display text-3xl text-cream-100 mb-2">Motor Not Found</h1>
          <p className="text-cream-400">
            The electric motor you're looking for doesn't exist or has been removed.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/engines">
            <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
              Browse Motors
            </Button>
          </Link>
          <Link href="/builder">
            <Button variant="secondary">
              Open Builder
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
