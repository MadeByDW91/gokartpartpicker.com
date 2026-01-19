import { VideoForm } from '@/components/admin/VideoForm';

interface PageProps {
  searchParams: Promise<{ engine_id?: string; part_id?: string }>;
}

export default async function NewVideoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cream-100">Add New Video</h1>
        <p className="text-cream-400 mt-1">Create a new educational video</p>
      </div>
      
      <VideoForm 
        mode="create"
        initialEngineId={params.engine_id}
        initialPartId={params.part_id}
      />
    </div>
  );
}
