import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEngineBySlug } from '@/actions/engines';
import { EngineMaintenanceScheduleView } from '@/components/engines/EngineMaintenanceScheduleView';

interface MaintenancePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MaintenancePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEngineBySlug(slug);
  if (!result.success) return { title: 'Engine Not Found' };
  const engine = result.data;
  const displayName = engine.name.trim().toLowerCase().startsWith(engine.brand.trim().toLowerCase())
    ? engine.name.trim()
    : `${engine.brand} ${engine.name}`.trim();
  return {
    title: `${displayName} Maintenance Schedule | GoKartPartPicker`,
    description: `Printable maintenance schedule for ${displayName}. Oil change, air filter, spark plug, valve clearance, and more.`,
    openGraph: {
      title: `${displayName} Maintenance Schedule`,
      description: `Printable maintenance schedule for ${displayName}.`,
      url: `https://gokartpartpicker.com/engines/${slug}/maintenance`,
    },
    alternates: { canonical: `https://gokartpartpicker.com/engines/${slug}/maintenance` },
  };
}

export default async function EngineMaintenancePage({ params }: MaintenancePageProps) {
  const { slug } = await params;
  const result = await getEngineBySlug(slug);
  if (!result.success) notFound();
  const engine = result.data;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-olive-900 flex items-center justify-center">
          <div className="text-cream-400">Loading...</div>
        </div>
      }
    >
      <EngineMaintenanceScheduleView engine={engine} />
    </Suspense>
  );
}
