import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import PartsPageContent from './PartsPageContent';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gokartpartpicker.com';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = params?.category;
  return {
    alternates: {
      canonical: category
        ? `${baseUrl}/parts?category=${encodeURIComponent(category)}`
        : `${baseUrl}/parts`,
    },
  };
}

export default function PartsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-olive-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      }
    >
      <PartsPageContent />
    </Suspense>
  );
}
