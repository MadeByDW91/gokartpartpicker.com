import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BookOpen } from 'lucide-react';

export default function GuideNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="text-center max-w-md space-y-6">
        <BookOpen className="w-16 h-16 text-olive-600 mx-auto opacity-50" />
        <h1 className="text-4xl md:text-5xl font-display text-cream-100">
          Guide Not Found
        </h1>
        <p className="text-cream-300 text-lg">
          This installation guide doesn&apos;t exist or has been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/guides">
            <Button variant="primary">Browse Guides</Button>
          </Link>
          <Link href="/tools">
            <Button variant="secondary">View Tools</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
