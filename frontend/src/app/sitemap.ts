import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gokartpartpicker.com';
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/builder`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/engines`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/parts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic engine pages
  const { data: engines } = await supabase
    .from('engines')
    .select('slug, updated_at')
    .eq('is_active', true);

  const enginePages: MetadataRoute.Sitemap = (engines || []).map((engine: { slug: string; updated_at: string | null }) => ({
    url: `${baseUrl}/engines/${engine.slug}`,
    lastModified: engine.updated_at ? new Date(engine.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic part pages
  const { data: parts } = await supabase
    .from('parts')
    .select('slug, updated_at')
    .eq('is_active', true);

  const partPages: MetadataRoute.Sitemap = (parts || []).map((part: { slug: string; updated_at: string | null }) => ({
    url: `${baseUrl}/parts/${part.slug}`,
    lastModified: part.updated_at ? new Date(part.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic guide pages (content uses is_published, not is_active)
  const { data: guides } = await supabase
    .from('content')
    .select('slug, updated_at')
    .eq('content_type', 'guide')
    .eq('is_published', true);

  const guidePages: MetadataRoute.Sitemap = (guides || []).map((guide: { slug: string; updated_at: string | null }) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: guide.updated_at ? new Date(guide.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic motor pages (electric go-kart motors)
  const { data: motors } = await supabase
    .from('electric_motors')
    .select('slug, updated_at')
    .eq('is_active', true);

  const motorPages: MetadataRoute.Sitemap = (motors || []).map((motor: { slug: string; updated_at: string | null }) => ({
    url: `${baseUrl}/motors/${motor.slug}`,
    lastModified: motor.updated_at ? new Date(motor.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...enginePages, ...partPages, ...guidePages, ...motorPages];
}
