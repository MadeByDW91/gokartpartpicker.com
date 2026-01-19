import { notFound } from 'next/navigation';
import { VideoForm } from '@/components/admin/VideoForm';
import { getAdminVideos } from '@/actions/admin/videos';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: PageProps) {
  const { id } = await params;
  
  const result = await getAdminVideos({});
  if (!result.success || !result.data) {
    notFound();
  }
  
  const video = result.data.find(v => v.id === id);
  if (!video) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cream-100">Edit Video</h1>
        <p className="text-cream-400 mt-1">{video.title}</p>
      </div>
      
      <VideoForm 
        video={video}
        mode="edit"
      />
    </div>
  );
}
