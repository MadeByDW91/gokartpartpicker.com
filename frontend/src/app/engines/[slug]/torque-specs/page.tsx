import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { getEngineBySlug } from '@/actions/engines';
import { getTorqueSpecs } from '@/data/torque-specs';
import { EngineTorqueSpecsView } from '@/components/engines/EngineTorqueSpecsView';
import { ArrowLeft } from 'lucide-react';

interface TorqueSpecsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TorqueSpecsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEngineBySlug(slug);
  
  if (!result.success) {
    return {
      title: 'Torque Specs Not Found',
    };
  }
  
  const engine = result.data;
  const specs = getTorqueSpecs(slug);
  
  if (!specs) {
    return {
      title: 'Torque Specs Not Available',
    };
  }
  
  return {
    title: `${engine.name} Torque Specifications | GoKartPartPicker`,
    description: `Complete torque specifications for ${engine.name}. Printable fastener torque values for all engine components.`,
    keywords: [
      `${engine.name} torque specs`,
      `${engine.brand} torque`,
      'engine torque specifications',
      'fastener torque values',
    ],
    openGraph: {
      title: `${engine.name} Torque Specifications`,
      description: `Complete torque specifications for ${engine.name}. Print for your build.`,
      type: 'website',
      url: `https://gokartpartpicker.com/engines/${slug}/torque-specs`,
    },
    alternates: {
      canonical: `https://gokartpartpicker.com/engines/${slug}/torque-specs`,
    },
  };
}

export default async function EngineTorqueSpecsPage({ params }: TorqueSpecsPageProps) {
  const { slug } = await params;
  const result = await getEngineBySlug(slug);
  
  if (!result.success) {
    notFound();
  }
  
  const engine = result.data;
  const specs = getTorqueSpecs(slug);
  
  if (!specs) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl text-cream-100 mb-4">Torque Specifications Not Available</h1>
          <p className="text-cream-400 mb-6">
            Torque specifications are not yet available for {engine.name}.
          </p>
          <Link href={`/engines/${slug}`}>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Engine
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-olive-900 flex items-center justify-center"><div className="text-cream-400">Loading...</div></div>}>
      <EngineTorqueSpecsView engine={engine} specs={specs} />
    </Suspense>
  );
}
